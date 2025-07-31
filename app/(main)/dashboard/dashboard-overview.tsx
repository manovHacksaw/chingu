"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { PieChartIcon } from "lucide-react"

interface DashboardOverviewProps {
  accounts: any[]
  transactions: any[]
}

const COLORS = [
  "#F2B27D", // chingu-peach-400
  "#5AE8B2", // chingu-mint-400
  "#AD94E8", // chingu-lavender-400
  "#7DD3FC", // chingu-sky-400
  "#F59E0B", // amber-500
  "#EC4899", // pink-500
  "#8B5CF6", // violet-500
  "#10B981", // emerald-500
]

const DashboardOverview = ({ accounts, transactions }: DashboardOverviewProps) => {
  // Calculate transactions by account
  const transactionsByAccount = useMemo(() => {
    const accountMap = new Map()

    accounts.forEach((account) => {
      accountMap.set(account.id, {
        name: account.name,
        type: account.type,
        balance: Number.parseFloat(account.balance),
        transactionCount: 0,
        totalExpenses: 0,
        totalIncome: 0,
      })
    })

    transactions.forEach((transaction) => {
      const accountData = accountMap.get(transaction.accountId)
      if (accountData) {
        accountData.transactionCount += 1
        if (transaction.type === "EXPENSE") {
          accountData.totalExpenses += Number.parseFloat(transaction.amount)
        } else {
          accountData.totalIncome += Number.parseFloat(transaction.amount)
        }
      }
    })

    return Array.from(accountMap.values()).filter((account) => account.transactionCount > 0)
  }, [accounts, transactions])

  // Calculate transactions by category
  const transactionsByCategory = useMemo(() => {
    const categoryMap = new Map()

    transactions.forEach((transaction) => {
      if (transaction.type === "EXPENSE") {
        const category = transaction.category || "Other"
        const current = categoryMap.get(category) || { name: category, value: 0, count: 0 }
        current.value += Number.parseFloat(transaction.amount)
        current.count += 1
        categoryMap.set(category, current)
      }
    })

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 categories
  }, [transactions])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-chingu-peach-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-medium">${data.value?.toFixed(2) || data.totalExpenses?.toFixed(2)}</span>
          </p>
          {data.count && (
            <p className="text-sm text-gray-600">
              Transactions: <span className="font-medium">{data.count}</span>
            </p>
          )}
          {data.transactionCount && (
            <p className="text-sm text-gray-600">
              Total Transactions: <span className="font-medium">{data.transactionCount}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices smaller than 5%

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
        <CardHeader className="bg-gradient-to-r from-chingu-peach-100 to-chingu-mint-100 rounded-t-3xl">
          <CardTitle className="flex items-center text-gray-800">
            <PieChartIcon className="h-5 w-5 mr-2" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-chingu-peach-200 to-chingu-mint-200 rounded-3xl flex items-center justify-center mb-6">
            <PieChartIcon className="h-10 w-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-3">No Data Available</h3>
          <p className="text-gray-500 text-center max-w-md">
            Start by adding some transactions to see your financial overview with beautiful charts.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-chingu-peach-100 to-chingu-mint-100 rounded-t-3xl">
        <CardTitle className="flex items-center justify-between text-gray-800">
          <span className="flex items-center">
            <PieChartIcon className="h-5 w-5 mr-2" />
            Financial Overview
          </span>
          <Badge className="bg-gradient-to-r from-chingu-lavender-200 to-chingu-sky-200 text-gray-700 border-0 rounded-full">
            {transactions.length} transactions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Expenses by Category */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Expenses by Category</h3>
              <p className="text-sm text-gray-600">
                Total: ${transactionsByCategory.reduce((sum, cat) => sum + cat.value, 0).toFixed(2)}
              </p>
            </div>
            {transactionsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={transactionsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500">No expense data available</p>
              </div>
            )}

            {/* Category Legend */}
            <div className="grid grid-cols-2 gap-2">
              {transactionsByCategory.slice(0, 6).map((category, index) => (
                <div key={category.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-gray-600 truncate">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions by Account */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Activity by Account</h3>
              <p className="text-sm text-gray-600">
                Total Transactions: {transactionsByAccount.reduce((sum, acc) => sum + acc.transactionCount, 0)}
              </p>
            </div>
            {transactionsByAccount.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={transactionsByAccount}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="transactionCount"
                  >
                    {transactionsByAccount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500">No account data available</p>
              </div>
            )}

            {/* Account Legend */}
            <div className="space-y-2">
              {transactionsByAccount.map((account, index) => (
                <div
                  key={account.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium text-gray-700">{account.name}</span>
                  </div>
                  <span className="text-xs text-gray-600">{account.transactionCount} txns</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardOverview
