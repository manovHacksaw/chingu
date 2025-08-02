export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'SEK'

export const CURRENCIES: Record<Currency, {
  code: Currency
  symbol: string
  name: string
  locale: string
  decimals: number
}> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'en-GB',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    decimals: 0,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    decimals: 2,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    locale: 'de-CH',
    decimals: 2,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    locale: 'zh-CN',
    decimals: 2,
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    locale: 'sv-SE',
    decimals: 2,
  },
}

export const DEFAULT_CURRENCY: Currency = 'USD'

export const formatCurrency = (
  amount: number | string,
  currency: Currency = DEFAULT_CURRENCY,
  options?: Partial<Intl.NumberFormatOptions>
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return `${CURRENCIES[currency].symbol}0.00`
  }

  const currencyConfig = CURRENCIES[currency]
  
  try {
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: currencyConfig.decimals,
      maximumFractionDigits: currencyConfig.decimals,
      ...options,
    }).format(numAmount)
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const formattedAmount = numAmount.toFixed(currencyConfig.decimals)
    return `${currencyConfig.symbol}${formattedAmount}`
  }
}

export const formatCurrencyCompact = (
  amount: number | string,
  currency: Currency = DEFAULT_CURRENCY
): string => {
  return formatCurrency(amount, currency, {
    notation: 'compact',
    compactDisplay: 'short',
  })
}

export const parseCurrencyAmount = (value: string): number => {
  // Remove currency symbols and formatting, keep only numbers and decimal point
  const cleanValue = value.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

export const getCurrencySymbol = (currency: Currency): string => {
  return CURRENCIES[currency]?.symbol || '$'
}

export const getCurrencyList = (): Array<{code: Currency; name: string; symbol: string}> => {
  return Object.values(CURRENCIES).map(({ code, name, symbol }) => ({
    code,
    name,
    symbol,
  }))
}
