import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Wallet, Target, Clock, TrendingUp } from 'lucide-react';

// Base Skeleton Component
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse rounded ${className}`} />
);

// Account Card Skeleton
export const AccountCardSkeleton = () => (
  <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center">
          <Wallet className="h-6 w-6 text-slate-400" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-12 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <Card className="group relative overflow-hidden border-0 hover:shadow-2xl transition-all duration-500 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <Skeleton className="h-4 w-24 rounded-full" />
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
        <TrendingUp className="h-5 w-5 text-slate-400" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 rounded-full" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-28 rounded-full" />
    </CardContent>
  </Card>
);

// Budget Progress Skeleton
export const BudgetProgressSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl h-fit">
    <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-t-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center">
            <Target className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-4 w-36 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
    </CardHeader>

    <CardContent className="p-6 space-y-6">
      {/* Budget Amount Section */}
      <div className="text-center space-y-2">
        <Skeleton className="h-9 w-32 rounded-full mx-auto" />
        <Skeleton className="h-4 w-24 rounded-full mx-auto" />
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-4 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 animate-pulse">
            <div className="h-4 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 w-2/3 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-36 rounded-full" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <Skeleton className="h-2 rounded-full w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>

    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-3xl">
      <Skeleton className="h-4 w-48 rounded-full" />
    </div>
  </Card>
);

// Recent Transactions Skeleton
export const RecentTransactionsSkeleton = () => (
  <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center">
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 rounded-xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 bg-slate-400 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Financial Insights Skeleton
export const FinancialInsightsSkeleton = () => (
  <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-slate-400 rounded" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center p-4 bg-white/50 rounded-xl border border-slate-200/50">
            <Skeleton className="h-6 w-6 rounded mx-auto mb-2" />
            <Skeleton className="h-4 w-20 rounded-full mx-auto mb-2" />
            <Skeleton className="h-6 w-16 rounded-full mx-auto" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Spending Trends Skeleton
export const SpendingTrendsSkeleton = () => (
  <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="p-8">
      <div className="space-y-4">
        {/* Chart area */}
        <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl animate-pulse flex items-center justify-center">
          <div className="text-slate-400">
            <TrendingUp className="h-12 w-12 mb-2 mx-auto" />
            <p className="text-sm">Loading chart...</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Dashboard Overview Skeleton
export const DashboardOverviewSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
    <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-t-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-40 rounded-full mx-auto" />
              <Skeleton className="h-4 w-24 rounded-full mx-auto" />
            </div>
            <div className="flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex items-center space-x-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Complete Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Accounts Section */}
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center">
            <Wallet className="h-6 w-6 text-slate-400" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-5 w-48 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <AccountCardSkeleton key={i} />
        ))}
      </div>
    </div>
    
    {/* Key Metrics Overview */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Financial Insights Section */}
    <FinancialInsightsSkeleton />

    {/* Main Dashboard Grid */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Charts and Trends Section */}
      <div className="xl:col-span-2 space-y-8">
        <SpendingTrendsSkeleton />
        <DashboardOverviewSkeleton />
      </div>

      {/* Right Sidebar */}
      <div className="xl:col-span-1 space-y-8">
        <BudgetProgressSkeleton />
        <RecentTransactionsSkeleton />
      </div>
    </div>
  </div>
);



export default DashboardSkeleton;