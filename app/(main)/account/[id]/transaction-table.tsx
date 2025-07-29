"use client"

import { useState, useMemo, FC } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ArrowUpDown, Clock, MoreHorizontal, Search, Filter, Download, Trash2, Edit, ArrowUpRight, ArrowDownLeft, Calendar, DollarSign } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useFetch } from '@/hooks/use-fetch'
import { deleteTransaction } from '@/actions/transactions'
import { toast } from 'sonner'

interface Transaction {
  id: string
  date: string | Date
  description: string
  category: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  isRecurring: boolean
  recurringInterval?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null
  nextRecurringDate?: string | Date | null
  lastProcessed?: string | Date | null
}

interface TransactionTableProps {
  transactions: Transaction[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const RECURRING_INTERVALS: Record<string, string> = {
  DAILY: 'Daily',
  MONTHLY: 'Monthly',
  WEEKLY: 'Weekly',
  YEARLY: 'Yearly',
}

const categoryColors: Record<string, string> = {
  food: '#ef4444',
  transport: '#3b82f6',
  entertainment: '#8b5cf6',
  shopping: '#f59e0b',
  utilities: '#10b981',
  healthcare: '#ec4899',
  education: '#6366f1',
  other: '#6b7280',
}

const TransactionTable: FC<TransactionTableProps> = ({ transactions }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction
    direction: 'ascending' | 'descending'
  } | null>({ key: 'date', direction: 'descending' })
  
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [recurringFilter, setRecurringFilter] = useState<string>('all')

  const router = useRouter()
  const { fn: deleteTransactionFn, loading: deleteTransactionLoading } = useFetch(deleteTransaction)

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(transactions.map(t => t.category))]
    return uniqueCategories.sort()
  }, [transactions])

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter
      const matchesRecurring = recurringFilter === 'all' || 
                              (recurringFilter === 'recurring' && transaction.isRecurring) ||
                              (recurringFilter === 'one-time' && !transaction.isRecurring)

      return matchesSearch && matchesCategory && matchesType && matchesRecurring
    })

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key]
        const valB = b[sortConfig.key]
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [transactions, sortConfig, searchTerm, categoryFilter, typeFilter, recurringFilter])

  const handleSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? new Set(filteredAndSortedTransactions.map(t => t.id)) : new Set())
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedRows)
    if (checked) newSelection.add(id)
    else newSelection.delete(id)
    setSelectedRows(newSelection)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTransactionFn(id)
      toast.success('Transaction deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete transaction')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return
    
    try {
      await Promise.all([...selectedRows].map(id => deleteTransactionFn(id)))
      toast.success(`${selectedRows.size} transactions deleted successfully!`)
      setSelectedRows(new Set())
    } catch (error) {
      toast.error('Failed to delete transactions')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setTypeFilter('all')
    setRecurringFilter('all')
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl border-chingu-peach-200 focus:border-chingu-peach-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 rounded-2xl border-chingu-peach-200 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 rounded-2xl border-chingu-peach-200 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select value={recurringFilter} onValueChange={setRecurringFilter}>
                <SelectTrigger className="w-36 rounded-2xl border-chingu-peach-200 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Recurring" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            {(searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || recurringFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="rounded-2xl border-chingu-peach-200 hover:bg-chingu-peach-50 bg-transparent"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
            
            <Button
              variant="outline"
              className="rounded-2xl border-chingu-peach-200 hover:bg-chingu-peach-50 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRows.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-chingu-peach-100 to-chingu-mint-100 rounded-2xl animate-fade-in">
            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-chingu-peach-300 to-chingu-mint-300 text-white border-0">
                {selectedRows.size} selected
              </Badge>
              <span className="text-sm text-gray-600">
                {selectedRows.size} transaction{selectedRows.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteTransactionLoading}
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
          </span>
          {filteredAndSortedTransactions.length > 0 && (
            <span>
              Total: {formatCurrency(
                filteredAndSortedTransactions.reduce((sum, t) => 
                  sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0
                )
              )}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-chingu-peach-200 overflow-hidden bg-white/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-chingu-peach-50 to-chingu-mint-50 hover:bg-gradient-to-r hover:from-chingu-peach-100 hover:to-chingu-mint-100">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={filteredAndSortedTransactions.length > 0 && selectedRows.size === filteredAndSortedTransactions.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                    {sortConfig?.key === 'date' && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('description')}>
                  <div className="flex items-center gap-2">
                    Description
                    {sortConfig?.key === 'description' && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-2">
                    Category
                    {sortConfig?.key === 'category' && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right font-semibold" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount
                    {sortConfig?.key === 'amount' && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold">Type</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Search className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No transactions found</p>
                      {(searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || recurringFilter !== 'all') && (
                        <Button variant="outline" onClick={clearFilters} size="sm" className="rounded-xl">
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTransactions.map((transaction, index) => (
                  <TableRow
                    key={transaction.id}
                    data-state={selectedRows.has(transaction.id) && 'selected'}
                    className="hover:bg-gradient-to-r hover:from-chingu-peach-50 hover:to-chingu-mint-50 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(transaction.id)}
                        onCheckedChange={(checked) => handleSelectRow(transaction.id, !!checked)}
                        aria-label={`Select row for ${transaction.description}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            transaction.type === 'INCOME'
                              ? 'bg-gradient-to-br from-chingu-mint-300 to-emerald-300'
                              : 'bg-gradient-to-br from-chingu-peach-300 to-pink-300'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? (
                            <ArrowUpRight className="h-4 w-4 text-white" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="font-medium">{transaction.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize rounded-full border-2"
                        style={{
                          borderColor: categoryColors[transaction.category] || '#6b7280',
                          color: categoryColors[transaction.category] || '#6b7280',
                          backgroundColor: `${categoryColors[transaction.category] || '#6b7280'}10`,
                        }}
                      >
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-bold text-lg ${
                          transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-pink-600'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.isRecurring && transaction.recurringInterval ? (
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="cursor-help bg-gradient-to-r from-chingu-lavender-200 to-chingu-sky-200 text-gray-700 border-0 rounded-full"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {RECURRING_INTERVALS[transaction.recurringInterval]}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl">
                            <div className="space-y-1">
                              {transaction.lastProcessed && (
                                <p className="text-xs">
                                  Last: {format(new Date(transaction.lastProcessed), 'PPp')}
                                </p>
                              )}
                              {transaction.nextRecurringDate && (
                                <p className="text-xs">
                                  Next: {format(new Date(transaction.nextRecurringDate), 'PPp')}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge variant="outline" className="rounded-full">
                          One-Time
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg"
                            onClick={() => router.push(`/transaction/create?edit=true&id=${transaction.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer rounded-lg focus:text-red-600"
                            disabled={deleteTransactionLoading}
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default TransactionTable
