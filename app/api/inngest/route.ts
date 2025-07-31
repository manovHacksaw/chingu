import { serve } from "inngest/next";
import { inngest } from "@/lib/innngest/client";
import { checkBudgetAlert, generateMonthltReports} from "@/lib/innngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    checkBudgetAlert,
    generateMonthltReports
  ],
});