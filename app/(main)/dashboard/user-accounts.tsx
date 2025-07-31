"use client"

import { updateDefaultAccount } from "@/actions/accounts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useFetch } from "@/hooks/use-fetch"
import { CreditCard, Wallet, PiggyBank, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export const UserAccounts = ({ accounts }) => {
  const [accountList, setAccountList] = useState(accounts)
  const { loading: updateDefaultLoading, fn: updateDefaultFn, error } = useFetch(updateDefaultAccount)

  const handleDefaultChange = async (accountId, isAlreadyDefault) => {
    if (isAlreadyDefault) {
      toast.warning("This account is already the default")
      return
    }

    try {
      const updated = await updateDefaultFn(accountId)

      if (updated?.success) {
        toast.success("Default account updated")

        const updatedAccounts = accountList.map((acc) => ({
          ...acc,
          isDefault: acc.id === accountId,
        }))
        setAccountList(updatedAccounts)
      } else {
        toast.error("Failed to update default account")
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong")
    }
  }

  const getAccountIcon = (type) => {
    switch (type) {
      case "SAVINGS":
        return PiggyBank
      case "CURRENT":
        return CreditCard
      default:
        return Wallet
    }
  }

  const getAccountGradient = (type, isDefault) => {
    if (isDefault) {
      return "from-blue-500 to-indigo-600"
    }

    switch (type) {
      case "SAVINGS":
        return "from-green-400 to-emerald-500"
      case "CURRENT":
        return "from-purple-400 to-violet-500"
      default:
        return "from-slate-400 to-slate-500"
    }
  }

  const getAccountBg = (type, isDefault) => {
    if (isDefault) {
      return "from-blue-50 to-indigo-50"
    }

    switch (type) {
      case "SAVINGS":
        return "from-green-50 to-emerald-50"
      case "CURRENT":
        return "from-purple-50 to-violet-50"
      default:
        return "from-slate-50 to-slate-100"
    }
  }

  return (
    <>
      {accountList.map((account) => {
        const IconComponent = getAccountIcon(account.type)
        const gradient = getAccountGradient(account.type, account.isDefault)
        const bgGradient = getAccountBg(account.type, account.isDefault)

        return (
          <Card
            key={account.id}
            className={`group relative overflow-hidden border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl bg-gradient-to-br ${bgGradient} backdrop-blur-sm`}
          >
            <Link href={`/account/${account.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 group-hover:text-slate-900 transition-colors">
                        {account.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-slate-600 capitalize">
                          {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
                        </p>
                        {account.isDefault && (
                          <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-0 rounded-full text-xs flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Link>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    ${Number.parseFloat(account.balance).toFixed(2)}
                  </div>
                  <p className="text-sm text-slate-600">{account._count?.transactions || 0} transactions</p>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-xs text-slate-500">Set as default</div>
                  <Switch
                    checked={account.isDefault}
                    onClick={(e) => {
                      e.preventDefault()
                      handleDefaultChange(account.id, account.isDefault)
                    }}
                    disabled={updateDefaultLoading}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
