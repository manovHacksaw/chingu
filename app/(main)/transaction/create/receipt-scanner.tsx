"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { ScanLine, Image as ImageIcon, Loader2 } from "lucide-react"
import { useFetch } from '@/hooks/use-fetch'
import { scanReceipt } from '@/actions/transactions'

const ReceiptScanner = ({ onDataScanned }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
    error,
  } = useFetch(scanReceipt)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setFileName(selectedFile.name)

    const formData = new FormData()
    formData.append('file', selectedFile)

    await scanReceiptFn(selectedFile)
  }

  useEffect(() => {
    if (scannedData && onDataScanned) {
      console.log("Image Data: ", scannedData)
      onDataScanned(scannedData)
    }
  }, [scannedData])

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
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
        variant="default"
        className="gap-2 text-base font-medium"
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Scanning...
          </>
        ) : (
          <>
            <ScanLine className="h-5 w-5" />
            Scan your receipt
          </>
        )}
      </Button>

      {/* Filename */}
      {fileName && (
        <div className="text-sm text-muted-foreground">
          <ImageIcon className="inline h-4 w-4 mr-1" />
          {fileName}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-500 text-sm mt-2">
          Failed to scan receipt: {error.message || error}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-4">
        Powered by <span className="font-semibold">Gemini AI</span>
      </p>
    </div>
  )
}

export default ReceiptScanner