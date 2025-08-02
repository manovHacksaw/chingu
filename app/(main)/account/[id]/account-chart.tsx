"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { endOfDay, format, startOfDay, subDays } from "date-fns"
import { type FC, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, BarChart3, Activity } from "lucide-react"

interface Transaction {
  id: string
  date: string | Date
  description: string
  category: string
  amount: number
  type: "INCOME" | "EXPENSE"
  isRecurring: boolean
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null
  nextRecurringDate?: string | Date | null
  lastProcessed?: string | Date | null
  account?: {
    name: string
    type: string
  }
}

interface AccountChartProps {
  transactions: Transaction[]
}

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 1 Month", days: 30 },
  "2M": { label: "Last 2 Months", days: 60 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
} as const

type DateRangeKey = keyof typeof DATE_RANGES

const AccountChart: FC<AccountChartProps> = ({ transactions }) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>("1M")
  const [chartType, setChartType] = useState("bar")

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange]
    const now = new Date()
    const startDate = range.days ? startOfDay(subDays(now, range.days)) : startOfDay(new Date(0))

    const filtered = transactions.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now))

    const grouped = filtered.reduce(
      (acc, transaction) => {
        const date = format(new Date(transaction.date), range.days && range.days <= 30 ? "MMM dd" : "MMM yyyy")

        if (!acc[date]) {
          acc[date] = { date, income: 0, expense: 0, net: 0 }
        }

        if (transaction.type === "INCOME") {
          acc[date].income += Number(transaction.amount)
        } else {
          acc[date].expense += Number(transaction.amount)
        }

        acc[date].net = acc[date].income - acc[date].expense

        return acc
      },
      {} as Record<string, { date: string; income: number; expense: number; net: number }>,
    )

    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [transactions, dateRange])

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
        net: acc.net + day.net,
      }),
      { income: 0, expense: 0, net: 0 },
    )
  }, [filteredData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
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
            <Activity className="h-5 w-5 mr-2" />
            Account Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-3">No activity data</h3>
            <p className="text-slate-500 text-center max-w-md">
              Start adding transactions to see your account activity over time.
            </p>
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
            <Activity className="h-5 w-5 mr-2" />
            Account Activity
          </CardTitle>
          <div className="flex items-center space-x-2">
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

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRangeKey)}>
              <SelectTrigger className="w-40 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <p className="text-slate-600">Total Income</p>
              <p className="font-bold text-green-600">${totals.income.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Total Expenses</p>
              <p className="font-bold text-red-600">${totals.expense.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Net</p>
              <p className={`font-bold ${totals.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${totals.net.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
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
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#6366f1", strokeWidth: 2, r: 3 }}
                  name="Net"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountChart
