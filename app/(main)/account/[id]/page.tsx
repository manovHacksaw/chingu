import { getAccountWithTransactions } from '@/actions/accounts'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wallet, PiggyBank, CreditCard, TrendingUp, TrendingDown, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import TransactionTable from './transaction-table'
import AccountChart from './account-chart'
// import AccountChart from './account-chart'

const accountIcons = {
  CURRENT: Wallet,
  SAVINGS: PiggyBank,
  OTHER: CreditCard,
}

const accountColors = {
  CURRENT: 'from-chingu-sky-300 to-blue-300',
  SAVINGS: 'from-chingu-mint-300 to-emerald-300',
  OTHER: 'from-chingu-lavender-300 to-purple-300',
}

const Account = async ({ params }: { params: { id: string } }) => {
  const { id } = await params
  const accountData = await getAccountWithTransactions(id)

  if (!accountData) {
    notFound()
  }

  const { transactions, ...account } = accountData
  const Icon = accountIcons[account.type as keyof typeof accountIcons]
  const colorClass = accountColors[account.type as keyof typeof accountColors]

  // Calculate analytics
  const totalIncome = transactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
  
  const totalExpenses = transactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)

  const thisMonthTransactions = transactions.filter((t: any) => {
    const transactionDate = new Date(t.date)
    const now = new Date()
    return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-chingu-peach-50 via-chingu-mint-50 to-chingu-lavender-50 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center space-x-4">
           
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{account.name}</h1>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-gradient-to-r from-chingu-peach-200 to-chingu-mint-200 text-gray-700 border-0 rounded-full">
                    {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
                  </Badge>
                  {account.isDefault && (
                    <Badge className="bg-gradient-to-r from-chingu-lavender-200 to-chingu-sky-200 text-gray-700 border-0 rounded-full">
                      Default
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        <Link href="/transaction/create" passHref>
  <Button asChild className="bg-gradient-to-r from-chingu-peach-400 to-chingu-mint-400 hover:from-chingu-peach-500 hover:to-chingu-mint-500 text-white rounded-2xl">
    <a>
      <Plus className="h-4 w-4 mr-2" />
      Add Transaction
    </a>
  </Button>
</Link>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-in">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Current Balance</CardTitle>
              <div className={`w-8 h-8 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">${parseFloat(account.balance).toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">Available funds</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chingu-mint-300 to-emerald-300 text-white border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold opacity-90">Total Income</CardTitle>
              <TrendingUp className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
              <p className="text-xs opacity-90">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chingu-peach-300 to-pink-300 text-white border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold opacity-90">Total Expenses</CardTitle>
              <TrendingDown className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs opacity-90">All time spending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chingu-lavender-300 to-purple-300 text-white border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold opacity-90">Transactions</CardTitle>
              <Calendar className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{account._count.transactions}</div>
              <p className="text-xs opacity-90">{thisMonthTransactions.length} this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl mb-8 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-chingu-peach-100 to-chingu-mint-100 rounded-t-3xl">
            <CardTitle className="flex items-center text-gray-800">
              <TrendingUp className="h-5 w-5 mr-2" />
              Account Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <BarLoader color="#F2B27D" width={100} height={4} />
                    <p className="text-chingu-peach-400 font-medium">Loading chart...</p>
                  </div>
                </div>
              }
            >
              <AccountChart transactions={transactions} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-chingu-peach-100 to-chingu-mint-100 rounded-t-3xl">
            <CardTitle className="flex items-center justify-between text-gray-800">
              <span className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Transaction History
              </span>
              <Badge className="bg-gradient-to-r from-chingu-lavender-200 to-chingu-sky-200 text-gray-700 border-0 rounded-full">
                {transactions.length} transactions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <BarLoader color="#F2B27D" width={100} height={4} />
                    <p className="text-chingu-peach-400 font-medium">Loading transactions...</p>
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
