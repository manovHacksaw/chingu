import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

const AccountNotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Account Not Found</h1>
          <p className="text-slate-600 mb-6">
            The account you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              variant="outline"
              className="flex-1 rounded-2xl border-slate-200 hover:bg-slate-50 bg-transparent"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl"
            >
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountNotFound
