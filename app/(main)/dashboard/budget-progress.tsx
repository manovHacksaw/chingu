"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useFetch } from "@/hooks/use-fetch";
import { updateBudget } from "@/actions/budget";
import { toast } from "sonner";

interface BudgetProgressProps {
  initialBudget: { amount: number } | null;
  currentExpenses: number;
}

const BudgetProgress = ({
  initialBudget,
  currentExpenses,
}: BudgetProgressProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount.toString() || ""
  );
  const [localBudget, setLocalBudget] = useState(initialBudget?.amount || 0);

  const { fn: updateBudgetFn, loading: updateBudgetLoading } = useFetch(
    async (newAmountStr: string) => {
      const amount = parseFloat(newAmountStr);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid budget amount");

      const result = await updateBudget(amount); // Must be server action
      return result;
    }
  );

  const percentageUsed =
    localBudget > 0
      ? Math.min((currentExpenses / localBudget) * 100, 100)
      : 0;

  const handleSave = async () => {
    try {
      await updateBudgetFn(newBudget);
      setLocalBudget(parseFloat(newBudget));
      toast.success("Budget updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update budget");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Monthly Budget</CardTitle>
        <p className="text-muted-foreground text-sm">Default Account</p>
        <CardDescription>
          Track your spending against your monthly limit
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Used: ${currentExpenses.toFixed(2)} / ${localBudget.toFixed(2)}
        </div>

        <Progress value={percentageUsed} className="h-3" />

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={updateBudgetLoading}
          >
            Edit Budget
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              placeholder="Enter new budget amount"
              disabled={updateBudgetLoading}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateBudgetLoading}
              >
                {updateBudgetLoading ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setNewBudget(localBudget.toString());
                }}
                disabled={updateBudgetLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        {percentageUsed >= 100
          ? "You've hit your budget!"
          : `${percentageUsed.toFixed(1)}% of your budget used`}
      </CardFooter>
    </Card>
  );
};

export default BudgetProgress;
