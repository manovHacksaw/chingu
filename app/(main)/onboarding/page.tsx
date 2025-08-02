import { CurrencySetup } from '@/components/onboarding/currency-setup'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome to Finance Tracker
          </h1>
          <p className="text-slate-600">
            Let's set up your account to get started
          </p>
        </div>
        
        <CurrencySetup />
      </div>
    </div>
  )
}
