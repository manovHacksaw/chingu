import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import DynamicEmail from "@/emails/template";
import { includes } from "zod";

/**
 * A utility function to check if a date (last alert) is in a previous month.
 * This prevents sending multiple budget alerts within the same calendar month.
 * 
 * 
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro", // A fast and capable model
  generationConfig: {
    responseMimeType: "application/json", // Enable JSON Mode
  },
});
function isNewMonth(lastAlertSent: Date, currentDate: Date): boolean {
  return (
    lastAlertSent.getMonth() !== currentDate.getMonth() ||
    lastAlertSent.getFullYear() !== currentDate.getFullYear()
  );
}

/**
 * A utility function to calculate the next date for a recurring event based on an interval.
 */
function getNextRecurringDate(from: Date, interval: string | null): Date | null {
  if (!interval) return null;

  const date = new Date(from);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return date;
}


/**
 * =================================================================
 * INNGEST FUNCTION 1: Check Budget Alert (Scheduled)
 * =================================================================
 * This scheduled function runs every 6 hours. It checks if a user has spent
 * 80% or more of their monthly budget. If so, it sends an email alert and
 * updates the `lastAlertSent` timestamp to avoid sending repeated alerts
 * within the same month.
 */
export const checkBudgetAlert = inngest.createFunction(
  { id: "check-budget-alert", name: "Check Budget Alert" },
  { cron: "0 */6 * * *" }, // Runs every 6 hours
  async ({ step }) => {
    
    // Step 1: Fetch all budgets, including user and their default account details.
    const budgets = await step.run("fetch-all-budgets", async () => {
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

    // Step 2: Loop through each budget to check its expense usage.
    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; // Skip if no default account is configured.

      const accountId = defaultAccount.id;
      const userId = budget.user.id;

      // Step 3: Check spending for this account in the current calendar month.
      await step.run(`check-spending-for-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Aggregate total expenses within the date range for the user's default account.
        const expenses = await db.$transaction.aggregate({
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

        // Step 4: Calculate the percentage of the budget that has been used.
        const spent = Number(expenses._sum.amount) || 0;
        const limit = Number(budget.amount) || 0;
        if (limit === 0) return; // Skip if budget amount is zero.

        const percentUsed = (spent / limit) * 100;

        // Step 5: Determine if an alert should be sent.
        // An alert is sent if usage is >= 80% AND no alert has been sent in the current month.
        const shouldSendAlert =
          percentUsed >= 80 &&
          (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), currentDate));

        if (shouldSendAlert) {
          // Log the alert for monitoring purposes.
          console.log(
            `⚠️ Alert: User ${userId} has used ${percentUsed.toFixed(1)}% of their monthly budget.`
          );

          // Send a dynamic email to the user.
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: DynamicEmail({
                userName: budget.user.name,
                type: "budget-alert",
                data: {percentUsed, limit, spent, accountName: defaultAccount.name}
            })
          });

          // Step 6: Update the `lastAlertSent` timestamp in the database.
          // This prevents sending another alert to the user until the next month.
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
 * =================================================================
 * INNGEST FUNCTION 2: Trigger Recurring Transactions (Scheduled)
 * =================================================================
 * This scheduled function runs daily at midnight. It finds all "template"
 * recurring transactions that are due to be created and creates a new,
 * separate transaction with a 'PENDING' status for the user to approve.
 */
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Run every day at midnight
  async ({ step }) => {
    const today = new Date();

    // Fetch all 'COMPLETED' transactions that are marked as recurring templates
    // and are due to be processed today (or are overdue).
    const recurringTxTemplates = await step.run("fetch-due-recurring-transactions", async () => {
      return db.$transaction.findMany({
        where: {
          isRecurring: true,
          status: "COMPLETED", // These are the original templates
          OR: [
            { nextRecurringDate: { lte: today } },
            { nextRecurringDate: null }, // For templates that have never run
          ]
        }
      });
    });

    // Create a new pending transaction for each due template.
    for (const template of recurringTxTemplates) {
      await step.run(`create-pending-transaction-for-${template.id}`, async () => {
        
        // Create a new transaction instance based on the template.
        // It's set to 'PENDING' and linked back to the original template.
        await db.$transaction.create({
          data: {
            type: template.type,
            amount: template.amount,
            description: template.description,
            date: today,
            category: template.category,
            receiptUrl: template.receiptUrl,
            userId: template.userId,
            accountId: template.accountId,
            status: "PENDING", // This new transaction requires user action
            
            // Link this new instance back to its template
            isRecurring: false, // This instance itself does not generate others
            recurringTemplateId: template.id, 
          },
        });

        // We will update the template's nextRecurringDate only after this
        // pending transaction is processed by the user, using the
        // 'processRecurringTransactions' function below.
      });
    }
  }
);


/**
 * =================================================================
 * INNGEST FUNCTION 3: Process Recurring Transaction (Event-Driven)
 * =================================================================
 * This function is triggered by an event, `transaction.recurring.process`,
 * which should be sent when a user approves a pending recurring transaction.
 * It marks the transaction as 'COMPLETED' and updates the original template
 * with the next recurring date.
 */
export const processRecurringTransactions = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    // Throttling prevents a user from overwhelming the system.
    // Limits to 10 events per minute for any given user.
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId"
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // The event payload should contain the necessary IDs.
    const { transactionId, recurringTemplateId, recurringInterval, userId } = event.data;

    if (!transactionId || !recurringTemplateId || !recurringInterval) {
        console.error("Invalid event payload. Missing required IDs.", event.data);
        return;
    }

    // Step 1: Finalize the pending transaction by marking it as 'COMPLETED'.
    await step.run(`complete-transaction-${transactionId}`, async () => {
      return db.$transaction.update({
        where: { id: transactionId },
        data: { 
            status: "COMPLETED",
            date: new Date(), // Set the completion date to now
        },
      });
    });

    // Step 2: Calculate the next due date for the original template.
    const nextDate = getNextRecurringDate(new Date(), recurringInterval);

    // Step 3: Update the original template with the new `nextRecurringDate`.
    // This ensures it will be picked up again by the `triggerRecurringTransactions` function
    // in the next cycle.
    await step.run(`update-template-${recurringTemplateId}`, async () => {
      return db.$transaction.update({
        where: { id: recurringTemplateId },
        data: {
          lastProcessed: new Date(),
          nextRecurringDate: nextDate,
        },
      });
    });

    console.log(`Successfully processed recurring transaction ${transactionId} for user ${userId}.`);
  }
);



export const generateMonthltReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Genrate Montly Reports",
  },
  {cron: "0 0 1 *  *"},
  async({step})=>{
    const users = await step.run("fetch-users", async() =>{
      return await db.user.findMany({
        include: {accounts: true},
      })
    })
    
  
    for (const user of users){
      await step.run(`generate-report-${user.id}`, async()=>{
        const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1); 

        const stats = await getMonthlyStats(user.id, lastMonth) ;

        const monthName = lastMonth.toLocaleString("default", {
          month: "long"
        })

        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: DynamicEmail({
            userName: user.name,
            type: "monthly-report",
            data:{
                stats,
                month: monthName,
                insights
            }
          })
        })
      })
    }
  }
)



export async function getMonthlyStats(userId: string, month: Date) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // FIX: Corrected typos from `totalExpense` and `byCatgeory`
  return transactions.reduce(
    (stats, t) => {
      const amount = Number(t.amount);
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {} as Record<string, number>,
      transactionCount: transactions.length,
    }
  );
}

export function getRuleBasedFinancialInsights(stats: Awaited<ReturnType<typeof getMonthlyStats>>, monthName: string) {
  // ... (the original logic from your `generateFinancialInsights` function)
  const { totalIncome, totalExpenses, byCategory } = stats;
  const netSavings = totalIncome - totalExpenses;
  const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

  let summary = `In ${monthName}, your financial activity included a total income of ₹${totalIncome.toFixed(2)} and total expenses of ₹${totalExpenses.toFixed(2)}.`;
  let topCategoryInsight = "No expenses were recorded this month.";
  if (topCategory) {
    topCategoryInsight = `Your highest spending was in the '${topCategory[0]}' category, amounting to ₹${topCategory[1].toFixed(2)}.`;
  }
  let savingsInsight = `This resulted in a net saving of ₹${netSavings.toFixed(2)}. Keep up the great work! 👍`;
  if (netSavings < 0) {
    savingsInsight = `Your expenses exceeded your income by ₹${Math.abs(netSavings).toFixed(2)}. It might be a good time to review your spending habits.`;
  }
  return { summary, topCategoryInsight, savingsInsight };
}

// The new AI-powered function
export async function generateFinancialInsights(
  stats: Awaited<ReturnType<typeof getMonthlyStats>>,
  monthName: string
) {
  const { totalIncome, totalExpenses, byCategory, transactionCount } = stats;

  const prompt = `
    You are a friendly and encouraging financial assistant. Analyze the following monthly financial data for a user in India (currency is Rupees ₹) and provide a short, insightful summary. The tone should be helpful, positive, and not judgmental.

    The user's data for ${monthName} is:
    - Total Income: ${totalIncome.toFixed(2)}
    - Total Expenses: ${totalExpenses.toFixed(2)}
    - Total Transactions: ${transactionCount}
    - Expenses by Category: ${JSON.stringify(byCategory)}

    Please provide your insights as a JSON object with three keys: "summary", "topCategoryInsight", and "savingsInsight".
    - "summary": A brief, one-sentence overview of the month's activity.
    - "topCategoryInsight": A one-sentence comment on the category with the highest spending.
    - "savingsInsight": A one-sentence comment on the net savings or deficit, offering encouragement or gentle advice.
  `;

  try {
    console.log("Generating financial insights with Gemini AI...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const insights = JSON.parse(responseText);

    // Validate the AI response has the expected structure
    if (insights.summary && insights.topCategoryInsight && insights.savingsInsight) {
      console.log("Successfully generated AI insights.");
      return insights;
    }
    // If validation fails, throw an error to trigger the fallback
    throw new Error("AI response did not match the required format.");

  } catch (error) {
    console.error("Gemini AI insight generation failed:", error);
    console.log("Falling back to rule-based insights.");
    // Fallback to the original function if the AI call fails for any reason
    return getRuleBasedFinancialInsights(stats, monthName);
  }
}