"use client";

import { updateDefaultAccount } from "@/actions/accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useFetch } from "@/hooks/use-fetch";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner"; // 👈 Make sure this is installed and configured

export const UserAccounts = ({ accounts }) => {
  const [accountList, setAccountList] = useState(accounts);
  const { loading: updateDefaultLoading, fn: updateDefaultFn, error } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (accountId, isAlreadyDefault) => {
    if (isAlreadyDefault) {
      toast.warning("This account is already the default");
      return;
    }

    try {
      const updated = await updateDefaultFn(accountId);

      if (updated?.success) {
        toast.success("Default account updated");

        const updatedAccounts = accountList.map((acc) => ({
          ...acc,
          isDefault: acc.id === accountId,
        }));
        setAccountList(updatedAccounts);
      } else {
        toast.error("Failed to update default account");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <>
      {accountList.map((account) => (
        <Card key={account.id}>
          <Link href={`/account/${account.id}`}>
            <CardHeader>
              <CardTitle>{account.name}</CardTitle>
              <Switch
                checked={account.isDefault}
                onClick={(e) => {
                  e.preventDefault();
                  handleDefaultChange(account.id, account.isDefault);
                }}
                disabled={updateDefaultLoading}
              />
            </CardHeader>
          </Link>
          <CardContent>
            <div>${parseFloat(account.balance).toFixed(2)}</div>
            <p className="capitalize">
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
