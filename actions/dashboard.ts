"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

type Account = {
  balance?: { toNumber: () => number };
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
};

const serializeAccount = (obj: Account) => {
  return {
    ...obj,
    balance: obj.balance?.toNumber(),
    createdAt: obj.createdAt?.toISOString(),
    updatedAt: obj.updatedAt?.toISOString(),
  };
};

type CreateAccountData = {
    balance: string ;
    isDefault?: boolean;
    [key: string]: any;
};

export async function createAccount(data: CreateAccountData) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })

        if (!user) throw new Error("User Not Found");

        // Convert balance to float
        const balanceInFloat = parseFloat(data.balance)
        if (isNaN(balanceInFloat)) {
            throw new Error("Invalid balance amount")
        }

        const existingAccounts = await db.account.findMany({
            where: {
                userId: user.id
            }
        })

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

        // If this should be default, make all other accounts non-default
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false },
            })
        }

        const account = await db.account.create({
            data: {
                ...data, 
                balance: balanceInFloat, 
                userId: user.id, 
                isDefault: shouldBeDefault
            }
        })

        const serializedAccount = serializeAccount(account);
        revalidatePath("/dashboard");

        return { success: true, data: serializedAccount };

    } catch (error: unknown) {
         if (error instanceof Error) {
    throw new Error(error.message);
  } else {
    console.error("Unknown error", error);
  }
    }
}

export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });
    if (!user) throw new Error("User Not Found");

    const userAccounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });

    // const serializedAccounts = userAccounts.map(serializeAccount);
    console.log(userAccounts)

    return    JSON.parse(JSON.stringify(userAccounts)) ;

  } catch (error: unknown) {
     if (error instanceof Error) {
    throw new Error(error.message); // safe
  } else {
    console.error("Unknown error", error);
  }
  }
}


export async function getDashboardData() {
  try {
      const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });
    if (!user) throw new Error("User Not Found");

    const transactions = await db.transaction.findMany({
      where: {userId: user.id},
      orderBy: {date: "desc"},
    })

    return JSON.parse(JSON.stringify(transactions))
  } catch (error) {
    
  }
  
}