"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { transactionSchema } from "@/lib/schema";
import { useFetch } from "@/hooks/use-fetch";
import { createTransaction, updateTransaction } from "@/actions/transactions";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, DollarSign, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import ReceiptScanner from "./receipt-scanner";

const AddTransactionForm = ({ accounts, editMode = false, initialData }) => {
  // LOG: Log initial props on component render
  console.log("--- [AddTransactionForm] Component Render ---", { 
    editMode, 
    hasInitialData: !!initialData, 
    accountsCount: accounts?.length 
  });
  
  const router = useRouter();
  
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const editId = editMode ? initialData?.id : null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
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

  useEffect(() => {
    if (editMode && initialData) {
      // LOG: Log the data being used to populate the form in edit mode
      console.log("[AddTransactionForm useEffect] Populating form for edit mode. ID:", editId, { data: initialData });
      reset({
        type: initialData.type,
        amount: String(initialData.amount),
        description: initialData.description || "",
        accountId: initialData.accountId,
        category: initialData.category,
        date: new Date(initialData.date),
        isRecurring: initialData.isRecurring,
        recurringInterval: initialData.recurringInterval || undefined,
      });
    }
  }, [editMode, initialData, reset, editId]);

  const { loading, fn: submitTransaction } = useFetch(
    editMode ? updateTransaction : createTransaction
  );

  const type = watch("type");
  const isRecurring = watch("isRecurring");

  const incomeCategories = [
    "Salary", "Freelance", "Business", "Investment", "Rental", "Gift", "Bonus", "Other Income",
  ];
  const expenseCategories = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities",
    "Healthcare", "Education", "Travel", "Insurance", "Personal Care", "Home", "Other Expense",
  ];
  const availableCategories = type === "INCOME" ? incomeCategories : expenseCategories;

  // Receipt scanner callback function
  const handleReceiptDataScanned = (scannedData) => {
    console.log("[AddTransactionForm] Receipt data received from scanner:", scannedData);
    
    try {
      // Update form fields with scanned data
      if (scannedData.amount && scannedData.amount > 0) {
        console.log("[AddTransactionForm] Setting amount to:", scannedData.amount);
        setValue("amount", String(scannedData.amount), { shouldValidate: true });
      }

      if (scannedData.type && (scannedData.type === "INCOME" || scannedData.type === "EXPENSE")) {
        console.log("[AddTransactionForm] Setting type to:", scannedData.type);
        setValue("type", scannedData.type, { shouldValidate: true });
      }

      if (scannedData.date) {
        try {
          const parsedDate = new Date(scannedData.date);
          if (!isNaN(parsedDate.getTime())) {
            console.log("[AddTransactionForm] Setting date to:", parsedDate);
            setValue("date", parsedDate, { shouldValidate: true });
          }
        } catch (dateError) {
          console.warn("[AddTransactionForm] Could not parse date from receipt:", scannedData.date, dateError);
        }
      }

      if (scannedData.description) {
        console.log("[AddTransactionForm] Setting description to:", scannedData.description);
        setValue("description", scannedData.description, { shouldValidate: true });
      }

      // Handle category mapping
      if (scannedData.category || scannedData.suggested_category) {
        const suggestedCategory = scannedData.category || scannedData.suggested_category;
        console.log("[AddTransactionForm] Suggested category:", suggestedCategory);
        
        // Check if the suggested category exists in our available categories
        const normalizedSuggestion = suggestedCategory.toLowerCase();
        const matchedCategory = availableCategories.find(cat => 
          cat.toLowerCase().includes(normalizedSuggestion) || 
          normalizedSuggestion.includes(cat.toLowerCase())
        );
        
        if (matchedCategory) {
          console.log("[AddTransactionForm] Mapped category to:", matchedCategory);
          setValue("category", matchedCategory, { shouldValidate: true });
        } else {
          console.log("[AddTransactionForm] Could not map category, using Other");
          setValue("category", type === "INCOME" ? "Other Income" : "Other Expense", { shouldValidate: true });
        }
      }

      // Show success message
      setSuccessMessage("Receipt scanned successfully! Form has been pre-filled with the extracted data.");
      setTimeout(() => setSuccessMessage(""), 5000);

    } catch (error) {
      console.error("[AddTransactionForm] Error processing scanned receipt data:", error);
      setErrorMessage("Receipt was scanned but there was an error processing the data. Please check and fill in the form manually.");
      setTimeout(() => setErrorMessage(""), 8000);
    }
  };

  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => setSuccessMessage(""), 5000);
    }
    if (errorMessage) {
      timer = setTimeout(() => setErrorMessage(""), 8000);
    }
    return () => clearTimeout(timer);
  }, [successMessage, errorMessage]);

  useEffect(() => {
    // LOG: Log when the transaction type changes to confirm category reset logic
    console.log(`[AddTransactionForm useEffect] Transaction type is now '${type}'. Resetting category field.`);
    setValue("category", "", { shouldValidate: true });
  }, [type, setValue]);

  const onSubmit = async (data) => {
    // LOG: Log the validated form data upon submission
    console.log("[AddTransactionForm onSubmit] Form submission initiated.", { mode: editMode ? "edit" : "create", data });
    
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = editMode
        ? await submitTransaction(editId, data)
        : await submitTransaction(data);

      // LOG: Log the response from the server action
      console.log("[AddTransactionForm onSubmit] API call result:", result);

      if (result.success) {
        setSuccessMessage(
          editMode
            ? "Transaction updated successfully!"
            : "Transaction added successfully!"
        );

        if (!editMode) {
          reset();
        }

        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);

      } else {
        // LOG: Log specific backend error message
        console.warn("[AddTransactionForm onSubmit] API returned an error:", result);
        setErrorMessage(result.error || `Failed to ${editMode ? 'update' : 'add'} transaction.`);
      }
    } catch (error) {
      // LOG: Log any unexpected errors during the submission process
      console.error("[AddTransactionForm onSubmit] An unexpected error occurred during submission:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="space-y-6 max-w-md mx-auto py-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{editMode ? "Edit Transaction" : "Add Transaction"}</h2>
        <p className="text-muted-foreground">
          {editMode ? "Update the details of your transaction" : "Record your income or expense"}
        </p>
      </div>

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Receipt Scanner - only show in create mode */}
      {!editMode && (
        <ReceiptScanner onDataScanned={handleReceiptDataScanned} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
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

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !accounts || accounts.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Saving Changes..." : "Adding Transaction..."}
            </>
          ) : (
            editMode ? "Save Changes" : "Add Transaction"
          )}
        </Button>

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