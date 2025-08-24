'use client'

import { useCurrency } from '@/hooks/use-currency-store'
import { formatCurrency, formatCurrencyCompact, type Currency } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface CurrencyProps {
  amount: number | string
  currency?: Currency
  compact?: boolean
  className?: string
  showSign?: boolean
  colorized?: boolean
  prefix?: string
  suffix?: string
}

export function CurrencyDisplay({
  amount,
  currency: overrideCurrency,
  compact = false,
  className,
  showSign = false,
  colorized = false,
  prefix,
  suffix,
}: CurrencyProps) {
  const storeCurrency = useCurrency()
  const activeCurrency = overrideCurrency || storeCurrency
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const isNegative = numAmount < 0
  const isPositive = numAmount > 0

  const formatFunction = compact ? formatCurrencyCompact : formatCurrency
  const formattedAmount = formatFunction(Math.abs(numAmount), activeCurrency)
  
  let displayValue = formattedAmount
  
  if (showSign && isNegative) {
    displayValue = `-${formattedAmount}`
  } else if (showSign && isPositive) {
    displayValue = `+${formattedAmount}`
  }

  if (prefix) {
    displayValue = `${prefix} ${displayValue}`
  }
  
  if (suffix) {
    displayValue = `${displayValue} ${suffix}`
  }

  const colorClass = colorized 
    ? isNegative 
      ? 'text-red-600' 
      : isPositive 
        ? 'text-green-600' 
        : 'text-slate-600'
    : ''

  return (
    <span className={cn('font-medium', colorClass, className)}>
      {displayValue}
    </span>
  )
}

// Specialized components for common use cases
export function IncomeAmount({ amount, ...props }: Omit<CurrencyProps, 'colorized' | 'showSign'>) {
  return (
    <CurrencyDisplay 
      amount={amount} 
      colorized 
      showSign 
      {...props} 
    />
  )
}

export function ExpenseAmount({ amount, ...props }: Omit<CurrencyProps, 'colorized' | 'showSign'>) {
  return (
    <CurrencyDisplay 
      amount={-Math.abs(typeof amount === 'string' ? parseFloat(amount) : amount)} 
      colorized 
      showSign 
      {...props} 
    />
  )
}

export function BalanceAmount({ amount, ...props }: Omit<CurrencyProps, 'colorized'>) {
  return (
    <CurrencyDisplay 
      amount={amount} 
      colorized 
      {...props} 
    />
  )
}

export function CompactCurrency({ amount, ...props }: Omit<CurrencyProps, 'compact'>) {
  return (
    <CurrencyDisplay 
      amount={amount} 
      compact 
      {...props} 
    />
  )
}

// ✅ Fixed: alias without conflicting with Currency type
export { CurrencyDisplay as Currency }
