"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";
import { Prisma } from "@prisma/client";

// --- TYPE DEFINITIONS ---
// Define types based on your Prisma schema for type safety.
// Assuming schema.prisma has: enum TransactionType { INCOME EXPENSE }
type TransactionType = "INCOME" | "EXPENSE";

// Define a type for the function's return value for consistency.
type SeedResult = {
  success: boolean;
  message?: string;
  error?: string;
};

// Define the structure for a category item.
interface CategoryItem {
  name: string;
  range: [number, number];
}

// --- CONSTANTS ---
// Replace these with actual IDs from your development database.
const ACCOUNT_ID = "4fdbcc2c-305b-4649-837a-ea564727a8d4";
const USER_ID = "53110e47-6e44-48b5-ac4d-1e9710040338";

// Strongly type the CATEGORIES object.
const CATEGORIES: Record<TransactionType, CategoryItem[]> = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// --- HELPER FUNCTIONS ---
// Helper to generate a random amount within a range.
function getRandomAmount(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get a random category with its amount.
function getRandomCategory(type: TransactionType): { category: string; amount: number } {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

// --- MAIN SEEDING FUNCTION ---
export async function seedTransactions(): Promise<SeedResult> {
  try {
    const transactions: Prisma.TransactionCreateManyInput[] = [];
    let totalBalance = 0;

    // Generate transactions for the last 90 days.
    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% chance of income, 60% chance of expense.
        const type: TransactionType = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        transactions.push({
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        });

        totalBalance += type === "INCOME" ? amount : -amount;
      }
    }

    // Use a database transaction to ensure all operations succeed or none do.
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Clear existing transactions for this specific account.
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      // Insert the newly generated transactions.
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update the account's balance with the calculated total.
      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions and updated account balance.`,
    };
  } catch (error: unknown) {
    console.error("Error seeding transactions:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred." };
  }
}