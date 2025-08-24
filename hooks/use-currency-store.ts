import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Currency, DEFAULT_CURRENCY } from '@/lib/currency'

interface CurrencyState {
  currency: Currency
  isLoading: boolean
  error: string | null
}

interface CurrencyActions {
  setCurrency: (currency: Currency) => void
  updateUserCurrency: (currency: Currency) => Promise<void>
  initializeCurrency: (currency?: Currency) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

type CurrencyStore = CurrencyState & CurrencyActions

const initialState: CurrencyState = {
  currency: DEFAULT_CURRENCY,
  isLoading: false,
  error: null,
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrency: (currency: Currency) => {
        set({ currency, error: null })
      },

      updateUserCurrency: async (currency: Currency) => {
        const { setLoading, setError, setCurrency } = get()
        
        try {
          setLoading(true)
          setError(null)

          const response = await fetch('/api/user/currency', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currency }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to update currency')
          }

          setCurrency(currency)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          setError(errorMessage)
          console.error('Failed to update user currency:', error)
        } finally {
          setLoading(false)
        }
      },

      initializeCurrency: (currency?: Currency) => {
        if (currency) {
          set({ currency, error: null })
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'currency-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currency: state.currency,
      }),
    }
  )
)

// Selectors for optimized re-renders
export const useCurrency = () => useCurrencyStore((state) => state.currency)
export const useCurrencyActions = () => useCurrencyStore((state) => ({
  setCurrency: state.setCurrency,
  updateUserCurrency: state.updateUserCurrency,
  initializeCurrency: state.initializeCurrency,
}))
export const useCurrencyState = () => useCurrencyStore((state) => ({
  currency: state.currency,
  isLoading: state.isLoading,
  error: state.error,
}))
