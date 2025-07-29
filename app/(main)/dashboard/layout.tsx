import type React from "react"
import { Suspense } from "react"
import { BarLoader } from "react-spinners"
import Header from "@/components/header"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your financial overview with Chingu.</p>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <BarLoader color="#f97316" />
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  )
}

export default DashboardLayout
