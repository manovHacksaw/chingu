import { Suspense } from "react"
import { BarLoader } from "react-spinners"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Target, CreditCard, User } from "lucide-react"

import { CreateAccountDrawer } from "./create-account-drawer"
import {UserAccounts} from "./user-accounts"
import { getUserAccounts } from "@/actions/dashboard"
import { getCurrentBudget } from "@/actions/budget"
import BudgetProgress from "./budget-progress"

// import { AccountsGrid } from "@/components/accounts-grid"
// import { RecentTransactions } from "@/components/recent-transactions"

const Dashboard = async() => {
   const accounts = await getUserAccounts();

   const defaultAccount = accounts?.find((account)=>account.isDefault);

   let budgetData = null;
   if(defaultAccount){
    budgetData = await getCurrentBudget(defaultAccount.id);
   }
   
  
  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-400 to-emerald-400 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,345.67</div>
            <p className="text-xs opacity-90">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-400 to-pink-400 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">This Month Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847.32</div>
            <p className="text-xs opacity-90">-5.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Budget Used</CardTitle>
            <Target className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs opacity-90">$2,040 of $3,000</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-400 to-pink-400 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Accounts</CardTitle>
            <CreditCard className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs opacity-90">2 checking, 1 savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
     {defaultAccount && <BudgetProgress initialBudget = {budgetData?.budget} currentExpenses = {budgetData?.currentExpenses}/>}

      {/* Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Accounts</h2>
          <CreateAccountDrawer />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense
            fallback={
              <div className="col-span-full flex justify-center py-8">
                <BarLoader color="#f97316" />
              </div>
            }
          >
            <UserAccounts accounts={accounts}/>
          </Suspense>
        </div>
      </div>

      {/* Recent Transactions */}
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex justify-center py-8">
              <BarLoader color="#f97316" />
            </CardContent>
          </Card>
        }
      >
        {/* <RecentTransactions /> */}
      </Suspense>
    </div>
  )
}

export default Dashboard
