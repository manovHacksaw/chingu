import { RecurringInterval } from "@prisma/client"
import {z} from "zod"
export const accountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, "Initial Balance is required"),
    isDefault: z.boolean().default(false)

}) 

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"], {
      required_error: "Transaction type is required.",
    }),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a valid positive number",
      }),
    category: z.string().min(1, { message: "Category is required." }),
    date: z.date({ required_error: "Please select a date." }),
    accountId: z.string().min(1, { message: "Please select an account." }),
    description: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
  })
  .refine(
    (data) => {
      // If it's a recurring transaction, an interval must be selected.
      if (data.isRecurring && !data.recurringInterval) {
        return false;
      }
      return true;
    },
    {
      message: "Frequency is required for recurring transactions.",
      path: ["recurringInterval"], // Specify which field the error belongs to
    }
  );