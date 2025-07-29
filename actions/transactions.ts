"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteTransaction(transactionId) {
    try {
           const { userId } = await auth();
                if (!userId) throw new Error("Unauthorized");
                
                const user = await db.user.findUnique({
                            where: {
                                clerkUserId: userId
                            }
                })
                
                if (!user) throw new Error("User Not Found");

                await db.transaction.delete({
                      where: { userId: user.id, id: transactionId },
                })

                revalidatePath("/account");
                return {sucess: true};
    } catch (error) {
        return {success: false, error: error.message}
    }
    
}