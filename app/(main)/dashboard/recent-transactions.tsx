"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IncomeAmount, ExpenseAmount } from "@/components/ui/currency"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
} from "lucide-react"

interface TransactionsProps {
  transactions: any[]
  accounts: any[]
}

export function RecentTransactions({ transactions = [], accounts = [] }: TransactionsProps) {
  // Sort transactions by date (newest first) and take only the first 5
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  if (transactions.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <Receipt className="h-5 w-5 mr-3" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No transactions yet</h3>
            <p className="text-slate-500 text-center max-w-md">
              Start by adding your first transaction to see your financial activity here.
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
            <Receipt className="h-5 w-5 mr-3" />
            Recent Transactions
          </CardTitle>
          <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-slate-700 border-0 rounded-full">
            {recentTransactions.length} recent
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => {
            const account = accounts.find((a) => a.id === transaction.accountId)

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-slate-200/50 hover:shadow-lg transition-all duration-300 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      transaction.type === "INCOME"
                        ? "bg-gradient-to-br from-green-400 to-emerald-500"
                        : "bg-gradient-to-br from-red-400 to-pink-500"
                    }`}
                  >
                    {transaction.type === "INCOME" ? (
                      <ArrowDownLeft className="h-6 w-6 text-white" />
                    ) : (
                      <ArrowUpRight className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                   <p className="font-semibold text-slate-800">
  {(transaction.description || transaction.category).slice(0, 12)}{(transaction.description || transaction.category).length > 12 && '...'}
</p>

                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm text-slate-600">{account?.name || "Unknown Account"}</p>
                      <span className="text-slate-400">•</span>
                      <p className="text-sm text-slate-600">
                        {new Date(transaction.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-xl font-bold mb-1 ${
                      transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}$
                    {Number.parseFloat(transaction.amount || 0).toFixed(2)}
                  </p>
                  <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-slate-700 border-0 rounded-full text-xs capitalize">
                    {transaction.category}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
