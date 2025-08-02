import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/ui/currency";
import { TrendingUp, TrendingDown, DollarSign, Target, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardStatsProps {
  accounts: any[];
  transactions: any[];
}

export function DashboardStats({ accounts = [], transactions = [] }: DashboardStatsProps) {
  // Calculate totals and trends
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Current month calculations
  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });
  
  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  // Previous month calculations
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const prevMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === prevMonth && transactionDate.getFullYear() === prevYear;
  });
  
  const prevMonthExpenses = prevMonthTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
  const prevMonthIncome = prevMonthTransactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  // Calculate percentage changes
  const expenseChange = prevMonthExpenses > 0 ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0;
  const incomeChange = prevMonthIncome > 0 ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100 : 0;
  
  // Net worth calculation
  const netWorth = currentMonthIncome - currentMonthExpenses;
  const prevNetWorth = prevMonthIncome - prevMonthExpenses;
  const netWorthChange = prevNetWorth !== 0 ? ((netWorth - prevNetWorth) / Math.abs(prevNetWorth)) * 100 : 0;
  
  // Savings rate
  const savingsRate = currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 : 0;
  
  const stats = [
    {
      title: "Total Balance",
      value: totalBalance,
      change: null,
      trend: "neutral",
      icon: DollarSign,
      prefix: "$",
      suffix: "",
      description: `Across ${accounts.length} accounts`,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      title: "Monthly Expenses",
      value: currentMonthExpenses,
      change: expenseChange,
      trend: expenseChange > 0 ? "down" : "up",
      icon: TrendingDown,
      prefix: "$",
      suffix: "",
      description: "This month's spending",
      gradient: "from-red-500 to-pink-500",
      bgGradient: "from-red-50 to-pink-50"
    },
    {
      title: "Monthly Income",
      value: currentMonthIncome,
      change: incomeChange,
      trend: incomeChange >= 0 ? "up" : "down",
      icon: TrendingUp,
      prefix: "$",
      suffix: "",
      description: "This month's earnings",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      title: "Savings Rate",
      value: savingsRate,
      change: netWorthChange,
      trend: savingsRate >= 20 ? "up" : savingsRate >= 10 ? "neutral" : "down",
      icon: PiggyBank,
      prefix: "",
      suffix: "%",
      description: "Of monthly income saved",
      gradient: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-50 to-indigo-50"
    }
  ];

  const formatValue = (value: number, prefix: string = "", suffix: string = "") => {
    if (suffix === "%") {
      return `${value.toFixed(1)}${suffix}`;
    }
    // Currency values will be handled by CurrencyDisplay component
    return value;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card 
            key={stat.title}
            className={`group relative overflow-hidden border-0 hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-3xl bg-gradient-to-br ${stat.bgGradient}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {stat.suffix === "%" ? (
                    `${stat.value.toFixed(1)}${stat.suffix}`
                  ) : (
                    <CurrencyDisplay amount={stat.value} />
                  )}
                </div>
                
                {stat.change !== null && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(stat.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                      {stat.change >= 0 ? "+" : ""}{stat.change.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {stat.description}
              </p>
              
              {/* Progress indicator for savings rate */}
              {stat.title === "Savings Rate" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Poor</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 bg-gradient-to-r ${
                        savingsRate >= 20 ? "from-green-400 to-emerald-500" :
                        savingsRate >= 10 ? "from-yellow-400 to-orange-500" :
                        "from-red-400 to-pink-500"
                      }`}
                      style={{ width: `${Math.min(Math.max(savingsRate, 0), 50) * 2}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
