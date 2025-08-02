"use client"

import { scanReceipt } from "@/actions/transactions";
import { useFetch } from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";
import { Loader2, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const ReceiptScanner = ({ onDataScanned }) => {
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
      console.log("RECEIVED", scannedData.data)
    }
  }, [scannedData]);

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
