"use client"

import { useState, useMemo, type FC, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import {
  ArrowUpDown,
  Clock,
  MoreHorizontal,
  Search,
  Download,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  AlertTriangle,
  X,
  FileText,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteTransaction, bulkDeleteTransaction } from "@/actions/transactions"
import { categoryColors } from "@/data/categories"

interface Transaction {
  id: string
  date: string | Date
  description: string
  category: string
  amount: number
  type: "INCOME" | "EXPENSE"
  isRecurring: boolean
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null
  nextRecurringDate?: string | Date | null
  lastProcessed?: string | Date | null
  account?: {
    name: string
    type: string
  }
}

interface TransactionTableProps {
  transactions: Transaction[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const RECURRING_INTERVALS: Record<string, string> = {
  DAILY: "Daily",
  MONTHLY: "Monthly",
  WEEKLY: "Weekly",
  YEARLY: "Yearly",
}

const TransactionTable: FC<TransactionTableProps> = ({ transactions }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction
    direction: "ascending" | "descending"
  } | null>({ key: "date", direction: "descending" })

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [recurringFilter, setRecurringFilter] = useState<string>("all")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  const router = useRouter()

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(transactions.map((t) => t.category))]
    return uniqueCategories.sort()
  }, [transactions])

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        (transaction.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.account?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter
      const matchesType = typeFilter === "all" || transaction.type === typeFilter
      const matchesRecurring =
        recurringFilter === "all" ||
        (recurringFilter === "recurring" && transaction.isRecurring) ||
        (recurringFilter === "one-time" && !transaction.isRecurring)

      return matchesSearch && matchesCategory && matchesType && matchesRecurring
    })

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key]
        const valB = b[sortConfig.key]

        // Handle nullish values first
        if (valA == null && valB == null) return 0
        if (valA == null) return sortConfig.direction === "ascending" ? -1 : 1
        if (valB == null) return sortConfig.direction === "ascending" ? 1 : -1

        if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1
        if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [transactions, sortConfig, searchTerm, categoryFilter, typeFilter, recurringFilter])

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage)

  // Get the transactions for the current page
  const paginatedTransactions = useMemo(() => {
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedTransactions.slice(startIndex, endIndex)
  }, [filteredAndSortedTransactions, currentPage, itemsPerPage])

  useEffect(() => {
    // Reset to the first page whenever filters change
    setCurrentPage(0)
  }, [searchTerm, categoryFilter, typeFilter, recurringFilter, itemsPerPage])

  const handleSort = (key: keyof Transaction) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? new Set(filteredAndSortedTransactions.map((t) => t.id)) : new Set())
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedRows)
    if (checked) newSelection.add(id)
    else newSelection.delete(id)
    setSelectedRows(newSelection)
  }

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleBulkDeleteClick = () => {
    if (selectedRows.size === 0) return
    setBulkDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    setDeleteLoading(transactionToDelete)
    try {
      const result = await deleteTransaction(transactionToDelete)
      if (result.success) {
        toast.success("Transaction deleted successfully!", {
          description: "The transaction has been removed from your account.",
        })
      } else {
        toast.error("Failed to delete transaction", {
          description: result.error || "Please try again.",
        })
      }
    } catch (error) {
      toast.error("Failed to delete transaction", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setDeleteLoading(null)
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedRows.size === 0) return

    setBulkDeleteLoading(true)
    try {
      const result = await bulkDeleteTransaction([...selectedRows])
      if (result.success) {
        toast.success(` ${selectedRows.size} transactions deleted successfully!`, {
          description: "The selected transactions have been removed from your accounts.",
        })
        setSelectedRows(new Set())
      } else {
        toast.error("Failed to delete transactions", {
          description: result.error || "Please try again.",
        })
      }
    } catch (error) {
      toast.error("Failed to delete transactions", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setBulkDeleteLoading(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setTypeFilter("all")
    setRecurringFilter("all")
  }

  const selectedTransactions = filteredAndSortedTransactions.filter((t) => selectedRows.has(t.id))
 const selectedTotal = selectedTransactions.reduce(
  (sum, t) => sum + (t.type === 'EXPENSE' ? Number(t.amount) : -Number(t.amount)),
  0
);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select value={recurringFilter} onValueChange={setRecurringFilter}>
                <SelectTrigger className="w-36 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
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
            {(searchTerm || categoryFilter !== "all" || typeFilter !== "all" || recurringFilter !== "all") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="rounded-2xl border-slate-200 hover:bg-slate-50 bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}

            <Button variant="outline" className="rounded-2xl border-slate-200 hover:bg-slate-50 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRows.size > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-sm px-3 py-1 rounded-full">
                      {selectedRows.size} selected
                    </Badge>
                    
                  </div>
                 <div className="text-sm text-slate-600">
  Total impact:{" "}
  <span className={`font-bold ${selectedTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
    {/* Show a plus sign for positive impact */}
    {selectedTotal >= 0 ? "+" : ""}
    {formatCurrency(selectedTotal)}
  </span>
</div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRows(new Set())}
                    className="rounded-xl border-slate-300 hover:bg-slate-50 bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDeleteClick}
                    disabled={bulkDeleteLoading}
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-slate-600 px-2">
          <span>
            Showing {paginatedTransactions.length} of {transactions.length} transactions
          </span>
          {filteredAndSortedTransactions.length > 0 && (
         <span>
  Total:{" "}
  <span
    className={`font-semibold ${
      filteredAndSortedTransactions.reduce(
        (sum, t) => sum + (t.type === "INCOME" ? Number(t.amount) : -Number(t.amount)),
        0,
      ) >= 0
        ? "text-green-600"
        : "text-red-600"
    }`}
  >
    {formatCurrency(
      filteredAndSortedTransactions.reduce(
        (sum, t) => sum + (t.type === "INCOME" ? Number(t.amount) : -Number(t.amount)),
        0,
      ),
    )}
  </span>
</span>
          )}
        </div>

        {/* Table */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-xl rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r hover:from-slate-100 hover:to-blue-100 border-b border-slate-200/50">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox
                    checked={
                      filteredAndSortedTransactions.length > 0 &&
                      selectedRows.size === filteredAndSortedTransactions.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                    className="rounded-lg data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </TableHead>
                <TableHead className="cursor-pointer font-semibold text-slate-700" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                    {sortConfig?.key === "date" && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-slate-700"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                    {sortConfig?.key === "description" && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-slate-700"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-2">
                    Category
                    {sortConfig?.key === "category" && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right font-semibold text-slate-700"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount
                    {sortConfig?.key === "amount" && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-slate-700">Type</TableHead>
                <TableHead className="text-right font-semibold text-slate-700 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-slate-600">No transactions found</p>
                        <p className="text-sm text-slate-500">
                          {searchTerm || categoryFilter !== "all" || typeFilter !== "all" || recurringFilter !== "all"
                            ? "Try adjusting your filters to see more results"
                            : "Start by adding your first transaction"}
                        </p>
                      </div>
                      {(searchTerm ||
                        categoryFilter !== "all" ||
                        typeFilter !== "all" ||
                        recurringFilter !== "all") && (
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          size="sm"
                          className="rounded-xl bg-transparent border-slate-200 hover:bg-slate-50"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction, index) => (
                  <TableRow
                    key={transaction.id}
                    data-state={selectedRows.has(transaction.id) && "selected"}
                    className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200 border-b border-slate-100 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selectedRows.has(transaction.id)}
                        onCheckedChange={(checked) => handleSelectRow(transaction.id, !!checked)}
                        aria-label={`Select row for ${transaction.description || " "}`}
                        className="rounded-lg data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                            transaction.type === "INCOME"
                              ? "bg-gradient-to-br from-green-400 to-emerald-500"
                              : "bg-gradient-to-br from-red-400 to-pink-500"
                          }`}
                        >
                          {transaction.type === "INCOME" ? (
                            <ArrowDownLeft className="h-5 w-5 text-white" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">
                            {transaction.description ? transaction.description : <i>No Description</i>}
                          </span>
                          {transaction.account && (
                            <p className="text-xs text-slate-500 mt-1">{transaction.account.name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize rounded-full border-1 font-medium"
                        style={{
                          borderColor: categoryColors[transaction.category] || "#64748b",
                          color: categoryColors[transaction.category] || "#64748b",
                          
                        }}
                      >
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-bold text-lg ${
                          transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.isRecurring && transaction.recurringInterval ? (
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="cursor-help bg-gradient-to-r from-purple-100 to-indigo-100 text-slate-700 border-0 rounded-full font-medium"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {RECURRING_INTERVALS[transaction.recurringInterval]}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl bg-white border border-slate-200 shadow-lg">
                            <div className="space-y-1">
                              {transaction.lastProcessed && (
                                <p className="text-xs">Last: {format(new Date(transaction.lastProcessed), "PPp")}</p>
                              )}
                              {transaction.nextRecurringDate && (
                                <p className="text-xs">
                                  Next: {format(new Date(transaction.nextRecurringDate), "PPp")}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge variant="outline" className="rounded-full font-medium border-slate-200 text-slate-600">
                          One-Time
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100"
                            disabled={deleteLoading === transaction.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-lg">
                          <DropdownMenuLabel className="text-slate-700">Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg focus:bg-blue-50"
                            onClick={() => router.push(`/transaction/create?edit=true&id=${transaction.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Transaction
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-200" />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer rounded-lg focus:text-red-600 focus:bg-red-50"
                            disabled={deleteLoading === transaction.id}
                            onClick={() => handleDeleteClick(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteLoading === transaction.id ? "Deleting..." : "Delete Transaction"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 px-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Rows per page:</span>
            <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-20 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm h-9 focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {[12, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 font-medium">
              Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="rounded-xl border-slate-200 hover:bg-slate-50 bg-transparent"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="rounded-xl border-slate-200 hover:bg-slate-50 bg-transparent"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl border-slate-200">
            <AlertDialogHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl font-bold text-slate-800">Delete Transaction</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-600">
                    Are you sure you want to delete this transaction? This action cannot be undone and will update your
                    account balance.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-2xl border-slate-200 hover:bg-slate-50 bg-transparent">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={!!deleteLoading}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl"
              >
                {deleteLoading ? "Deleting..." : "Delete Transaction"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl border-slate-200">
            <AlertDialogHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl font-bold text-slate-800">
                    Delete {selectedRows.size} Transactions
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-600">
                    Are you sure you want to delete {selectedRows.size} selected transactions? This action cannot be
                    undone and will update your account balances accordingly.
                  </AlertDialogDescription>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                <p className="text-sm text-slate-700 mb-2">
                  <strong>Impact on your accounts:</strong>
                </p>
               <p className={`text-lg font-bold ${selectedTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
  {selectedTotal >= 0 ? "+" : ""}
  {formatCurrency(selectedTotal)}
</p>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-2xl border-slate-200 hover:bg-slate-50 bg-transparent">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleteLoading}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl"
              >
                {bulkDeleteLoading ? "Deleting..." : `Delete ${selectedRows.size} Transactions`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

export default TransactionTable
