'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useCurrencyStore } from '@/hooks/use-currency-store'
import { Currency, DEFAULT_CURRENCY } from '@/lib/currency'

interface CurrencyProviderProps {
  children: React.ReactNode
  initialCurrency?: Currency
}

export function CurrencyProvider({ children, initialCurrency }: CurrencyProviderProps) {
  const { isLoaded, user } = useUser()
  const { initializeCurrency, currency } = useCurrencyStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    const initCurrency = async () => {
      try {
        if (user) {
          // User is logged in, fetch their currency preference
          const response = await fetch('/api/user/currency')
          if (response.ok) {
            const data = await response.json()
            initializeCurrency(data.currency || DEFAULT_CURRENCY)
          } else {
            // Fallback to initial currency or default
            initializeCurrency(initialCurrency || DEFAULT_CURRENCY)
          }
        } else {
          // User not logged in, use default or provided initial currency
          initializeCurrency(initialCurrency || DEFAULT_CURRENCY)
        }
      } catch (error) {
        console.error('Failed to initialize currency:', error)
        initializeCurrency(initialCurrency || DEFAULT_CURRENCY)
      } finally {
        setIsInitialized(true)
      }
    }

    initCurrency()
  }, [isLoaded, user, initializeCurrency, initialCurrency])

  // Prevent hydration mismatch by not rendering until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook to check if currency is loaded
export function useCurrencyInitialized() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { isLoaded } = useUser()
  
  useEffect(() => {
    if (isLoaded) {
      setIsInitialized(true)
    }
  }, [isLoaded])
  
  return isInitialized
}
