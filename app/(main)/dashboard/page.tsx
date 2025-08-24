export const dynamic = "force-dynamic";

import { Suspense } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Target, Wallet } from 'lucide-react'


import { UserAccounts } from "./user-accounts"
import { getDashboardData, getUserAccounts } from "@/actions/dashboard"
import { getCurrentBudget } from "@/actions/budget"
import BudgetProgress from "./budget-progress"
import DashboardOverview from "./dashboard-overview"
import { DashboardStats } from "./dashboard-stats"
import { RecentTransactions } from "./recent-transactions"
import { FinancialInsights } from "./financial-insights"
import { SpendingTrends } from "./spending-trends"
import { CreateAccountDrawer } from "./create-account-drawer"

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

const Dashboard = async () => {
  const accounts = await getUserAccounts()
  const defaultAccount = accounts?.find((account: any) => account.isDefault)

  let budgetData = null
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id)
  }

  const transactions = await getDashboardData()

  return (
    <div className="space-y-8">

       {/* Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Your Accounts</h2>
              <p className="text-slate-600">Manage your financial accounts</p>
            </div>
          </div>
          <CreateAccountDrawer > </CreateAccountDrawer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense
            fallback={
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <StatsCardSkeleton key={i} />
                ))}
              </>
            }
          >
            <UserAccounts accounts={accounts} />
          </Suspense>
        </div>
      </div>
      
      {/* Key Metrics Overview */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DashboardStats accounts={accounts} transactions={transactions || []} />
      </Suspense>

      {/* Financial Insights Section */}
      <Suspense
        fallback={
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
            <CardHeader>
              <Skeleton className="h-6 w-48 rounded-full" />
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        }
      >
        <FinancialInsights accounts={accounts} transactions={transactions || []} />
      </Suspense>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Charts and Trends Section */}
        <div className="xl:col-span-2 space-y-8">
          {/* Spending Trends */}
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
            <SpendingTrends transactions={transactions || []} />
          </Suspense>

          {/* Overview Charts */}
          <Suspense
            fallback={
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-48 rounded-full" />
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-center">
                        <Skeleton className="w-64 h-64 rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            }
          >
            <DashboardOverview accounts={accounts} transactions={transactions || []} />
          </Suspense>
        </div>

        {/* Right Sidebar - Budget Progress and Recent Transactions */}
        <div className="xl:col-span-1 space-y-8">
          {/* Budget Progress Section */}
          {defaultAccount ? (
            <Suspense
              fallback={
                <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
                  <CardHeader>
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-8 w-full rounded-2xl" />
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-20 rounded-full" />
                            <Skeleton className="h-4 w-16 rounded-full" />
                          </div>
                          <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <BudgetProgress
                initialBudget={budgetData?.budget}
                currentExpenses={budgetData?.currentExpenses}
                accounts={accounts}
                transactions={transactions || []}
              />
            </Suspense>
          ) : (
            <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Default Account</h3>
                <p className="text-sm text-slate-500 text-center">Set a default account to track your monthly budget</p>
              </CardContent>
            </Card>
          )}

          {/* Recent 5 Transactions - NEW ADDITION */}
          <Suspense
            fallback={
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-48 rounded-full" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
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
                </CardContent>
              </Card>
            }
          >
             <RecentTransactions transactions={transactions || []} accounts={accounts} />
          </Suspense>
        </div>
      </div>

    </div>
  )
}

export default Dashboard