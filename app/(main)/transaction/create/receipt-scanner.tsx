"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { ScanLine, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react"
import { useFetch } from '@/hooks/use-fetch'
import { scanReceipt } from '@/actions/transactions'

const ReceiptScanner = ({ onDataScanned }) => {
  // LOG: Component initialization
  console.log("[ReceiptScanner] Component initialized with onDataScanned callback:", !!onDataScanned)
  
  const fileInputRef = useRef(null)
  const [fileName, setFileName] = useState(null)
  const [file, setFile] = useState(null)
  const [scanSuccess, setScanSuccess] = useState(false)

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
    error,
  } = useFetch(scanReceipt)

  const handleButtonClick = () => {
    console.log("[ReceiptScanner] Scan button clicked, opening file picker")
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      console.log("[ReceiptScanner] No file selected")
      return
    }

    console.log("[ReceiptScanner] File selected:", {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    })

    setFile(selectedFile)
    setFileName(selectedFile.name)
    setScanSuccess(false)

    try {
      console.log("[ReceiptScanner] Starting receipt scan...")
      await scanReceiptFn(selectedFile)
    } catch (err) {
      console.error("[ReceiptScanner] Error during scan:", err)
    }
  }

  useEffect(() => {
    console.log("[ReceiptScanner] useEffect triggered - scannedData:", scannedData, "error:", error)
    
    if (scannedData && scannedData.success && scannedData.data && onDataScanned) {
      console.log("[ReceiptScanner] Valid scanned data received:", scannedData.data)
      setScanSuccess(true)
      onDataScanned(scannedData.data)
      
      // Reset success indicator after 3 seconds
      setTimeout(() => {
        setScanSuccess(false)
      }, 3000)
    } else if (scannedData && !scannedData.success) {
      console.warn("[ReceiptScanner] Scan completed but was not successful:", scannedData)
    } else if (error) {
      console.error("[ReceiptScanner] Scan error:", error)
    }
  }, [scannedData, error])

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto p-4 border rounded-lg bg-gray-50">
      {/* Hidden File Input */}
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload/Scan Button */}
      <Button
        onClick={handleButtonClick}
        variant={scanSuccess ? "outline" : "default"}
        className="gap-2 text-base font-medium w-full"
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Scanning receipt...
          </>
        ) : scanSuccess ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Receipt scanned successfully!
          </>
        ) : (
          <>
            <ScanLine className="h-5 w-5" />
            Scan Receipt
          </>
        )}
      </Button>

      {/* Filename */}
      {fileName && !scanSuccess && (
        <div className="text-sm text-muted-foreground flex items-center">
          <ImageIcon className="inline h-4 w-4 mr-1" />
          {fileName}
        </div>
      )}

      {/* Success Message */}
      {scanSuccess && (
        <div className="text-sm text-green-600 font-medium">
          Receipt data has been added to the form below
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded border">
          <strong>Scan failed:</strong> {error.message || error}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-2">
        Upload a receipt image to auto-fill transaction details
      </p>
      <p className="text-xs text-muted-foreground">
        Powered by <span className="font-semibold">Gemini AI</span>
      </p>
    </div>
  )
}

export default ReceiptScanner