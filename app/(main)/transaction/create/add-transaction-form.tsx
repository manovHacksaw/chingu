"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/schema";
import { useFetch } from "@/hooks/use-fetch";
import { createTransaction } from "@/actions/transactions";
import { CalendarIcon, DollarSign, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import ReceiptScanner from "./receipt-scanner";

const AddTransactionForm = ({ accounts }) => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedData, setScannedData] = useState(null);

  const {
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: accounts?.find((a) => a.isDefault)?.id || accounts?.[0]?.id || "",
      category: "",
      date: new Date(),
      isRecurring: false,
      recurringInterval: undefined,
    },
  });

  const { loading, fn: createTx } = useFetch(createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");

  // Common categories for different transaction types
  const incomeCategories = [
    "Salary", "Freelance", "Business", "Investment", "Rental", "Gift", "Bonus", "Other Income"
  ];
  
  const expenseCategories = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", 
    "Healthcare", "Education", "Travel", "Insurance", "Personal Care", "Home", "Other Expense"
  ];

  const availableCategories = type === "INCOME" ? incomeCategories : expenseCategories;

  // Function to handle scanned receipt data
  const handleScannedData = (data) => {
    if (data?.success && data?.data) {
      const { amount, type, date, description, suggested_category } = data.data;
      
      // Set form values with scanned data
      if (amount) setValue("amount", amount.toString());
      if (type) setValue("type", type);
      if (date) setValue("date", new Date(date));
      if (description) setValue("description", description);
      
      // Map suggested category to available categories
      if (suggested_category) {
        // Try to find a matching category (case-insensitive)
        const matchingCategory = availableCategories.find(
          cat => cat.toLowerCase().includes(suggested_category.toLowerCase()) ||
                 suggested_category.toLowerCase().includes(cat.toLowerCase())
        );
        
        if (matchingCategory) {
          setValue("category", matchingCategory);
        } else if (suggested_category.toLowerCase().includes('food') || 
                   suggested_category.toLowerCase().includes('restaurant')) {
          setValue("category", "Food & Dining");
        }
      }
      
      setScannedData(data);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Reset category when type changes
  useEffect(() => {
    setValue("category", "");
  }, [type, setValue]);

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      const result = await createTx(data);
      
      if (result.success) {
        setSuccessMessage("Transaction added successfully!");
        reset({
          type: "EXPENSE",
          amount: "",
          description: "",
          accountId: accounts?.find((a) => a.isDefault)?.id || accounts?.[0]?.id || "",
          category: "",
          date: new Date(),
          isRecurring: false,
          recurringInterval: undefined,
        });
        setScannedData(null);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setErrorMessage(result.error || "Failed to add transaction. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Transaction creation error:", error);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="space-y-6 max-w-md mx-auto py-6">
   
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Add Transaction</h2>
        <p className="text-muted-foreground">Record your income or expense</p>
      </div>

      <ReceiptScanner onDataScanned={handleScannedData} />

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Scanned Data Confirmation */}
      {scannedData && (
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Receipt scanned successfully! Form has been populated with extracted data.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Transaction Type</label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                <SelectTrigger className={cn(errors.type && "border-red-500")}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Income</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="EXPENSE">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Expense</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className={cn("pl-10", errors.amount && "border-red-500")}
              disabled={isLoading}
              {...register("amount")}
            />
          </div>
          {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                <SelectTrigger className={cn(errors.category && "border-red-500")}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
        </div>

        {/* Account */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Account</label>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                <SelectTrigger className={cn(errors.accountId && "border-red-500")}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts && accounts.length > 0 ? (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{account.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({account.type})</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      No accounts available
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountId && <p className="text-sm text-red-500">{errors.accountId.message}</p>}
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                      errors.date && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <Textarea
            placeholder="Add a note about this transaction (optional)"
            className={cn(errors.description && "border-red-500")}
            disabled={isLoading}
            {...register("description")}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        {/* Recurring Transaction */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="isRecurring"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
            <label className="text-sm font-medium text-gray-700">Make this a recurring transaction</label>
          </div>

          {/* Recurring Interval */}
          {isRecurring && (
            <div className="space-y-2 pl-6">
              <label className="text-sm font-medium text-gray-700">Repeat every</label>
              <Controller
                control={control}
                name="recurringInterval"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <SelectTrigger className={cn(errors.recurringInterval && "border-red-500")}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.recurringInterval && (
                <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !accounts || accounts.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Transaction...
            </>
          ) : (
            "Add Transaction"
          )}
        </Button>

        {/* Validation Messages */}
        {(!accounts || accounts.length === 0) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to create at least one account before adding transactions.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
};

export default AddTransactionForm;