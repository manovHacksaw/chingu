'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencySelector } from '@/components/ui/currency-selector'
import { CurrencyDisplay, IncomeAmount, ExpenseAmount, BalanceAmount, CompactCurrency } from '@/components/ui/currency'
import { useCurrency, useCurrencyActions } from '@/hooks/use-currency-store'
import { Currency } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function CurrencyDemoPage() {
  const currentCurrency = useCurrency()
  const { setCurrency } = useCurrencyActions()
  const [demoValues] = useState({
    balance: 12543.67,
    income: 5200.00,
    expense: 1875.50,
    savings: 245780.33,
    smallAmount: 12.99,
    largeAmount: 1234567.89,
  })

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
  }

  const resetToUSD = () => {
    setCurrency('USD')
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-800">Currency Demo</h1>
        <p className="text-slate-600 text-lg">
          Interactive demonstration of the global currency feature. Change the currency to see all values update in real-time.
        </p>
      </div>

      {/* Currency Selector */}
      <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Currency Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Currency: <span className="font-bold">{currentCurrency}</span>
              </label>
              <CurrencySelector
                value={currentCurrency}
                onValueChange={handleCurrencyChange}
                placeholder="Select currency..."
              />
            </div>
            <Button
              onClick={resetToUSD}
              variant="outline"
              className="mt-6"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to USD
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Basic Currency Display */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Basic Currency Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Account Balance</label>
              <div className="text-3xl font-bold text-slate-800">
                <CurrencyDisplay amount={demoValues.balance} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Compact Format</label>
              <div className="text-2xl font-semibold text-slate-700">
                <CompactCurrency amount={demoValues.largeAmount} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income/Expense Display */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Income & Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Monthly Income</label>
              <div className="text-2xl font-bold">
                <IncomeAmount amount={demoValues.income} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Monthly Expenses</label>
              <div className="text-2xl font-bold">
                <ExpenseAmount amount={demoValues.expense} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Display */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Dynamic Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Positive Balance</label>
              <div className="text-2xl font-bold">
                <BalanceAmount amount={demoValues.savings} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Net Worth (Income - Expenses)</label>
              <div className="text-2xl font-bold">
                <BalanceAmount amount={demoValues.income - demoValues.expense} showSign />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Different Amount Sizes */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Various Amounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Small Amount</label>
              <div className="text-xl font-bold text-slate-800">
                <CurrencyDisplay amount={demoValues.smallAmount} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Large Amount</label>
              <div className="text-xl font-bold text-slate-800">
                <CurrencyDisplay amount={demoValues.largeAmount} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Large Amount (Compact)</label>
              <div className="text-xl font-bold text-slate-800">
                <CompactCurrency amount={demoValues.largeAmount} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zero and Edge Cases */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Edge Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Zero Amount</label>
              <div className="text-xl font-bold text-slate-800">
                <CurrencyDisplay amount={0} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Negative Balance</label>
              <div className="text-xl font-bold">
                <BalanceAmount amount={-500.75} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Very Small Amount</label>
              <div className="text-xl font-bold text-slate-800">
                <CurrencyDisplay amount={0.01} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Styling */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Custom Styling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">With Prefix</label>
              <div className="text-xl font-bold text-slate-800">
                <CurrencyDisplay 
                  amount={demoValues.balance} 
                  prefix="Balance:" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">With Suffix</label>
              <div className="text-xl font-bold text-slate-800">
                <CurrencyDisplay 
                  amount={demoValues.savings} 
                  suffix="saved" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Custom Class</label>
              <div className="text-xl font-bold">
                <CurrencyDisplay 
                  amount={demoValues.income} 
                  className="text-green-600 bg-green-50 px-2 py-1 rounded" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Notes */}
      <Card className="bg-blue-50/50 border border-blue-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-700">
          <p><strong>Currency Storage:</strong> User preference is stored in the database and persisted in localStorage via Zustand.</p>
          <p><strong>SSR Compatibility:</strong> The CurrencyProvider initializes currency on page load and prevents hydration mismatches.</p>
          <p><strong>Real-time Updates:</strong> Currency changes are immediately reflected across all components without page reload.</p>
          <p><strong>Formatting:</strong> Uses Intl.NumberFormat for proper localization and currency symbol placement.</p>
          <p><strong>Components Available:</strong> CurrencyDisplay, IncomeAmount, ExpenseAmount, BalanceAmount, CompactCurrency</p>
        </CardContent>
      </Card>
    </div>
  )
}
