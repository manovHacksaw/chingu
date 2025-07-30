import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";

import DynamicEmail from "@/emails/template";

/**
 * This scheduled function checks every 6 hours whether a user has spent
 * 80% or more of their monthly budget, and if so, logs a warning and updates
 * the `lastAlertSent` to avoid sending repeated alerts within the same month.
 */
export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alert" },
  { cron: "0 */6 * * *" }, // Runs every 6 hours
  async ({ step }) => {
    
    // Step 1: Fetch all budgets with their users and default accounts
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true } // Only fetch the user's default account
              }
            }
          }
        }
      });
    });

    // Step 2: Loop through each budget to check expense usage
    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; // Skip if no default account exists

      const accountId = defaultAccount.id;
      const userId = budget.user.id;

      // Step 3: Check spending for this account in the current month
      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Aggregate total expenses for the current month
        const expenses = await db.transaction.aggregate({
          where: {
            userId,
            type: "EXPENSE",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            accountId
          },
          _sum: {
            amount: true
          }
        });

        // Step 4: Calculate how much has been spent and what % of the budget is used
        const spent = Number(expenses._sum.amount) || 0;
        const limit = Number(budget.amount) || 0;
        if (limit === 0) return; // Skip if budget is not set

        const percentUsed = (spent / limit) * 100;

        // Step 5: If usage >= 80% AND no alert has been sent this month, alert user
        const shouldSendAlert =
          percentUsed >= 80 &&
          (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), currentDate));

        if (shouldSendAlert) {
          // Log the alert (you can replace this with email/webhook later)
          console.log(
            `⚠️ User ${userId} has used ${percentUsed.toFixed(1)}% of their monthly budget.`
          );

          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: DynamicEmail({
                userName: budget.user.name,
                type: "budget-alert",
                data: {percentUsed, limit, spent, accountName: defaultAccount.name}

            })

          })

          // Step 6: Update lastAlertSent in the DB to prevent duplicate alerts this month
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() }
          });
        }
      });
    }
  }
);

/**
 * Utility function to check if a date (last alert) is in a previous month.
 * Prevents multiple alerts within the same calendar month.
 */
function isNewMonth(lastAlertSent: Date, currentDate: Date): boolean {
  return (
    lastAlertSent.getMonth() !== currentDate.getMonth() ||
    lastAlertSent.getFullYear() !== currentDate.getFullYear()
  );
}
