"use client";

import { transactionSchema } from "@/lib/schemas/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { Account, RecurringInterval, TransactionType } from "@prisma/client";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTransaction } from "@/actions/transactions";

// A simple component to display form errors
const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-sm font-medium text-red-500">{message}</p>;
};

interface TransactionFormProps {
  accounts: Account[];
}

export const TransactionForm = ({ accounts }: TransactionFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: TransactionType.EXPENSE,
      amount: 0,
      description: "",
      date: new Date(),
      category: "",
      accountId: accounts.find(acc => acc.isDefault)?.id || accounts[0]?.id,
      isRecurring: false,
    },
  });

  const isRecurring = form.watch("isRecurring");

  const onSubmit = (values: z.infer<typeof transactionSchema>) => {
    setError("");
    startTransition(async () => {
      const result = await createTransaction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Transaction Type */}
        <div>
          <label className="text-sm font-medium">Type</label>
          <div className="flex gap-4 mt-2">
            {(Object.keys(TransactionType) as Array<keyof typeof TransactionType>).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...form.register("type")}
                  value={type}
                  className="h-4 w-4"
                  checked={form.watch("type") === type}
                />
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
          {form.formState.errors.type && (
            <FormError message={form.formState.errors.type.message} />
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...form.register("amount")}
            disabled={isPending}
            placeholder="0.00"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          />
          {form.formState.errors.amount && (
            <FormError message={form.formState.errors.amount.message} />
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <input
            id="category"
            {...form.register("category")}
            disabled={isPending}
            placeholder="e.g., Groceries, Salary"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          />
          {form.formState.errors.category && (
            <FormError message={form.formState.errors.category.message} />
          )}
        </div>
        
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            type="date"
            {...form.register("date")}
            disabled={isPending}
            defaultValue={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          />
          {form.formState.errors.date && (
            <FormError message={form.formState.errors.date.message} />
          )}
        </div>

        {/* Account */}
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium">
            Account
          </label>
          <select
            id="accountId"
            {...form.register("accountId")}
            disabled={isPending || accounts.length === 0}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          >
            {accounts.length === 0 && <option>No accounts found</option>}
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {form.formState.errors.accountId && (
            <FormError message={form.formState.errors.accountId.message} />
          )}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description (Optional)
          </label>
          <textarea
            id="description"
            {...form.register("description")}
            disabled={isPending}
            placeholder="Add a note..."
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          />
          {form.formState.errors.description && (
            <FormError message={form.formState.errors.description.message} />
          )}
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center gap-4">
          <input
            id="isRecurring"
            type="checkbox"
            {...form.register("isRecurring")}
            disabled={isPending}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor="isRecurring" className="text-sm font-medium">
            Is this a recurring transaction?
          </label>
        </div>

        {/* Recurring Interval (Conditional) */}
        {isRecurring && (
          <div>
            <label htmlFor="recurringInterval" className="block text-sm font-medium">
              Frequency
            </label>
            <select
              id="recurringInterval"
              {...form.register("recurringInterval")}
              disabled={isPending}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            >
              <option value="">Select frequency</option>
              {(Object.keys(RecurringInterval) as Array<keyof typeof RecurringInterval>).map((interval) => (
                <option key={interval} value={interval}>
                  {interval.charAt(0) + interval.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {form.formState.errors.recurringInterval && (
              <FormError message={form.formState.errors.recurringInterval.message} />
            )}
          </div>
        )}
      </div>

      <FormError message={error} />
      
      <button
        type="submit"
        disabled={isPending}
        className="w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Transaction"}
      </button>
    </form>
  );
};