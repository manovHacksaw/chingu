'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CurrencySelector } from '@/components/ui/currency-selector'
import { useCurrencyStore } from '@/hooks/use-currency-store'
import { Currency, DEFAULT_CURRENCY } from '@/lib/currency'
import { Globe, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CurrencySetupProps {
  onComplete?: () => void
  skipable?: boolean
  className?: string
}

export function CurrencySetup({ 
  onComplete, 
  skipable = true, 
  className 
}: CurrencySetupProps) {
  const router = useRouter()
  const { updateUserCurrency, isLoading } = useCurrencyStore()
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(DEFAULT_CURRENCY)

  const handleSaveCurrency = async () => {
    try {
      await updateUserCurrency(selectedCurrency)
      toast.success('Currency preference saved successfully!')
      
      if (onComplete) {
        onComplete()
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Failed to save currency preference. Please try again.')
      console.error('Currency setup error:', error)
    }
  }

  const handleSkip = () => {
    if (onComplete) {
      onComplete()
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Card className={`w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg ${className}`}>
      <CardHeader className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Globe className="h-8 w-8 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Choose Your Currency
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            Select your preferred currency for displaying all monetary values in the app.
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">
            Preferred Currency
          </label>
          <CurrencySelector
            value={selectedCurrency}
            onValueChange={setSelectedCurrency}
            placeholder="Select your currency..."
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500">
            You can change this later in your account settings.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleSaveCurrency}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Save & Continue
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>

          {skipable && (
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full text-slate-600 hover:text-slate-800"
            >
              Skip for now
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            This will be used for all transactions, budgets, and financial displays.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for settings or profile pages
export function CurrencySetupCompact({ 
  onComplete, 
  className 
}: Omit<CurrencySetupProps, 'skipable'>) {
  const { updateUserCurrency, isLoading, currency } = useCurrencyStore()
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency)

  const handleSaveCurrency = async () => {
    try {
      await updateUserCurrency(selectedCurrency)
      toast.success('Currency updated successfully!')
      onComplete?.()
    } catch (error) {
      toast.error('Failed to update currency preference.')
      console.error('Currency update error:', error)
    }
  }

  const hasChanged = selectedCurrency !== currency

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">
          Display Currency
        </label>
        <CurrencySelector
          value={selectedCurrency}
          onValueChange={setSelectedCurrency}
          disabled={isLoading}
          className="max-w-sm"
        />
      </div>

      {hasChanged && (
        <Button 
          onClick={handleSaveCurrency}
          disabled={isLoading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </div>
          ) : (
            'Update Currency'
          )}
        </Button>
      )}
    </div>
  )
}
