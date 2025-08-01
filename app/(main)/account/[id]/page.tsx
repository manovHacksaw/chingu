import { getAccountWithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";
import { FC, Suspense } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionTable from "./transaction-table";
import AccountChart from "./account-chart";

import {
  ArrowLeft,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  Activity,
} from "lucide-react";

// It's good practice to import these types from your actions file if you export them.
// For clarity, we define them here based on the server action's serialization.
type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  date: string;
  notes: string | null;
  accountId: string;
  userId: string;
};

// Define constants for icons and colors to keep the component clean.
const accountIcons = {
  CURRENT: Wallet,
  SAVINGS: PiggyBank,
  OTHER: CreditCard,
};

const accountColors = {
  CURRENT: "from-blue-500 to-indigo-600",
  SAVINGS: "from-green-500 to-emerald-600",
  OTHER: "from-purple-500 to-violet-600",
};

const accountBgColors = {
  CURRENT: "from-blue-50 to-indigo-50",
  SAVINGS: "from-green-50 to-emerald-50",
  OTHER: "from-purple-50 to-violet-50",
};

interface PageProps{
params: {
    id: string;
  };
}

// Main Page Component
const AccountPage: FC<PageProps> = async ({ params }) => {
  const { id } = params;
  
  // Fetch data and handle the response object from the server action
  const response = await getAccountWithTransactions(id);

  // If the action was not successful, render the not-found page.
  if (!response.success) {
    notFound();
  }

  const accountData = response.data;
  const { transactions, ...account } = accountData;

  const Icon = accountIcons[account.type as keyof typeof accountIcons] || CreditCard;
  const colorClass = accountColors[account.type as keyof typeof accountColors] || accountColors.OTHER;
  const bgColorClass = accountBgColors[account.type as keyof typeof accountBgColors] || accountBgColors.OTHER;

  // Calculate analytics using the serialized numeric 'amount'
  const totalIncome = transactions
    .filter((t: Transaction) => t.type === "INCOME")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t: Transaction) => t.type === "EXPENSE")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const thisMonthTransactions = transactions.filter((t: Transaction) => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            className="mb-4 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-xl"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
                  {account.name}
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-0 rounded-full capitalize">
                    {account.type.toLowerCase()} Account
                  </Badge>
                  {account.isDefault && (
                    <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-0 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl bg-gradient-to-br ${bgColorClass} backdrop-blur-sm`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Current Balance</CardTitle>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${colorClass} shadow-md`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                ${account.balance.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500">Available funds</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Income</CardTitle>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
              <p className="text-xs text-slate-500">All-time earnings</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Expenses</CardTitle>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500 shadow-md">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-slate-500">All-time spending</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-200 backdrop-blur-sm">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-gray-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Transactions</CardTitle>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-500 to-gray-600 shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{account._count.transactions}</div>
              <p className="text-xs text-slate-500">{thisMonthTransactions.length} this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <Suspense fallback={<Skeleton className="h-80 w-full rounded-2xl" />}>
            <AccountChart transactions={transactions} />
          </Suspense>
        </div>

        {/* Transactions Table */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
          <CardHeader className="rounded-t-2xl border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-slate-800">
                <Activity className="h-5 w-5 mr-3" />
                Transaction History
              </CardTitle>
              <Badge variant="secondary" className="rounded-full">
                {transactions.length} transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <TransactionTable transactions={transactions} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;
