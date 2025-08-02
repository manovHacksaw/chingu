import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencySetupCompact } from '@/components/onboarding/currency-setup'
import { Separator } from '@/components/ui/separator'
import { Globe, User, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-600">
          Manage your account preferences and app settings.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        
        {/* Currency Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Currency Preferences</CardTitle>
                <CardDescription>
                  Set your preferred currency for displaying monetary values throughout the app.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CurrencySetupCompact />
            <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Changing your currency will update how all amounts are displayed 
                throughout the app, including transactions, budgets, and account balances.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Account</CardTitle>
                <CardDescription>
                  Manage your account information and preferences.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                Account settings are managed through your Clerk profile. 
                <button className="text-blue-600 hover:text-blue-700 ml-1 underline">
                  Manage account →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications (Placeholder) */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications about your finances.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-slate-500">
              Notification settings coming soon...
            </div>
          </CardContent>
        </Card>

        {/* Security (Placeholder) */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Security</CardTitle>
                <CardDescription>
                  Security and privacy settings for your account.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-slate-500">
              Security settings coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
