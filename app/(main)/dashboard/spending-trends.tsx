"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Calendar, BarChart3 } from "lucide-react"

interface SpendingTrendsProps {
  transactions: any[]
}

export function SpendingTrends({ transactions }: SpendingTrendsProps) {
  const chartData = useMemo(() => {
    if (transactions.length === 0) return { daily: [], monthly: [] }

    // Get last 30 days of data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTransactions = transactions.filter((t) => new Date(t.date) >= thirtyDaysAgo)

    // Daily spending data
    const dailyData = new Map()

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      dailyData.set(dateStr, {
        date: dateStr,
        displayDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        expenses: 0,
        income: 0,
        net: 0,
      })
    }

    // Populate with actual data
    recentTransactions.forEach((transaction) => {
      const dateStr = transaction.date.split("T")[0]
      const data = dailyData.get(dateStr)
      if (data) {
        const amount = Number.parseFloat(transaction.amount || 0)
        if (transaction.type === "EXPENSE") {
          data.expenses += amount
        } else {
          data.income += amount
        }
        data.net = data.income - data.expenses
      }
    })

    // Monthly data for last 6 months
    const monthlyData = new Map()
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyData.set(monthKey, {
        month: monthKey,
        displayMonth: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        expenses: 0,
        income: 0,
        net: 0,
      })
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const data = monthlyData.get(monthKey)
      if (data) {
        const amount = Number.parseFloat(transaction.amount || 0)
        if (transaction.type === "EXPENSE") {
          data.expenses += amount
        } else {
          data.income += amount
        }
        data.net = data.income - data.expenses
      }
    })

    return {
      daily: Array.from(dailyData.values()),
      monthly: Array.from(monthlyData.values()),
    }
  }, [transactions])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <BarChart3 className="h-5 w-5 mr-3" />
            Spending Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No trend data available</h3>
            <p className="text-slate-500">Add transactions to see your spending patterns over time</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-slate-800">
            <BarChart3 className="h-5 w-5 mr-3" />
            Spending Trends
          </CardTitle>
          <div className="flex space-x-2">
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" />
              Income
            </Badge>
            <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-0 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              Expenses
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Daily Trends (Last 30 Days) */}
          <div>
            <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Daily Trends (Last 30 Days)
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="displayDate" stroke="#64748b" fontSize={12} interval="preserveStartEnd" />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Overview (Last 6 Months) */}
          <div>
            <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Monthly Overview (Last 6 Months)
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="displayMonth" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
