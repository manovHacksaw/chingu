"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { transactionSchema } from "@/lib/schema";
import { useFetch } from "@/hooks/use-fetch";
import { createTransaction, updateTransaction, scanReceipt } from "@/actions/transactions";
import { toast } from "sonner";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, DollarSign, ArrowUpRight, ArrowDownLeft, ScanLine } from "lucide-react";

/*
* GeminiStar Component
* A simple SVG component for the Gemini AI star logo.
*/
const GeminiStar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#4285F4'}} />
                <stop offset="100%" style={{stopColor: '#9B72CB'}} />
            </linearGradient>
        </defs>
        <path d="M12 2L9.46 9.46L2 12L9.46 14.54L12 22L14.54 14.54L22 12L14.54 9.46L12 2Z" fill="url(#gemini-gradient)"/>
    </svg>
);

/*
* ReceiptScanner Component
* A minimal, dotted-border component for uploading and scanning receipts.
*/
const ReceiptScanner = ({ onDataScanned }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [fileError, setFileError] = useState(null);
  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
    error,
  } = useFetch(scanReceipt);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    setFileError(null); // Reset file-specific error on new selection

    if (!selectedFile) return;

    // Restrict file size to 5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (selectedFile.size > MAX_FILE_SIZE) {
      const errorMsg = "File is too large. Please select a file under 5MB.";
      setFileError(errorMsg);
      toast.error("Upload Failed", { description: errorMsg });
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the file input
      }
      return;
    }
    
    setFileName(selectedFile.name);
    try {
      await scanReceiptFn(selectedFile);
    } catch (err) {
      console.error("[ReceiptScanner] Error during scan:", err);
    }
  };

  useEffect(() => {
    if (scannedData && scannedData.success && scannedData.data && onDataScanned) {
      onDataScanned(scannedData.data);
    }
  }, [scannedData, onDataScanned]);

  return (
    <div
      className="relative"
      onClick={() => !scanReceiptLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={scanReceiptLoading}
      />
      <div className={cn(
        "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl text-center transition-colors duration-200",
        scanReceiptLoading 
          ? "border-slate-300 bg-slate-50/80" 
          : "border-slate-300 cursor-pointer hover:border-slate-400 hover:bg-slate-50/50",
        fileError && "border-red-500 bg-red-50/50" // Add red border on file error
      )}>
        {scanReceiptLoading ? (
          <>
            <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Scanning...</p>
            <p className="text-xs text-slate-500 truncate max-w-full px-4">{fileName}</p>
          </>
        ) : (
          <>
            <ScanLine className="h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Scan a Receipt</p>
            <p className="text-xs text-slate-500">Click to upload an image or PDF (Max 5MB)</p>
          </>
        )}
      </div>
      {(error || fileError) && !scanReceiptLoading && (
        <p className="text-sm text-red-500 mt-2 text-center">
          Scan failed: {fileError || error.message || "Please try a different file."}
        </p>
      )}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
        <GeminiStar />
        <span>Powered by Gemini AI</span>
      </div>
    </div>
  );
};


const AddTransactionForm = ({ accounts, categories, editMode = false, initialData }) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const editId = editMode ? initialData?.id : null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: editMode && initialData ? {
      type: initialData.type,
      amount: String(initialData.amount),
      description: initialData.description || "",
      accountId: initialData.accountId || accounts?.find((a) => a.isDefault)?.id || accounts?.[0]?.id || "",
      category: initialData.category || "",
      date: new Date(initialData.date),
      isRecurring: initialData.isRecurring || false,
      recurringInterval: initialData.recurringInterval || undefined,
    } : {
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

  // Populate form when in edit mode - only run once when component mounts
  useEffect(() => {
    if (editMode && initialData && !isFormInitialized) {
      console.log("INITIAL DATA", initialData);
      reset({
        type: initialData.type,
        amount: String(initialData.amount),
        description: initialData.description || "",
        accountId: initialData.accountId || accounts?.find((a) => a.isDefault)?.id || accounts?.[0]?.id || "",
        category: initialData.category || "",
        date: new Date(initialData.date),
        isRecurring: initialData.isRecurring || false,
        recurringInterval: initialData.recurringInterval || undefined,
      });
      setIsFormInitialized(true);
    }
  }, [editMode, initialData, reset, accounts, isFormInitialized]);

  const { loading, fn: submitTransaction } = useFetch(
    editMode ? updateTransaction : createTransaction
  );

  const type = watch("type");
  const isRecurring = watch("isRecurring");

  // Filter categories based on the selected transaction type
  const availableCategories = useMemo(() => {
    return categories?.filter(c => c.type === type).map(c => c.name) || [];
  }, [categories, type]);

  // When transaction type changes, reset the category field (but not during initial load in edit mode)
  useEffect(() => {
    // Skip category reset during initial form population in edit mode
    if (editMode && !isFormInitialized) {
      return;
    }
    
    // Don't reset category if in edit mode and the type hasn't changed from initial
    if (editMode && initialData && initialData.type === type) {
      return;
    }
    
    // Only reset category if it's not valid for the current type
    const currentCategory = watch("category");
    if (currentCategory && !availableCategories.includes(currentCategory)) {
      setValue("category", "", { shouldValidate: false });
      clearErrors("category");
    }
  }, [type, setValue, clearErrors, editMode, initialData, isFormInitialized, availableCategories, watch]);

  const onSubmit = async (data) => {
    const result = editMode
      ? await submitTransaction(editId, data)
      : await submitTransaction(data);

    if (result.success) {
      setIsRedirecting(true);
      toast.success(editMode ? "Transaction Updated" : "Transaction Added", {
        description: "Your records have been updated successfully.",
      });
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } else {
      toast.error(`Failed to ${editMode ? 'update' : 'add'} transaction`, {
        description: result.error || "An unexpected error occurred.",
      });
    }
  };
  
  const isLoading = loading || isSubmitting;

  // If redirecting, show a styled spinner and message
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
            <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700">
            {editMode ? "Updating Transaction..." : "Adding Transaction..."}
        </h3>
        <p className="text-slate-500 mt-2">Redirecting to your dashboard.</p>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto my-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-xl rounded-2xl">
      <CardHeader>
        <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                type === "INCOME"
                ? "bg-gradient-to-br from-green-400 to-emerald-500"
                : "bg-gradient-to-br from-red-400 to-pink-500"
            }`}>
                {type === "INCOME" ? (
                    <ArrowUpRight className="h-6 w-6 text-white" />
                ) : (
                    <ArrowDownLeft className="h-6 w-6 text-white" />
                )}
            </div>
            <div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                    {editMode ? "Edit Transaction" : "Create Transaction"}
                </CardTitle>
                <CardDescription className="text-slate-600">
                    {editMode ? "Update the details of your transaction." : "Record a new income or expense."}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Receipt Scanner - only show in create mode */}
        {!editMode && (
          <div className="mb-8">
            <ReceiptScanner onDataScanned={useCallback((data) => {
              if (data.type) setValue('type', data.type, { shouldValidate: true });
              if (data.amount) setValue('amount', String(data.amount), { shouldValidate: true });
              if (data.description) setValue('description', data.description, { shouldValidate: true });
              if (data.date) setValue('date', new Date(data.date), { shouldValidate: true });
              if (data.suggested_category) {
                  const matchedCategory = availableCategories.find(cat => cat.toLowerCase() === data.suggested_category.toLowerCase());
                  if (matchedCategory) setValue('category', matchedCategory, { shouldValidate: true });
              }
              toast.success('Receipt Scanned!', { description: 'Form has been pre-filled with extracted data.' });
            }, [setValue, availableCategories])} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <SelectTrigger className={`w-full rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 ${errors.type ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  className={`pl-10 block w-full rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 ${errors.amount ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  {...register("amount")}
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value) => {
                    field.onChange(value);
                    clearErrors("category");
                  }} disabled={isLoading || availableCategories.length === 0}>
                    <SelectTrigger className={`w-full rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 ${errors.category ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
            </div>

            {/* Account */}
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-slate-700 mb-1">Account</label>
              <Controller
                control={control}
                name="accountId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <SelectTrigger className={`w-full rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 ${errors.accountId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.accountId && <p className="mt-1 text-sm text-red-500">{errors.accountId.message}</p>}
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
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
                        "w-full justify-start text-left font-normal rounded-xl border-slate-200 hover:bg-slate-50 bg-white/80 focus:ring-2 focus:ring-blue-100 focus:border-blue-400",
                        !field.value && "text-slate-500",
                        errors.date && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <Textarea
              id="description"
              placeholder="e.g., Coffee with colleagues"
              className={`block w-full rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 ${errors.description ? 'border-red-500' : ''}`}
              disabled={isLoading}
              {...register("description")}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Recurring Transaction */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <Controller
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <Checkbox id="isRecurring" checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} className="rounded-md data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"/>
                )}
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-slate-700">This is a recurring transaction</label>
            </div>

            {isRecurring && (
              <div className="pl-6">
                <label htmlFor="recurringInterval" className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                <Controller
                  control={control}
                  name="recurringInterval"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <SelectTrigger className={`w-full rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 ${errors.recurringInterval ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.recurringInterval && <p className="mt-1 text-sm text-red-500">{errors.recurringInterval.message}</p>}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-2xl border-slate-200 hover:bg-slate-50 bg-transparent"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !accounts || accounts.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editMode ? "Saving..." : "Adding..."}
                  </>
                ) : (
                  editMode ? "Save Changes" : "Add Transaction"
                )}
              </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTransactionForm;
