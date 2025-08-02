import { getAccountWithTransactions } from "@/actions/accounts"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Star,
  Activity,
} from "lucide-react"
import Link from "next/link"
import TransactionTable from "./transaction-table"
import AccountChart from "./account-chart"

const accountIcons = {
  CURRENT: Wallet,
  SAVINGS: PiggyBank,
  OTHER: CreditCard,
}

const accountColors = {
  CURRENT: "from-blue-500 to-indigo-600",
  SAVINGS: "from-green-500 to-emerald-600",
  OTHER: "from-purple-500 to-violet-600",
}

const accountBgColors = {
  CURRENT: "from-blue-50 to-indigo-50",
  SAVINGS: "from-green-50 to-emerald-50",
  OTHER: "from-purple-50 to-violet-50",
}

// Enhanced loading components
const StatsCardSkeleton = () => (
  <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-32 mb-2 rounded-full" />
      <Skeleton className="h-3 w-24 rounded-full" />
    </CardContent>
  </Card>
)

const Account = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const accountData = await getAccountWithTransactions(id)

  if (!accountData) {
    notFound()
  }

  const { transactions, ...account } = accountData
  const Icon = accountIcons[account.type as keyof typeof accountIcons]
  const colorClass = accountColors[account.type as keyof typeof accountColors]
  const bgColorClass = accountBgColors[account.type as keyof typeof accountBgColors]

  // Calculate analytics
  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + Number.parseFloat(t.amount), 0)

  const totalExpenses = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + Number.parseFloat(t.amount), 0)

  const thisMonthTransactions = transactions.filter((t: any) => {
    const transactionDate = new Date(t.date)
    const now = new Date()
    return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()
  })

  const netWorth = totalIncome - totalExpenses

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* Header */}
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
              <div className="flex items-center space-x-3">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    {account.name}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-0 rounded-full">
                      {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
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
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className={`group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-500 hover:scale-105 rounded-2xl bg-gradient-to-br ${bgColorClass} backdrop-blur-sm`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Current Balance</CardTitle>
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${colorClass} shadow-lg`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-slate-900">${Number.parseFloat(account.balance).toFixed(2)}</div>
              <p className="text-sm text-slate-600 leading-relaxed">Available funds</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-500 hover:scale-105 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Income</CardTitle>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-slate-900">${totalIncome.toFixed(2)}</div>
              <p className="text-sm text-slate-600 leading-relaxed">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-500 hover:scale-105 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Expenses</CardTitle>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500 shadow-lg">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-slate-900">${totalExpenses.toFixed(2)}</div>
              <p className="text-sm text-slate-600 leading-relaxed">All time spending</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-500 hover:scale-105 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Transactions</CardTitle>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-500 shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-slate-900">{account._count.transactions}</div>
              <p className="text-sm text-slate-600 leading-relaxed">{thisMonthTransactions.length} this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <Suspense
            fallback={
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-48 rounded-full" />
                </CardHeader>
                <CardContent className="p-8">
                  <Skeleton className="h-64 w-full rounded-xl" />
                </CardContent>
              </Card>
            }
          >
            <AccountChart transactions={transactions} />
          </Suspense>
        </div>

        {/* Transactions Table */}
        <Card className=" backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
          <CardHeader className="rounded-t-2xl border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-slate-800">
                <Activity className="h-5 w-5 mr-3" />
                Transaction History
              </CardTitle>
              <Badge className="bg-gradient-to-r text-slate-700 border-0 rounded-full">
                {transactions.length} transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Suspense
              fallback={
                <div className="p-8">
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32 rounded-full" />
                          <Skeleton className="h-3 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              }
            >
              <TransactionTable transactions={transactions} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Account