"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client"; // Import Prisma for Decimal type
import { transactionSchema } from "@/lib/schema";
import { aj } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import {GoogleGenerativeAI} from "@google/generative-ai"
import { defaultCategories } from "@/data/categories";

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
export async function createTransaction(data: any) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error("User Not Found");

    const req = await request()

    const decision = await aj.protect(req, {
  userId: clerkUserId,
  requested: 1,
});

if (decision.isDenied()) {
  if (decision.reason?.isRateLimit?.()) {
    const { remaining, reset } = decision.reason;
    const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000);

    return {
      success: false,
      error: `Rate limit exceeded. Please try again in ${secondsUntilReset} second(s).`,
    };
  }

  // Generic denial reason fallback
  return {
    success: false,
    error: "Request denied due to suspicious activity or abuse prevention.",
  };
}

console.log("PASSED ARCJET")

    // Validate the data using your schema
    const validatedData = transactionSchema.parse(data);

    // Check if the account exists and belongs to the user
    const account = await db.account.findFirst({
      where: { 
        id: validatedData.accountId,
        userId: user.id,
      },
    });
    if (!account) throw new Error("Account not found or access denied");

    // Convert amount string to Decimal
    const amount = new Prisma.Decimal(validatedData.amount);
    
    // Calculate balance change (EXPENSE = negative, INCOME = positive)
    const balanceChange = validatedData.type === "EXPENSE" ? amount.negated() : amount;

    const transaction = await db.$transaction(async (tx) => {
      // Create the transaction
      const newTransaction = await tx.transaction.create({
        data: {
          type: validatedData.type,
          amount: amount,
          description: validatedData.description || null,
          date: validatedData.date,
          category: validatedData.category,
          isRecurring: validatedData.isRecurring,
          recurringInterval: validatedData.recurringInterval || null,
          nextRecurringDate: validatedData.isRecurring && validatedData.recurringInterval
            ? calculateNextRecurringDate(validatedData.date, validatedData.recurringInterval)
            : null,
          userId: user.id,
          accountId: validatedData.accountId,
        },
      });

      // Update the account balance
      await tx.account.update({
        where: { id: validatedData.accountId },
        data: { 
          balance: {
            increment: balanceChange
          }
        },
      });

      return newTransaction;
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath(`/account/${validatedData.accountId}`);

    return { 
      success: true, 
      transaction: JSON.parse(JSON.stringify(transaction, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
    };

  } catch (error) {
    console.error("Create transaction error:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "An unexpected error occurred while creating the transaction",
    };
  }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

   const prompt = `
You are a financial assistant AI analyzing a **receipt image**.

Extract and return **only** the following fields in **valid JSON format**. Do not include any commentary, markdown, or formatting outside the JSON. The response must be a single JSON object.

Required fields:
- amount: (final total amount on the receipt as a number or decimal)
-type: (either income or an expense)
- date: (purchase date in ISO 8601 format, e.g., "2024-01-01T00:00:00.000Z")
- description: (a brief summary of what was purchased, e.g., "Grocery items" or "Mobile accessories")
- merchant: (store or seller name, if visible)
- suggested_category: (one of: ${defaultCategories.map(category => category.name).join(", ")})

If a field is not present or unclear, return an empty string or 0 (for amount). Do not invent values.

Return only:
{
  "amount": 0,
  "type": "" (INCOME | EXPENSE)
  "date": "2024-01-01T00:00:00.000Z",
  "description": "",
  "merchant": "",
  "category": ""
}
`;


    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type || "image/png",
                data: base64String,
              },
            },
          ],
        },
      ],
    });


    
    const response = await result.response;
    const text = response.text();

    // Clean the response to ensure it's valid JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Failed to find a valid JSON object in the AI response.");
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    
    const parsedJson = JSON.parse(jsonString);
    return { success: true, data: parsedJson };


  } catch (error) {
    console.error("Receipt scan failed:", error);
    return "Sorry, we couldn't process the receipt.";
  }
}


/**
 * Calculate the next recurring date from a given start date and interval
 * @param {Date | string} startDate - The base date to calculate from
 * @param {string} interval - One of: "DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"
 * @returns {Date} - The next recurring date
 */
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate); // use passed date instead of current
  if (isNaN(date)) throw new Error("Invalid startDate");

  switch (interval.toUpperCase()) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;

    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;

    case "BIWEEKLY":
      date.setDate(date.getDate() + 14);
      break;

    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;

    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;

    default:
      throw new Error(`Unsupported interval: ${interval}`);
  }

  return date;
}
