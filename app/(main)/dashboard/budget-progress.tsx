"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, TrendingDown, DollarSign, Edit3, Save, X } from "lucide-react"
import { useFetch } from "@/hooks/use-fetch"
import { updateBudget } from "@/actions/budget"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { TooltipTrigger } from "@radix-ui/react-tooltip"

interface BudgetProgressProps {
  initialBudget: { amount: number } | null
  currentExpenses: number
  accounts: any[]
  transactions: any[]
}

const BudgetProgress = ({ initialBudget, currentExpenses, accounts, transactions }: BudgetProgressProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newBudget, setNewBudget] = useState(initialBudget?.amount.toString() || "")
  const [localBudget, setLocalBudget] = useState(initialBudget?.amount || 0)

  const { fn: updateBudgetFn, loading: updateBudgetLoading } = useFetch(async (newAmountStr: string) => {
    const amount = Number.parseFloat(newAmountStr)
    if (Number.isNaN(amount) || amount <= 0) throw new Error("Invalid budget amount")

    const result = await updateBudget(amount)
    return result
  })

  const percentageUsed = localBudget > 0 ? Math.min((currentExpenses / localBudget) * 100, 100) : 0
  const remaining = Math.max(localBudget - currentExpenses, 0)
  const isOverBudget = currentExpenses > localBudget

  // Calculate category breakdown for current month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const categoryBreakdown = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        t.type === "EXPENSE"
      )
    })
    .reduce(
      (acc, transaction) => {
        const category = transaction.category || "Other"
        acc[category] = (acc[category] || 0) + Number.parseFloat(transaction.amount)
        return acc
      },
      {} as Record<string, number>,
    )

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 4)

  const handleSave = async () => {
    try {
      await updateBudgetFn(newBudget)
      setLocalBudget(Number.parseFloat(newBudget))
      toast.success(" Budget updated successfully!", {
        description: "Your monthly budget has been updated.",
      })
      setIsEditing(false)
    } catch (err: any) {
      toast.error("Failed to update budget", {
        description: err?.message || "Please try again.",
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setNewBudget(localBudget.toString())
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 h-fit">
      <CardHeader className="bg-gradient-to-r from-chingu-lavender-100 to-chingu-sky-100 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-chingu-lavender-400 to-chingu-sky-400 rounded-2xl flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <div className="text-left">
              <CardTitle className="text-gray-800">Monthly Budget</CardTitle>
              <CardDescription className="text-gray-600">Track your spending progress</CardDescription>
            </div>
          </div>
          {!isEditing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   < Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-xl hover:bg-white/10 cursor-pointer"
              
            >
              <Edit3 className="h-4 w-4" />
            </Button>
                </TooltipTrigger>
                <TooltipContent
      className="bg-muted text-foreground px-3 py-1 text-sm rounded-md shadow-md"
    >
      Edit your budget
    </TooltipContent>
               
              </Tooltip>
             
            </TooltipProvider>
            
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Budget Amount Section */}
        {!isEditing ? (
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-gray-800">${localBudget.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Monthly Budget</p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">New Budget Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="number"
                step="0.01"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="Enter budget amount"
                disabled={updateBudgetLoading}
                className="pl-10 rounded-2xl border-chingu-peach-200 focus:border-chingu-peach-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
    <div className="flex gap-2">
  <Button
    size="sm"
    onClick={handleSave}
    disabled={updateBudgetLoading}
    className={`flex-1 text-white rounded-2xl transition-colors ${
      updateBudgetLoading
        ? "bg-gray-600 cursor-not-allowed"
        : "bg-gray-900 hover:bg-gray-700"
    }`}
  >
    {updateBudgetLoading ? (
      <>
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        Saving...
      </>
    ) : (
      <>
        <Save className="h-4 w-4 mr-2" />
        Save
      </>
    )}
  </Button>

  <Button
    size="sm"
    variant="outline"
    onClick={handleCancel}
    disabled={updateBudgetLoading}
    className={`rounded-2xl border border-gray-400 transition-colors ${
      updateBudgetLoading
        ? "text-gray-400 cursor-not-allowed"
        : "hover:bg-gray-100 text-black"
    }`}
  >
    <X className="h-4 w-4" />
  </Button>
</div>


          </div>
        )}

        {/* Progress Section */}
        <div className="space-y-4">
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">Spent this month</span>
    <span className="font-semibold text-gray-800">${currentExpenses.toFixed(2)}</span>
  </div>

 <div className="relative">
  <Progress
    value={Math.min(percentageUsed, 100)}
    className="h-4 rounded-full bg-gray-200 [&>div]:bg-transparent [&>div]:hidden"
  />
  
  {/* Your custom fill */}
  <div
    className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-500 ${
      percentageUsed <= 30
        ? "bg-gradient-to-r from-green-300 to-yellow-300"
        : percentageUsed <= 75
        ? "bg-gradient-to-r from-yellow-300 to-red-300"
        : "bg-gradient-to-r from-red-400 to-pink-400"
    }`}
    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
  />
</div>

  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      {isOverBudget ? (
        <TrendingUp className="h-4 w-4 text-red-500" />
      ) : (
        <TrendingDown className="h-4 w-4 text-emerald-500" />
      )}
      <span className={`text-sm font-medium ${isOverBudget ? "text-red-600" : "text-emerald-600"}`}>
        {isOverBudget
          ? `$${(currentExpenses - localBudget).toFixed(2)} over budget`
          : `$${remaining.toFixed(2)} remaining`}
      </span>
    </div>

    {/* Badge Based on % Used */}
    <Badge
      className={`rounded-full border-0 ${
        percentageUsed <= 30
          ? "bg-gradient-to-r from-green-100 to-yellow-100 text-yellow-700"
          : percentageUsed <= 75
          ? "bg-gradient-to-r from-yellow-100 to-red-100 text-red-700"
          : "bg-gradient-to-r from-red-200 to-pink-200 text-red-700"
      }`}
    >
      {percentageUsed.toFixed(1)}% used
    </Badge>
  </div>
</div>


        {/* Category Breakdown */}
        {topCategories.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Top Spending Categories</h4>
            <div className="space-y-3">
              {topCategories.map(([category, amount], index) => {
                const amt = amount as number
                const categoryPercentage = localBudget > 0 ? (amt / localBudget) * 100 : 0
                const colors = [
                  "from-red-300 to-pink-300",
                  "from-blue-300 to-cyan-300",
                  "from-purple-300 to-pink-300",
                  "from-green-300 to-emerald-300",
                ]

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium capitalize">{category}</span>
                      <span className="font-semibold text-gray-800">${amt.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${colors[index]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-gray-500 bg-gradient-to-r from-chingu-peach-50 to-chingu-mint-50 rounded-b-3xl">
        {isOverBudget
          ? "⚠️ You've exceeded your monthly budget!"
          : percentageUsed > 80
            ? "⚡ You're approaching your budget limit"
            : "✨ You're doing great with your budget!"}
      </CardFooter>
    </Card>
  )
}

export default BudgetProgress
