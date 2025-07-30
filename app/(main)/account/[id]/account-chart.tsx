"use client";

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  endOfDay,
  format,
  startOfDay,
  subDays
} from 'date-fns';
import React, { FC, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Transaction {
  id: string;
  date: string | Date;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  isRecurring: boolean;
  recurringInterval?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  nextRecurringDate?: string | Date | null;
  lastProcessed?: string | Date | null;
  account?: {
    name: string;
    type: string;
  };
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const DATE_RANGES = {
  '7D': { label: 'Last 7 Days', days: 7 },
  '1M': { label: 'Last 1 Month', days: 30 },
  '2M': { label: 'Last 2 Months', days: 60 },
  '6M': { label: 'Last 6 Months', days: 180 },
  ALL: { label: 'All Time', days: null }
};

const AccountChart: FC<TransactionTableProps> = ({ transactions }) => {
  const [dateRange, setDateRange] = useState('1M');

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const filtered = transactions.filter(
      (t) =>
        new Date(t.date) >= startDate &&
        new Date(t.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), 'MMM dd');

      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }

      if (transaction.type === 'INCOME') {
        acc[date].income += Number(transaction.amount);
      } else {
        acc[date].expense += Number(transaction.amount);
      }

      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    return Object.values(grouped).sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  console.log(filteredData);
  console.log(totals);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Overview</CardTitle>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <div className="h-[300px] px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="income"
              fill="#4ade80"
              activeBar={<Rectangle fill="#22c55e" stroke="#166534" />}
            />
            <Bar
              dataKey="expense"
              fill="#f87171"
              activeBar={<Rectangle fill="#ef4444" stroke="#991b1b" />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AccountChart;
