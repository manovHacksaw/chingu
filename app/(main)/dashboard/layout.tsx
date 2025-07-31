import type React from "react"
import { Suspense } from "react"
import { BarLoader } from "react-spinners"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br min-w-full ">
      <div className="mx-auto px-4 py-8 max-w-8xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Financial Dashboard
              </h1>
              <p className="text-slate-600 text-lg">
                Your complete financial overview and insights
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Last updated</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <BarLoader color="#3b82f6" width={200} />
                <p className="text-slate-600 mt-4">Loading your financial data...</p>
              </div>
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
