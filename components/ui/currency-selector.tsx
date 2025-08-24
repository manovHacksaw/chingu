'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Currency, getCurrencyList, CURRENCIES } from '@/lib/currency'

interface CurrencySelectorProps {
  value: Currency
  onValueChange: (currency: Currency) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  showFlag?: boolean
}

const currencyFlags: Record<Currency, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  INR: '🇮🇳',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  CHF: '🇨🇭',
  CNY: '🇨🇳',
  SEK: '🇸🇪',
}

export function CurrencySelector({
  value,
  onValueChange,
  disabled = false,
  placeholder = 'Select currency...',
  className,
  showFlag = true,
}: CurrencySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const currencyList = getCurrencyList()

  const selectedCurrency = CURRENCIES[value]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-white/50 backdrop-blur-sm border-slate-200/50',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center gap-2">
              {showFlag && <span className="text-lg">{currencyFlags[value]}</span>}
              <span className="font-medium">{selectedCurrency.symbol}</span>
              <span className="text-slate-600">{selectedCurrency.code}</span>
              <span className="hidden sm:inline text-slate-500">
                - {selectedCurrency.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <Globe className="h-4 w-4" />
              {placeholder}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-white/90 backdrop-blur-sm border-slate-200/50">
        <Command>
          <CommandInput 
            placeholder="Search currencies..." 
            className="border-none focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {currencyList.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={`${currency.code} ${currency.name}`}
                  onSelect={() => {
                    onValueChange(currency.code)
                    setOpen(false)
                  }}
                  className="cursor-pointer hover:bg-slate-50/80"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {showFlag && (
                      <span className="text-lg">
                        {currencyFlags[currency.code]}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {currency.symbol}
                      </span>
                      <span className="font-mono text-sm text-slate-600">
                        {currency.code}
                      </span>
                    </div>
                    <span className="text-slate-500 text-sm flex-1">
                      {currency.name}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === currency.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Compact version for smaller spaces
export function CurrencySelectorCompact({
  value,
  onValueChange,
  disabled = false,
  className,
}: Omit<CurrencySelectorProps, 'placeholder' | 'showFlag'>) {
  const [open, setOpen] = React.useState(false)
  const currencyList = getCurrencyList()
  const selectedCurrency = CURRENCIES[value]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-auto justify-between gap-1 bg-white/50 backdrop-blur-sm border-slate-200/50',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          <span className="font-medium">{selectedCurrency.symbol}</span>
          <span className="text-xs">{selectedCurrency.code}</span>
          <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-white/90 backdrop-blur-sm border-slate-200/50">
        <Command>
          <CommandInput 
            placeholder="Search..." 
            className="border-none focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {currencyList.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={`${currency.code} ${currency.name}`}
                  onSelect={() => {
                    onValueChange(currency.code)
                    setOpen(false)
                  }}
                  className="cursor-pointer hover:bg-slate-50/80"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium">{currency.symbol}</span>
                    <span className="font-mono text-sm">{currency.code}</span>
                    <span className="text-slate-500 text-sm">
                      {currency.name}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === currency.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
