"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client"; // Import Prisma for Decimal type

// --- SINGLE DELETE ---
export async function deleteTransaction(transactionId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error("User Not Found");

    // We must perform these operations in a transaction to ensure data integrity
    await db.$transaction(async (tx) => {
      // 1. Find the transaction to get its details (amount, type, accountId)
      const transaction = await tx.transaction.findFirst({
        where: {
          id: transactionId,
          userId: user.id,
        },
      });

      if (!transaction) {
        throw new Error("Transaction not found or you lack permission to delete it.");
      }

      // 2. Update the associated account's balance
      await tx.account.update({
        where: {
          id: transaction.accountId,
        },
        data: {
          balance: {
            // If deleting an INCOME, DECREASE balance.
            // If deleting an EXPENSE, INCREASE balance.
            [transaction.type === 'INCOME' ? 'decrement' : 'increment']: transaction.amount,
          },
        },
      });

      // 3. Finally, delete the transaction itself
      await tx.transaction.delete({
        where: {
          id: transaction.id,
        },
      });
    });

    revalidatePath("/transactions"); // Or your primary dashboard path
    revalidatePath("/");
    return { success: true };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

// --- BULK DELETE ---
export async function bulkDeleteTransaction(transactionIds: string[]) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error("User Not Found");

    await db.$transaction(async (tx) => {
      // 1. Find all transactions to be deleted that belong to the user
      const transactionsToDelete = await tx.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      if (transactionsToDelete.length !== transactionIds.length) {
        throw new Error("Some transactions could not be found or you don't have permission.");
      }
      
      // 2. Calculate the net balance change for each affected account
      const accountBalanceChanges = transactionsToDelete.reduce((acc, transaction) => {
        // Deleting EXPENSE increases balance, deleting INCOME decreases balance.
        const change = transaction.type === 'EXPENSE' ? transaction.amount : new Prisma.Decimal(transaction.amount).negated();
        
        if (!acc[transaction.accountId]) {
          acc[transaction.accountId] = new Prisma.Decimal(0);
        }
        acc[transaction.accountId] = acc[transaction.accountId].plus(change);
        
        return acc;
      }, {} as Record<string, Prisma.Decimal>);

      // 3. Apply the aggregated balance changes to each account
      for (const accountId in accountBalanceChanges) {
        await tx.account.update({
          where: {
            id: accountId,
            userId: user.id, // Extra security check
          },
          data: {
            balance: {
              increment: accountBalanceChanges[accountId],
            },
          },
        });
      }

      // 4. Delete all the transactions at once
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });
    });

    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}