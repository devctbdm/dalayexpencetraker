"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { ExpenseRecord } from "@/lib/tracker"

type CategoryBreakdown = {
  name: string
  amount: number
  color: string
}

type Range = 7 | 30

function dayKey(value: string) {
  return value.slice(0, 10)
}

function formatMoney(amount: number) {
  return `৳${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))}`
}

function formatCompactMoney(amount: number) {
  if (amount >= 1000) {
    return `৳${(amount / 1000).toFixed(amount >= 10_000 ? 0 : 1)}k`
  }
  return formatMoney(amount)
}

function createTrendData(expenses: ExpenseRecord[], activeDate: string, range: Range) {
  const totals = new Map<string, number>()
  expenses.forEach((expense) => {
    const key = dayKey(expense.spentAt)
    totals.set(key, (totals.get(key) ?? 0) + expense.amount)
  })

  const anchor = new Date(`${activeDate}T12:00:00.000Z`)
  return Array.from({ length: range }, (_, index) => {
    const day = new Date(anchor)
    day.setUTCDate(anchor.getUTCDate() - (range - 1 - index))
    const key = day.toISOString().slice(0, 10)
    return {
      key,
      amount: totals.get(key) ?? 0,
      label: new Intl.DateTimeFormat("en-US", {
        weekday: range === 7 ? "short" : undefined,
        month: range === 30 ? "short" : undefined,
        day: range === 30 ? "numeric" : undefined,
        timeZone: "UTC",
      }).format(day),
      fullLabel: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(day),
    }
  })
}

function getPreviousTotal(expenses: ExpenseRecord[], activeDate: string, range: Range) {
  const anchor = new Date(`${activeDate}T12:00:00.000Z`)
  const currentStart = new Date(anchor)
  currentStart.setUTCDate(anchor.getUTCDate() - (range - 1))
  const previousStart = new Date(currentStart)
  previousStart.setUTCDate(currentStart.getUTCDate() - range)

  return expenses.reduce((total, expense) => {
    const date = new Date(`${dayKey(expense.spentAt)}T12:00:00.000Z`)
    return date >= previousStart && date < currentStart
      ? total + expense.amount
      : total
  }, 0)
}

export function SpendingTrendChart({
  expenses,
  activeDate,
  dailyBudget,
}: {
  expenses: ExpenseRecord[]
  activeDate: string
  dailyBudget: number
}) {
  const [range, setRange] = React.useState<Range>(7)
  const gradientId = React.useId().replace(/:/g, "")
  const data = React.useMemo(
    () => createTrendData(expenses, activeDate, range),
    [activeDate, expenses, range]
  )
  const total = data.reduce((sum, day) => sum + day.amount, 0)
  const previousTotal = React.useMemo(
    () => getPreviousTotal(expenses, activeDate, range),
    [activeDate, expenses, range]
  )
  const transactionCount = expenses.filter((expense) =>
    data.some((day) => day.key === dayKey(expense.spentAt))
  ).length
  const average = total / range
  const percentChange = previousTotal
    ? ((total - previousTotal) / previousTotal) * 100
    : null

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E7EAF1] bg-white p-4 shadow-[0_2px_4px_rgba(33,49,80,0.02)] sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-base font-semibold tracking-[-0.025em] text-[#273247]">
              Daily expense trend
            </p>
            <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#6079EE]">
              Live totals
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8993A4]">
            A clear view of how much you spend each day.
          </p>
        </div>
        <div className="inline-flex self-start rounded-xl bg-[#F4F6FA] p-1">
          {([7, 30] as const).map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setRange(option)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                range === option
                  ? "bg-white text-[#5572F0] shadow-[0_1px_3px_rgba(31,45,75,0.10)]"
                  : "text-[#8C96A7] hover:text-[#647188]"
              }`}
            >
              {option} days
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-[245px] w-full sm:h-[280px]" aria-label="Daily expense chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 18, right: 6, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={`${gradientId}-spend`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6682FF" stopOpacity={0.32} />
                <stop offset="68%" stopColor="#91A4FF" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#C7D1FF" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#EDF0F5"
              strokeDasharray="3 5"
            />
            <XAxis
              axisLine={false}
              dataKey="label"
              interval={range === 7 ? 0 : 4}
              minTickGap={14}
              tick={{ fill: "#98A2B2", fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              dy={9}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#A1A9B7", fontSize: 10, fontWeight: 600 }}
              tickFormatter={formatCompactMoney}
              tickLine={false}
              width={50}
            />
            <ReferenceLine
              y={dailyBudget}
              stroke="#C7D1EF"
              strokeDasharray="5 5"
              ifOverflow="extendDomain"
            />
            <Tooltip
              cursor={{ stroke: "#AAB9FA", strokeDasharray: "3 3" }}
              contentStyle={{
                border: "1px solid #E0E5F2",
                borderRadius: 12,
                boxShadow: "0 12px 30px rgba(39, 56, 91, 0.12)",
                padding: "9px 11px",
                fontSize: 12,
              }}
              formatter={(value) => [formatMoney(Number(value)), "Spent"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ""}
              labelStyle={{ color: "#8792A3", fontSize: 11, marginBottom: 4 }}
              itemStyle={{ color: "#405078", fontWeight: 700 }}
            />
            <Area
              activeDot={{
                r: 5,
                fill: "#FFFFFF",
                stroke: "#6682FF",
                strokeWidth: 3,
              }}
              dataKey="amount"
              fill={`url(#${gradientId}-spend)`}
              fillOpacity={1}
              stroke="#6682FF"
              strokeWidth={3}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-[#EDF0F4] rounded-xl border border-[#EDF0F4] bg-[#FBFCFF] py-3">
        <div className="px-3 sm:px-4">
          <p className="text-[10px] font-semibold tracking-[0.07em] text-[#9BA4B4] uppercase">Period spend</p>
          <p className="mt-1 text-sm font-semibold tracking-[-0.02em] text-[#35425A]">{formatMoney(total)}</p>
        </div>
        <div className="px-3 sm:px-4">
          <p className="text-[10px] font-semibold tracking-[0.07em] text-[#9BA4B4] uppercase">Daily average</p>
          <p className="mt-1 text-sm font-semibold tracking-[-0.02em] text-[#35425A]">{formatMoney(average)}</p>
        </div>
        <div className="px-3 sm:px-4">
          <p className="text-[10px] font-semibold tracking-[0.07em] text-[#9BA4B4] uppercase">Transactions</p>
          <p className="mt-1 text-sm font-semibold tracking-[-0.02em] text-[#35425A]">
            {transactionCount}
            {percentChange !== null && (
              <span className={`ml-1.5 text-[10px] ${percentChange <= 0 ? "text-[#34A580]" : "text-[#D58547]"}`}>
                {percentChange > 0 ? "+" : ""}{percentChange.toFixed(0)}%
              </span>
            )}
          </p>
        </div>
      </div>
    </article>
  )
}

export function CategoryDonutChart({
  categories,
  total,
}: {
  categories: CategoryBreakdown[]
  total: number
}) {
  const chartData = categories.length
    ? categories
    : [{ name: "No expenses", amount: 1, color: "#E9EDF4" }]
  const empty = !categories.length || total === 0

  return (
    <div className="relative h-[172px] w-[172px] shrink-0 sm:h-[182px] sm:w-[182px]" aria-label="Expense category breakdown chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              border: "1px solid #E0E5F2",
              borderRadius: 12,
              boxShadow: "0 12px 30px rgba(39, 56, 91, 0.12)",
              padding: "8px 10px",
              fontSize: 11,
            }}
            formatter={(value) => [formatMoney(Number(value)), "Spent"]}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="64%"
            outerRadius="88%"
            paddingAngle={empty ? 0 : 3}
            stroke="none"
          >
            {chartData.map((category) => (
              <Cell fill={category.color} key={category.name} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-medium text-[#909AAD]">Today</span>
        <strong className="mt-0.5 text-[19px] font-semibold tracking-[-0.04em] text-[#273247]">
          {formatCompactMoney(total)}
        </strong>
      </div>
    </div>
  )
}
