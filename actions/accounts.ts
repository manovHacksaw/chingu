"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateDefaultAccount(accountId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    // find the other account that is set to default

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const defaultAccount = await db.account.update({
      where: {
        userId: user.id,
        id: accountId,
      },
      data: {
        isDefault: true,
      },
    });

    const serializedAccount = JSON.parse(JSON.stringify(defaultAccount));

    revalidatePath("/dashboard");

    return { success: true, data: serializedAccount };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAccountWithTransactions(accountId: string): Promise<any | null> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) return null;
    console.log("ACCOUNT WITH TRANSACTIONS ", account);
    return JSON.parse(JSON.stringify(account));
  } catch (error) {
    return null;
  }
}
