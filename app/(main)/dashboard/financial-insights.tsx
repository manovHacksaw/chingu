"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Calendar, DollarSign, PieChart } from 'lucide-react'

interface FinancialInsightsProps {
  accounts: any[]
  transactions: any[]
}

export function FinancialInsights({ accounts, transactions }: FinancialInsightsProps) {
  const insights = useMemo(() => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Current month data
    const currentMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })
    
    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    
    // Previous month data
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const prevMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === prevMonth && transactionDate.getFullYear() === prevYear
    })
    
    const prevMonthExpenses = prevMonthTransactions
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    
    // Category analysis
    const categorySpending = currentMonthTransactions
      .filter(t => t.type === "EXPENSE")
      .reduce((acc, t) => {
        const category = t.category || "Other"
        acc[category] = (acc[category] || 0) + parseFloat(t.amount || 0)
        return acc
      }, {} as Record<string, number>)
    
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0]
    
    // Spending patterns
    const dailyAverageSpending = currentMonthExpenses / currentDate.getDate()
    const projectedMonthlySpending = dailyAverageSpending * 30
    
    // Financial health indicators
    const savingsRate = currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 : 0
    const expenseGrowth = prevMonthExpenses > 0 ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0
    
    return {
      currentMonthExpenses,
      currentMonthIncome,
      prevMonthExpenses,
      topCategory,
      dailyAverageSpending,
      projectedMonthlySpending,
      savingsRate,
      expenseGrowth,
      categorySpending
    }
  }, [accounts, transactions])
  
  const getInsightCards = () => {
    const cards = []
    
    // Spending trend insight
    if (insights.expenseGrowth > 20) {
      cards.push({
        type: "warning",
        icon: AlertTriangle,
        title: "High Spending Alert",
        description: `Your expenses increased by ${insights.expenseGrowth.toFixed(1)}% compared to last month`,
        action: "Consider reviewing your budget",
        color: "from-amber-500 to-orange-500",
        bgColor: "from-amber-50 to-orange-50"
      })
    } else if (insights.expenseGrowth < -10) {
      cards.push({
        type: "success",
        icon: CheckCircle,
        title: "Great Spending Control",
        description: `You reduced expenses by ${Math.abs(insights.expenseGrowth).toFixed(1)}% this month`,
        action: "Keep up the good work!",
        color: "from-green-500 to-emerald-500",
        bgColor: "from-green-50 to-emerald-50"
      })
    }
    
    // Savings rate insight
    if (insights.savingsRate >= 20) {
      cards.push({
        type: "success",
        icon: Target,
        title: "Excellent Savings Rate",
        description: `You're saving ${insights.savingsRate.toFixed(1)}% of your income`,
        action: "Consider investing surplus funds",
        color: "from-blue-500 to-indigo-500",
        bgColor: "from-blue-50 to-indigo-50"
      })
    } else if (insights.savingsRate < 10) {
      cards.push({
        type: "warning",
        icon: TrendingDown,
        title: "Low Savings Rate",
        description: `Only ${insights.savingsRate.toFixed(1)}% of income saved this month`,
        action: "Try to increase your savings goal",
        color: "from-red-500 to-pink-500",
        bgColor: "from-red-50 to-pink-50"
      })
    }
    
    // Top spending category insight
    if (insights.topCategory) {
      const [category, amount] = insights.topCategory
      const percentage = (amount / insights.currentMonthExpenses) * 100
      cards.push({
        type: "info",
        icon: PieChart,
        title: "Top Spending Category",
        description: `${category}: $${amount.toFixed(2)} (${percentage.toFixed(1)}% of expenses)`,
        action: "Monitor this category closely",
        color: "from-purple-500 to-violet-500",
        bgColor: "from-purple-50 to-violet-50"
      })
    }
    
    return cards.slice(0, 3) // Show max 3 insights
  }
  
  const insightCards = getInsightCards()
  
  if (transactions.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <TrendingUp className="h-5 w-5 mr-3" />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No insights available</h3>
            <p className="text-slate-500">Add some transactions to get personalized financial insights</p>
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
            <TrendingUp className="h-5 w-5 mr-3" />
            Financial Insights
          </CardTitle>
          <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-slate-700 border-0 rounded-full">
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {insightCards.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {insightCards.map((insight, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl bg-gradient-to-br ${insight.bgColor} border border-white/50 hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${insight.color} flex items-center justify-center flex-shrink-0`}>
                    <insight.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-800 mb-2">{insight.title}</h4>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{insight.description}</p>
                    <p className="text-xs font-medium text-slate-500">{insight.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">All looks good!</h3>
            <p className="text-slate-500">Your financial habits are on track. Keep monitoring your progress.</p>
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/50 rounded-xl border border-slate-200/50">
            <DollarSign className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Daily Average</p>
            <p className="text-lg font-bold text-slate-800">${insights.dailyAverageSpending.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl border border-slate-200/50">
            <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Projected Monthly</p>
            <p className="text-lg font-bold text-slate-800">${insights.projectedMonthlySpending.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl border border-slate-200/50">
            <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Savings Rate</p>
            <p className="text-lg font-bold text-slate-800">{insights.savingsRate.toFixed(1)}%</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl border border-slate-200/50">
            <TrendingUp className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Expense Change</p>
            <p className={`text-lg font-bold ${insights.expenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {insights.expenseGrowth >= 0 ? '+' : ''}{insights.expenseGrowth.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
