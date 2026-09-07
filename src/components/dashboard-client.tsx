"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  RiAddLine,
  RiAlertLine,
  RiArrowDownLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiBankCardLine,
  RiBookOpenLine,
  RiCalendarLine,
  RiCarLine,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiDeleteBin6Line,
  RiEditLine,
  RiEmotionHappyLine,
  RiFileTextLine,
  RiFilter3Line,
  RiHeartPulseLine,
  RiHome5Line,
  RiLayoutGridLine,
  RiMore2Line,
  RiNotification3Line,
  RiRestaurant2Line,
  RiSearchLine,
  RiShoppingBag3Line,
  RiSparkling2Line,
  RiTimeLine,
  RiWallet3Line,
} from "@remixicon/react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  categoryColorForName,
  demoExpenses,
  demoJournal,
  expenseCategories,
  type ExpenseRecord,
  type JournalRecord,
} from "@/lib/tracker"

export type DashboardUser = {
  id: string
  name: string
  email: string
}

type Drawer = "expense" | "journal" | null
type ConnectionState = "checking" | "connected" | "offline"

type ExpenseForm = {
  description: string
  amount: string
  category: string
  spentAt: string
  notes: string
  paymentMethod: string
}

type JournalForm = {
  entryDate: string
  title: string
  content: string
  mood: string
}

const EXPENSE_STORAGE_KEY = "dailytrack:expenses"
const JOURNAL_STORAGE_KEY = "dailytrack:journal"
const DAILY_BUDGET = 5000

const categoryIcons: Record<string, React.ElementType> = {
  "Food & Dining": RiRestaurant2Line,
  Groceries: RiShoppingBag3Line,
  Transport: RiCarLine,
  "Health & Wellness": RiHeartPulseLine,
  Shopping: RiShoppingBag3Line,
  Housing: RiHome5Line,
  Personal: RiEmotionHappyLine,
  Other: RiWallet3Line,
}

function getLocalDateKey() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function createExpenseForm(date = getLocalDateKey()): ExpenseForm {
  return {
    description: "",
    amount: "",
    category: "Food & Dining",
    spentAt: date,
    notes: "",
    paymentMethod: "bKash",
  }
}

function createJournalForm(date = getLocalDateKey()): JournalForm {
  return {
    entryDate: date,
    title: "",
    content: "",
    mood: "Grateful",
  }
}

function formatMoney(amount: number) {
  return `৳${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(amount)}`
}

function formatCompactMoney(amount: number) {
  if (amount >= 1000) {
    return `৳${(amount / 1000).toFixed(amount >= 10_000 ? 0 : 1)}k`
  }
  return formatMoney(amount)
}

function dayKey(value: string) {
  return value.slice(0, 10)
}

function readableDay(value: string) {
  const date = new Date(`${dayKey(value)}T12:00:00.000Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function shortDate(value: string) {
  const date = new Date(`${dayKey(value)}T12:00:00.000Z`)
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date)
}

function displayTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value))
}

function sortExpenses(items: ExpenseRecord[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime() ||
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )
}

function sortJournal(items: JournalRecord[]) {
  return [...items].sort(
    (a, b) =>
      b.entryDate.localeCompare(a.entryDate) ||
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

function parseStoredRecords<T>(key: string) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : null
  } catch {
    return null
  }
}

function makeTemporaryId(type: "expense" | "journal") {
  return `${type}-local-${
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  }`
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = categoryIcons[category] ?? RiWallet3Line
  return <Icon className={className} />
}

function IconCircle({
  category,
  color,
}: {
  category: string
  color: string
}) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${color}18`, color }}
    >
      <CategoryIcon category={category} className="size-[18px]" />
    </span>
  )
}

function MetricCard({
  label,
  value,
  change,
  trend = "up",
  icon,
  iconClassName,
}: {
  label: string
  value: string
  change: string
  trend?: "up" | "down"
  icon: React.ReactNode
  iconClassName: string
}) {
  return (
    <section className="rounded-2xl border border-[#E7EAF1] bg-white p-4 shadow-[0_2px_4px_rgba(33,49,80,0.02)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8B94A8] uppercase">
            {label}
          </p>
          <p className="mt-2 text-[24px] font-semibold tracking-[-0.045em] text-[#1D2739] sm:text-[27px]">
            {value}
          </p>
        </div>
        <span
          className={`flex size-9 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs">
        <span
          className={`inline-flex items-center font-semibold ${
            trend === "up" ? "text-[#30A37E]" : "text-[#6380FF]"
          }`}
        >
          {trend === "up" ? (
            <RiArrowUpLine className="mr-0.5 size-3.5" />
          ) : (
            <RiArrowDownLine className="mr-0.5 size-3.5" />
          )}
          {change}
        </span>
        <span className="text-[#98A1B2]">vs. last week</span>
      </div>
    </section>
  )
}

function WeekChart({ expenses, activeDate }: { expenses: ExpenseRecord[]; activeDate: string }) {
  const days = React.useMemo(() => {
    const anchor = new Date(`${activeDate}T12:00:00.000Z`)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(anchor)
      date.setUTCDate(anchor.getUTCDate() - (6 - index))
      const key = date.toISOString().slice(0, 10)
      const amount = expenses
        .filter((expense) => dayKey(expense.spentAt) === key)
        .reduce((total, expense) => total + expense.amount, 0)
      return {
        key,
        amount,
        label: new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }).format(date),
      }
    })
  }, [activeDate, expenses])

  const maximum = Math.max(...days.map((day) => day.amount), 1)

  return (
    <div className="mt-6">
      <div className="relative flex h-40 items-end gap-2 border-b border-[#EDF0F5] pt-5 sm:h-48 sm:gap-3">
        <div className="pointer-events-none absolute inset-x-0 top-[25%] border-t border-dashed border-[#EDF0F5]" />
        <div className="pointer-events-none absolute inset-x-0 top-[55%] border-t border-dashed border-[#EDF0F5]" />
        {days.map((day) => {
          const height = day.amount ? Math.max((day.amount / maximum) * 100, 13) : 4
          const isCurrent = day.key === activeDate
          return (
            <div
              className="group relative z-10 flex min-w-0 flex-1 flex-col justify-end"
              key={day.key}
            >
              {day.amount > 0 && (
                <span className="pointer-events-none absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-[#5E687B] group-hover:block sm:text-[11px]">
                  {formatCompactMoney(day.amount)}
                </span>
              )}
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  isCurrent
                    ? "bg-[#6882FF] shadow-[0_5px_12px_rgba(93,121,245,0.25)]"
                    : day.amount
                      ? "bg-[#DCE4FF] group-hover:bg-[#AFC0FF]"
                      : "bg-[#EEF1F6]"
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {days.map((day) => (
          <span
            className={`min-w-0 flex-1 text-center text-[10px] font-medium sm:text-[11px] ${
              day.key === activeDate ? "text-[#5876F4]" : "text-[#9AA3B3]"
            }`}
            key={day.key}
          >
            {day.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function DashboardClient({
  user,
  isPreview = false,
}: {
  user: DashboardUser
  isPreview?: boolean
}) {
  const router = useRouter()
  const firstName = user.name.trim().split(/\s+/)[0] || "there"
  const userInitials = user.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "DT"
  const [expenses, setExpenses] = React.useState<ExpenseRecord[]>(() =>
    sortExpenses(demoExpenses)
  )
  const [journalEntries, setJournalEntries] = React.useState<JournalRecord[]>(() =>
    sortJournal(demoJournal)
  )
  const [connection, setConnection] = React.useState<ConnectionState>("checking")
  const [drawer, setDrawer] = React.useState<Drawer>(null)
  const [expenseForm, setExpenseForm] = React.useState<ExpenseForm>(() =>
    createExpenseForm()
  )
  const [journalForm, setJournalForm] = React.useState<JournalForm>(() =>
    createJournalForm()
  )
  const [expenseError, setExpenseError] = React.useState("")
  const [journalError, setJournalError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState("All activity")
  const [search, setSearch] = React.useState("")
  const [toast, setToast] = React.useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  React.useEffect(() => {
    let active = true

    if (isPreview) {
      const timeout = window.setTimeout(() => {
        if (!active) return
        const localExpenses = parseStoredRecords<ExpenseRecord[]>(EXPENSE_STORAGE_KEY)
        const localJournal = parseStoredRecords<JournalRecord[]>(JOURNAL_STORAGE_KEY)
        if (localExpenses?.length) setExpenses(sortExpenses(localExpenses))
        if (localJournal?.length) setJournalEntries(sortJournal(localJournal))
        setConnection("offline")
        setHasLoaded(true)
      }, 0)
      return () => {
        active = false
        window.clearTimeout(timeout)
      }
    }

    async function loadRecords() {
      try {
        const [expenseResponse, journalResponse] = await Promise.all([
          fetch("/api/expenses?limit=100", { cache: "no-store" }),
          fetch("/api/journal?limit=30", { cache: "no-store" }),
        ])

        if (expenseResponse.status === 401 || journalResponse.status === 401) {
          if (active) router.replace("/login")
          return
        }

        if (!expenseResponse.ok || !journalResponse.ok) {
          throw new Error("Cloud data is unavailable")
        }

        const [expenseData, journalData] = (await Promise.all([
          expenseResponse.json(),
          journalResponse.json(),
        ])) as [{ expenses: ExpenseRecord[] }, { entries: JournalRecord[] }]

        if (!active) return
        setExpenses(sortExpenses(expenseData.expenses))
        setJournalEntries(sortJournal(journalData.entries))
        setConnection("connected")
      } catch {
        if (!active) return
        const localExpenses = parseStoredRecords<ExpenseRecord[]>(EXPENSE_STORAGE_KEY)
        const localJournal = parseStoredRecords<JournalRecord[]>(JOURNAL_STORAGE_KEY)
        if (localExpenses?.length) setExpenses(sortExpenses(localExpenses))
        if (localJournal?.length) setJournalEntries(sortJournal(localJournal))
        setConnection("offline")
      } finally {
        if (active) setHasLoaded(true)
      }
    }

    void loadRecords()
    return () => {
      active = false
    }
  }, [isPreview, router])

  React.useEffect(() => {
    if (!hasLoaded) return
    window.localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses))
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journalEntries))
  }, [expenses, hasLoaded, journalEntries])

  React.useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeDate = React.useMemo(
    () => dayKey(expenses[0]?.spentAt ?? journalEntries[0]?.entryDate ?? getLocalDateKey()),
    [expenses, journalEntries]
  )

  const dayExpenses = React.useMemo(
    () => expenses.filter((expense) => dayKey(expense.spentAt) === activeDate),
    [activeDate, expenses]
  )

  const totalSpent = React.useMemo(
    () => dayExpenses.reduce((total, expense) => total + expense.amount, 0),
    [dayExpenses]
  )

  const categoryBreakdown = React.useMemo(() => {
    const groups = new Map<string, { amount: number; color: string }>()
    dayExpenses.forEach((expense) => {
      const current = groups.get(expense.category) ?? {
        amount: 0,
        color: expense.categoryColor || categoryColorForName(expense.category),
      }
      current.amount += expense.amount
      groups.set(expense.category, current)
    })
    return [...groups.entries()]
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.amount - a.amount)
  }, [dayExpenses])

  const donutGradient = React.useMemo(() => {
    if (!categoryBreakdown.length || !totalSpent) return "#E9EDF4 0deg 360deg"
    let degree = 0
    return categoryBreakdown
      .map((category) => {
        const end = degree + (category.amount / totalSpent) * 360
        const value = `${category.color} ${degree.toFixed(2)}deg ${end.toFixed(2)}deg`
        degree = end
        return value
      })
      .join(", ")
  }, [categoryBreakdown, totalSpent])

  const visibleExpenses = React.useMemo(() => {
    const needle = search.trim().toLowerCase()
    return expenses.filter((expense) => {
      const matchesCategory =
        activeCategory === "All activity" || expense.category === activeCategory
      const matchesSearch =
        !needle ||
        expense.description.toLowerCase().includes(needle) ||
        expense.category.toLowerCase().includes(needle)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, expenses, search])

  const reflection = React.useMemo(
    () =>
      journalEntries.find((entry) => entry.entryDate === activeDate) ??
      journalEntries[0] ??
      null,
    [activeDate, journalEntries]
  )

  const spentPercent = Math.min((totalSpent / DAILY_BUDGET) * 100, 100)
  const remaining = Math.max(DAILY_BUDGET - totalSpent, 0)

  function openExpenseDrawer() {
    setExpenseError("")
    setExpenseForm(createExpenseForm(activeDate))
    setDrawer("expense")
  }

  function openJournalDrawer() {
    const current = reflection
    setJournalError("")
    setJournalForm(
      current
        ? {
            entryDate: current.entryDate,
            title: current.title,
            content: current.content,
            mood: current.mood ?? "Grateful",
          }
        : createJournalForm(activeDate)
    )
    setDrawer("journal")
  }

  async function submitExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(expenseForm.amount)

    if (!expenseForm.description.trim() || !Number.isFinite(amount) || amount <= 0) {
      setExpenseError("Add a description and a valid amount to continue.")
      return
    }

    const now = new Date().toISOString()
    const temporary: ExpenseRecord = {
      id: makeTemporaryId("expense"),
      description: expenseForm.description.trim(),
      amount,
      category: expenseForm.category,
      categoryColor: categoryColorForName(expenseForm.category),
      spentAt: new Date(`${expenseForm.spentAt}T12:00:00.000Z`).toISOString(),
      recordedAt: now,
      notes: expenseForm.notes.trim() || null,
      paymentMethod: expenseForm.paymentMethod || null,
    }

    setExpenses((current) => sortExpenses([temporary, ...current]))
    setExpenseError("")
    setDrawer(null)
    setToast(
      connection === "connected"
        ? "Expense added — syncing it to your workspace."
        : "Expense saved in this browser."
    )

    if (connection === "offline") return

    setSubmitting(true)
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: temporary.description,
          amount: temporary.amount,
          category: temporary.category,
          spentAt: expenseForm.spentAt,
          notes: temporary.notes,
          paymentMethod: temporary.paymentMethod,
        }),
      })

      if (response.status === 401) {
        router.replace("/login")
        return
      }
      if (!response.ok) throw new Error("The expense could not be synced")
      const data = (await response.json()) as { expense: ExpenseRecord }
      setExpenses((current) =>
        sortExpenses(
          current.map((expense) =>
            expense.id === temporary.id ? data.expense : expense
          )
        )
      )
      setConnection("connected")
      setToast("Expense saved to your DailyTrack workspace.")
    } catch {
      setConnection("offline")
      setToast("Saved locally. Add DATABASE_URL to enable Supabase sync.")
    } finally {
      setSubmitting(false)
    }
  }

  async function submitJournal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!journalForm.title.trim() || !journalForm.content.trim()) {
      setJournalError("Give your entry a title and add a few words first.")
      return
    }

    const now = new Date().toISOString()
    const existing = journalEntries.find(
      (entry) => entry.entryDate === journalForm.entryDate
    )
    const temporary: JournalRecord = {
      id: existing?.id ?? makeTemporaryId("journal"),
      entryDate: journalForm.entryDate,
      title: journalForm.title.trim(),
      content: journalForm.content.trim(),
      mood: journalForm.mood || null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    setJournalEntries((current) =>
      sortJournal([
        temporary,
        ...current.filter((entry) => entry.entryDate !== temporary.entryDate),
      ])
    )
    setJournalError("")
    setDrawer(null)
    setToast(
      connection === "connected"
        ? "Journal entry saved — syncing it to your workspace."
        : "Journal entry saved in this browser."
    )

    if (connection === "offline") return

    setSubmitting(true)
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryDate: temporary.entryDate,
          title: temporary.title,
          content: temporary.content,
          mood: temporary.mood,
        }),
      })
      if (!response.ok) throw new Error("The entry could not be synced")

      const data = (await response.json()) as { entry: JournalRecord }
      setJournalEntries((current) =>
        sortJournal([
          data.entry,
          ...current.filter((entry) => entry.entryDate !== data.entry.entryDate),
        ])
      )
      setConnection("connected")
      setToast("Journal entry saved to your DailyTrack workspace.")
    } catch {
      setConnection("offline")
      setToast("Saved locally. Add DATABASE_URL to enable Supabase sync.")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteExpense(expense: ExpenseRecord) {
    const previous = expenses
    setExpenses((current) => current.filter((item) => item.id !== expense.id))
    setToast("Expense removed.")

    if (connection !== "connected" || expense.id.startsWith("expense-local")) {
      return
    }

    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      })
      if (response.status === 401) {
        router.replace("/login")
        return
      }
      if (!response.ok && response.status !== 404) {
        throw new Error("Delete request failed")
      }
    } catch {
      setExpenses(previous)
      setToast("Could not remove that expense from Supabase. Please try again.")
    }
  }

  async function handleLogout() {
    if (isPreview) {
      setToast("This is a local preview. Connect Supabase to create an account.")
      return
    }

    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        user={user}
        onAddExpense={openExpenseDrawer}
        onWriteEntry={openJournalDrawer}
        onLogout={() => void handleLogout()}
      />
      <SidebarInset className="min-w-0 bg-[#F7F8FC]">
        <header className="sticky top-0 z-20 flex h-[69px] shrink-0 items-center border-b border-[#E9ECF2] bg-[#F7F8FC]/95 px-4 backdrop-blur md:px-7">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <SidebarTrigger className="-ml-1 text-[#647187] hover:bg-white hover:text-[#26344E]" />
            <div className="hidden items-center gap-2 text-sm text-[#8690A1] sm:flex">
              <span className="font-medium text-[#536178]">Personal workspace</span>
              <RiArrowRightSLine className="size-4" />
              <span>Overview</span>
            </div>
            <div className="relative ml-auto hidden w-full max-w-[260px] md:block">
              <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98A2B4]" />
              <Input
                aria-label="Search expenses"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search activity"
                className="h-9 border-[#E4E8EF] bg-white pl-9 text-xs shadow-none placeholder:text-[#A4ADBB]"
              />
            </div>
          </div>
          <div className="ml-3 flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Show notifications"
              onClick={() => setToast("You are all caught up for today.")}
              className="relative rounded-xl text-[#68758A] hover:bg-white hover:text-[#32405A]"
            >
              <RiNotification3Line className="size-[19px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#F06F5C] ring-2 ring-[#F7F8FC]" />
            </Button>
            <button
              type="button"
              aria-label={`Open ${user.name} profile`}
              onClick={() => setToast(`${user.email} is signed in.`)}
              className="ml-1 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F7B696] to-[#D476A6] text-[10px] font-bold text-white shadow-sm"
            >
              {userInitials}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1540px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section id="overview" className="scroll-mt-24">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#79859A]">
                  <span className="inline-flex size-5 items-center justify-center rounded-md bg-[#E9EDFF] text-[#607DFF]">
                    <RiSparkling2Line className="size-3.5" />
                  </span>
                  Monday, 7 September
                </div>
                <h1 className="font-heading text-[29px] font-semibold tracking-[-0.045em] text-[#1D2739] sm:text-[34px]">
                  Good morning, {firstName} <span className="inline-block">👋</span>
                </h1>
                <p className="mt-1.5 text-sm text-[#7B879A] sm:text-[15px]">
                  Here&apos;s a gentle look at your day so far.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex h-9 items-center gap-2 rounded-xl border border-[#E3E7EF] bg-white px-3 text-xs font-medium text-[#667388] shadow-[0_1px_2px_rgba(31,45,61,0.03)]">
                  <RiCalendarLine className="size-4 text-[#7885FA]" />
                  <span className="hidden sm:inline">{readableDay(activeDate)}</span>
                  <span className="sm:hidden">{shortDate(activeDate)}</span>
                  <RiArrowDownLine className="size-3.5 text-[#98A1B1]" />
                </div>
                <Button
                  type="button"
                  onClick={openJournalDrawer}
                  variant="outline"
                  className="h-9 rounded-xl border-[#E2E6EF] bg-white px-3 text-xs font-semibold text-[#556277] hover:border-[#CED7F8] hover:bg-[#F7F8FF] hover:text-[#5876F4]"
                >
                  <RiEditLine className="size-4" />
                  <span className="hidden sm:inline">Write entry</span>
                  <span className="sm:hidden">Journal</span>
                </Button>
                <Button
                  type="button"
                  onClick={openExpenseDrawer}
                  className="h-9 rounded-xl bg-[#637EFF] px-3.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(92,119,244,0.22)] hover:bg-[#526EED]"
                >
                  <RiAddLine className="size-[17px]" />
                  Add expense
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Today&apos;s spend"
                value={formatMoney(totalSpent)}
                change="12.5%"
                icon={<RiWallet3Line className="size-[18px]" />}
                iconClassName="bg-[#EEF1FF] text-[#637EFF]"
              />
              <MetricCard
                label="Budget left"
                value={formatMoney(remaining)}
                change="8.2%"
                trend="down"
                icon={<RiBankCardLine className="size-[18px]" />}
                iconClassName="bg-[#ECFAF4] text-[#32A37D]"
              />
              <MetricCard
                label="Transactions"
                value={`${dayExpenses.length}`}
                change="2 more"
                icon={<RiLayoutGridLine className="size-[18px]" />}
                iconClassName="bg-[#FFF5E5] text-[#E5A13A]"
              />
              <MetricCard
                label="Daily streak"
                value="7 days"
                change="On a roll"
                icon={<RiCheckboxCircleFill className="size-[18px]" />}
                iconClassName="bg-[#F6EEFF] text-[#AD6CCC]"
              />
            </div>
          </section>

          <section id="insights" className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.58fr)_minmax(300px,0.82fr)] scroll-mt-24">
            <article className="overflow-hidden rounded-2xl border border-[#E7EAF1] bg-white p-4 shadow-[0_2px_4px_rgba(33,49,80,0.02)] sm:p-5 lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold tracking-[-0.025em] text-[#273247]">
                    Spending overview
                  </p>
                  <p className="mt-1 text-xs text-[#8993A4]">
                    Your daily spend across the last 7 days
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setToast("Weekly report export is ready in the connected app.")}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F5F7FB] px-2.5 text-[11px] font-semibold text-[#6D788B] transition-colors hover:bg-[#EAEFFF] hover:text-[#5D79F0]"
                >
                  This week <RiArrowDownLine className="size-3.5" />
                </button>
              </div>
              <WeekChart expenses={expenses} activeDate={activeDate} />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#EFF1F5] pt-4 text-xs">
                <span className="text-[#8B95A7]">
                  Average daily spend
                  <strong className="ml-1 font-semibold text-[#38465D]">
                    {formatMoney(
                      expenses.length
                        ? expenses.reduce((sum, expense) => sum + expense.amount, 0) /
                            Math.max(
                              new Set(expenses.map((expense) => dayKey(expense.spentAt))).size,
                              1
                            )
                        : 0
                    )}
                  </strong>
                </span>
                <span className="inline-flex items-center font-semibold text-[#30A37E]">
                  <RiArrowUpLine className="mr-0.5 size-3.5" /> 9.8%
                  <span className="ml-1 font-normal text-[#9AA3B2]">from last week</span>
                </span>
              </div>
            </article>

            <article className="rounded-2xl border border-[#E7EAF1] bg-white p-4 shadow-[0_2px_4px_rgba(33,49,80,0.02)] sm:p-5 lg:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold tracking-[-0.025em] text-[#273247]">
                    Today&apos;s spending
                  </p>
                  <p className="mt-1 text-xs text-[#8993A4]">Where your money went</p>
                </div>
                <button
                  type="button"
                  aria-label="Open expense breakdown"
                  onClick={() =>
                    document.getElementById("expenses")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="rounded-lg p-1 text-[#98A2B4] hover:bg-[#F4F6FB] hover:text-[#627DF4]"
                >
                  <RiMore2Line className="size-5" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-5">
                <div
                  className="relative flex size-[130px] shrink-0 items-center justify-center rounded-full sm:size-[140px]"
                  style={{ background: `conic-gradient(${donutGradient})` }}
                >
                  <div className="flex size-[96px] flex-col items-center justify-center rounded-full bg-white sm:size-[104px]">
                    <span className="text-[10px] font-medium text-[#909AAD]">Total</span>
                    <strong className="mt-0.5 text-[18px] font-semibold tracking-[-0.04em] text-[#273247]">
                      {formatCompactMoney(totalSpent)}
                    </strong>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  {categoryBreakdown.slice(0, 4).map((category) => (
                    <div className="flex items-center gap-2.5" key={category.name}>
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#5F6B7D] sm:text-xs">
                        {category.name}
                      </span>
                      <span className="text-[11px] font-semibold text-[#3E4A5E] sm:text-xs">
                        {totalSpent
                          ? `${Math.round((category.amount / totalSpent) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                  ))}
                  {!categoryBreakdown.length && (
                    <p className="text-xs leading-5 text-[#9AA3B3]">
                      Add an expense to see your category breakdown.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 border-t border-[#EFF1F5] pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#6E788B]">Daily budget</span>
                  <span className="font-semibold text-[#39475D]">
                    {formatMoney(totalSpent)} <span className="font-normal text-[#9BA4B3]">/ {formatMoney(DAILY_BUDGET)}</span>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF1F6]">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      spentPercent > 90 ? "bg-[#F06F5C]" : "bg-[#6983FF]"
                    }`}
                    style={{ width: `${spentPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-[#909AAA]">
                  {remaining > 0
                    ? `${formatMoney(remaining)} left for the rest of the day.`
                    : "You have reached today’s spending target."}
                </p>
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.58fr)_minmax(300px,0.82fr)]">
            <article
              id="expenses"
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#E7EAF1] bg-white shadow-[0_2px_4px_rgba(33,49,80,0.02)]"
            >
              <div className="flex flex-col gap-4 border-b border-[#EDF0F5] p-4 sm:p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold tracking-[-0.025em] text-[#273247]">
                        Recent activity
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          connection === "connected"
                            ? "bg-[#ECFAF4] text-[#278C6D]"
                            : connection === "checking"
                              ? "bg-[#EFF2FF] text-[#637EFF]"
                              : "bg-[#FFF4E7] text-[#BF7621]"
                        }`}
                      >
                        {connection === "offline" && <RiAlertLine className="size-3" />}
                        {connection === "connected"
                          ? "Supabase synced"
                          : connection === "checking"
                            ? "Checking sync"
                            : "Preview mode"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#8993A4]">
                      Every small record helps tell the whole story.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openExpenseDrawer}
                    className="h-8 rounded-lg border-[#DCE3F5] bg-[#FAFBFF] px-2.5 text-[11px] font-semibold text-[#607AF4] hover:bg-[#EEF2FF]"
                  >
                    <RiAddLine className="size-4" /> Add item
                  </Button>
                </div>
                <div className="-mb-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {["All activity", ...categoryBreakdown.map((category) => category.name)].map(
                    (category) => (
                      <button
                        type="button"
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                          activeCategory === category
                            ? "bg-[#E9EEFF] text-[#5C77EE]"
                            : "bg-[#F6F7FA] text-[#7F8999] hover:bg-[#EEF1F6] hover:text-[#58667C]"
                        }`}
                      >
                        {category}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    aria-label="Filter activity"
                    onClick={() => setToast("Choose a category chip to filter your activity.")}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F6F7FA] text-[#8792A4] hover:bg-[#EEF1F6]"
                  >
                    <RiFilter3Line className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="grid grid-cols-[minmax(190px,1.4fr)_minmax(110px,.7fr)_110px_34px] items-center gap-3 border-b border-[#F0F2F5] px-5 py-3 text-[10px] font-semibold tracking-[0.08em] text-[#A0A8B5] uppercase lg:grid-cols-[minmax(240px,1.6fr)_minmax(125px,.8fr)_minmax(110px,.55fr)_110px_34px] lg:px-6">
                  <span>Transaction</span>
                  <span>Category</span>
                  <span className="hidden lg:block">Recorded</span>
                  <span className="text-right">Amount</span>
                  <span />
                </div>
                {visibleExpenses.slice(0, 7).map((expense) => (
                  <div
                    className="group grid grid-cols-[minmax(190px,1.4fr)_minmax(110px,.7fr)_110px_34px] items-center gap-3 border-b border-[#F2F3F6] px-5 py-3.5 last:border-b-0 hover:bg-[#FBFCFF] lg:grid-cols-[minmax(240px,1.6fr)_minmax(125px,.8fr)_minmax(110px,.55fr)_110px_34px] lg:px-6"
                    key={expense.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <IconCircle
                        category={expense.category}
                        color={expense.categoryColor}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#445167]">
                          {expense.description}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#9AA3B2]">
                          {shortDate(expense.spentAt)} · recorded {displayTime(expense.recordedAt)}
                        </p>
                      </div>
                    </div>
                    <span className="truncate text-xs font-medium text-[#748094]">
                      {expense.category}
                    </span>
                    <span className="hidden text-[11px] text-[#98A2B2] lg:block">
                      {displayTime(expense.recordedAt)}
                    </span>
                    <span className="text-right text-[13px] font-semibold text-[#344157]">
                      −{formatMoney(expense.amount)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Delete ${expense.description}`}
                      onClick={() => void deleteExpense(expense)}
                      className="flex size-7 items-center justify-center rounded-lg text-[#B2BAC6] opacity-0 transition-all hover:bg-[#FFF0EF] hover:text-[#E26A5B] group-hover:opacity-100 focus:opacity-100"
                    >
                      <RiDeleteBin6Line className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-[#F0F2F6] md:hidden">
                {visibleExpenses.slice(0, 7).map((expense) => (
                  <div className="flex items-center gap-3 p-4" key={expense.id}>
                    <IconCircle category={expense.category} color={expense.categoryColor} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#445167]">
                        {expense.description}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#98A2B2]">
                        {expense.category} · {shortDate(expense.spentAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[13px] font-semibold text-[#344157]">
                        −{formatMoney(expense.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => void deleteExpense(expense)}
                        className="text-[10px] font-medium text-[#A5ADBA] hover:text-[#E26A5B]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!visibleExpenses.length && (
                <div className="flex flex-col items-center px-6 py-11 text-center">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#F2F4F8] text-[#98A2B4]">
                    <RiFileTextLine className="size-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-[#536078]">No activity found</p>
                  <p className="mt-1 max-w-[240px] text-xs leading-5 text-[#98A2B2]">
                    Try a different filter, or record your next expense.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setToast("You’re looking at your most recent seven records.")}
                className="flex w-full items-center justify-center gap-1.5 border-t border-[#EDF0F5] py-3.5 text-xs font-semibold text-[#617CF3] transition-colors hover:bg-[#FAFBFF]"
              >
                View all activity <RiArrowRightLine className="size-4" />
              </button>
            </article>

            <aside
              id="journal"
              className="scroll-mt-24 rounded-2xl border border-[#E5E8F0] bg-white p-4 shadow-[0_2px_4px_rgba(33,49,80,0.02)] sm:p-5 lg:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#F2EDFF] text-[#9265D7]">
                      <RiBookOpenLine className="size-4" />
                    </span>
                    <p className="text-base font-semibold tracking-[-0.025em] text-[#273247]">
                      Daily journal
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-[#8993A4]">A little space for your thoughts.</p>
                </div>
                <button
                  type="button"
                  aria-label="Edit journal entry"
                  onClick={openJournalDrawer}
                  className="flex size-8 items-center justify-center rounded-lg bg-[#F7F5FF] text-[#9364D2] hover:bg-[#EEE9FF]"
                >
                  <RiEditLine className="size-4" />
                </button>
              </div>

              {reflection ? (
                <div className="mt-5 rounded-xl border border-[#EEEAFB] bg-[linear-gradient(135deg,#FBFAFF_0%,#F8F6FF_100%)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold tracking-[0.1em] text-[#A18DCC] uppercase">
                      {reflection.entryDate === activeDate ? "Today’s note" : shortDate(reflection.entryDate)}
                    </span>
                    {reflection.mood && (
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#7A5AAD] shadow-sm">
                        {reflection.mood}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[#514165]">
                    {reflection.title}
                  </h2>
                  <p className="mt-2 text-[12px] leading-5 text-[#7E718F]">
                    {reflection.content}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#AA9DBA]">
                    <RiTimeLine className="size-3.5" />
                    Last edited {displayTime(reflection.updatedAt)}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-[#E5E2EF] bg-[#FCFBFF] p-5 text-center">
                  <RiBookOpenLine className="mx-auto size-5 text-[#AB99CC]" />
                  <p className="mt-2 text-xs font-medium text-[#71647E]">Nothing written yet</p>
                  <p className="mt-1 text-[11px] leading-4 text-[#A399AE]">
                    Capture one thought from your day.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={openJournalDrawer}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E9E3FA] bg-white py-2.5 text-xs font-semibold text-[#8560C2] transition-colors hover:bg-[#FAF8FF]"
              >
                <RiEditLine className="size-3.5" />
                {reflection ? "Continue writing" : "Write today’s entry"}
              </button>

              <div className="mt-5 border-t border-[#EEF0F4] pt-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#EEF8F4] text-[#36A481]">
                    <RiCheckboxCircleFill className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#526077]">7-day reflection streak</p>
                    <p className="mt-0.5 text-[10px] text-[#98A2B2]">One small check-in at a time.</p>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section
            id="settings"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E2E7FA] bg-[#F0F3FF] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6680F5] shadow-sm">
                <RiWallet3Line className="size-[18px]" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#405078]">
                  {connection === "connected"
                    ? "Your workspace is securely synced with Supabase"
                    : "Preview mode keeps your new records in this browser"}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-[#7D8AA6]">
                  {connection === "connected"
                    ? "Expenses and journal notes are stored through the DailyTrack API."
                    : "Add DATABASE_URL and run the included Drizzle migration to turn on cloud persistence."}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setToast("Setup details are in README.md and .env.example.")}
              className="h-8 shrink-0 rounded-lg border-[#D6DFFF] bg-white px-3 text-[11px] font-semibold text-[#607BF1] hover:bg-[#F9FAFF]"
            >
              View setup
              <RiArrowRightLine className="size-3.5" />
            </Button>
          </section>
        </main>

        <Sheet
          open={drawer !== null}
          onOpenChange={(open) => {
            if (!open) setDrawer(null)
          }}
        >
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-full gap-0 border-l border-[#E3E7EF] bg-[#FCFCFE] p-0 sm:max-w-[460px]"
          >
            <div className="flex items-start justify-between border-b border-[#EBEDF2] px-5 py-5 sm:px-6">
              <SheetHeader className="gap-1 p-0 text-left">
                <SheetTitle className="font-heading text-[21px] font-semibold tracking-[-0.04em] text-[#273247]">
                  {drawer === "expense" ? "Add an expense" : "Write your daily note"}
                </SheetTitle>
                <SheetDescription className="text-xs leading-5 text-[#8B95A6]">
                  {drawer === "expense"
                    ? "Keep the details simple — you can refine them later."
                    : "A private moment to notice what mattered today."}
                </SheetDescription>
              </SheetHeader>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close panel"
                onClick={() => setDrawer(null)}
                className="-mr-2 rounded-xl text-[#8590A1] hover:bg-[#F1F3F7]"
              >
                <RiCloseLine className="size-5" />
              </Button>
            </div>

            {drawer === "expense" ? (
              <form onSubmit={submitExpense} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-[#59667B]">What did you spend on?</span>
                    <Input
                      autoFocus
                      value={expenseForm.description}
                      onChange={(event) =>
                        setExpenseForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="e.g. Lunch with friends"
                      className="h-11 border-[#E1E5EC] bg-white text-sm shadow-none placeholder:text-[#B0B8C4]"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-[#59667B]">Amount</span>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#79869A]">৳</span>
                        <Input
                          inputMode="decimal"
                          type="number"
                          min="0"
                          step="0.01"
                          value={expenseForm.amount}
                          onChange={(event) =>
                            setExpenseForm((current) => ({
                              ...current,
                              amount: event.target.value,
                            }))
                          }
                          placeholder="0.00"
                          className="h-11 border-[#E1E5EC] bg-white pl-7 text-sm shadow-none placeholder:text-[#B0B8C4]"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-[#59667B]">Date</span>
                      <Input
                        type="date"
                        value={expenseForm.spentAt}
                        onChange={(event) =>
                          setExpenseForm((current) => ({
                            ...current,
                            spentAt: event.target.value,
                          }))
                        }
                        className="h-11 border-[#E1E5EC] bg-white text-sm shadow-none"
                      />
                    </label>
                  </div>
                  <fieldset>
                    <legend className="mb-2 text-xs font-semibold text-[#59667B]">Category</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {expenseCategories.slice(0, 6).map((category) => (
                        <button
                          type="button"
                          key={category.name}
                          onClick={() =>
                            setExpenseForm((current) => ({
                              ...current,
                              category: category.name,
                            }))
                          }
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                            expenseForm.category === category.name
                              ? "border-[#BAC8FF] bg-[#F3F5FF] text-[#5A75EC]"
                              : "border-[#E5E8EE] bg-white text-[#667389] hover:border-[#D2D9EC]"
                          }`}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="truncate">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-[#59667B]">Payment method</span>
                      <select
                        value={expenseForm.paymentMethod}
                        onChange={(event) =>
                          setExpenseForm((current) => ({
                            ...current,
                            paymentMethod: event.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-lg border border-[#E1E5EC] bg-white px-3 text-sm text-[#526077] outline-none focus:border-[#A8B8FF] focus:ring-3 focus:ring-[#DDE4FF]"
                      >
                        <option>bKash</option>
                        <option>Cash</option>
                        <option>Card</option>
                        <option>Bank transfer</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-[#59667B]">Note <span className="font-normal text-[#A0A8B5]">optional</span></span>
                      <Input
                        value={expenseForm.notes}
                        onChange={(event) =>
                          setExpenseForm((current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        placeholder="Add details"
                        className="h-11 border-[#E1E5EC] bg-white text-sm shadow-none placeholder:text-[#B0B8C4]"
                      />
                    </label>
                  </div>
                  {expenseError && (
                    <p className="rounded-lg bg-[#FFF1EF] px-3 py-2 text-xs font-medium text-[#D95E50]">
                      {expenseError}
                    </p>
                  )}
                </div>
                <SheetFooter className="border-t border-[#EBEDF2] bg-white p-4 sm:p-5">
                  <div className="flex w-full gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDrawer(null)}
                      className="h-10 flex-1 border-[#E0E5ED] bg-white text-xs font-semibold text-[#657188]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 flex-[1.35] bg-[#637EFF] text-xs font-semibold text-white hover:bg-[#526EED]"
                    >
                      <RiAddLine className="size-4" /> Save expense
                    </Button>
                  </div>
                </SheetFooter>
              </form>
            ) : (
              <form onSubmit={submitJournal} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-[#59667B]">Entry date</span>
                    <Input
                      type="date"
                      value={journalForm.entryDate}
                      onChange={(event) =>
                        setJournalForm((current) => ({
                          ...current,
                          entryDate: event.target.value,
                        }))
                      }
                      className="h-11 border-[#E1E5EC] bg-white text-sm shadow-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-[#59667B]">Title</span>
                    <Input
                      autoFocus
                      value={journalForm.title}
                      onChange={(event) =>
                        setJournalForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Give this moment a name"
                      className="h-11 border-[#E1E5EC] bg-white text-sm shadow-none placeholder:text-[#B0B8C4]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-[#59667B]">What&apos;s on your mind?</span>
                    <textarea
                      value={journalForm.content}
                      onChange={(event) =>
                        setJournalForm((current) => ({
                          ...current,
                          content: event.target.value,
                        }))
                      }
                      rows={8}
                      placeholder="Write freely. This is your space."
                      className="w-full resize-none rounded-xl border border-[#E1E5EC] bg-white px-3 py-3 text-sm leading-6 text-[#526077] outline-none placeholder:text-[#B0B8C4] focus:border-[#AFBFFF] focus:ring-3 focus:ring-[#DDE4FF]"
                    />
                  </label>
                  <fieldset>
                    <legend className="mb-2 text-xs font-semibold text-[#59667B]">How did today feel?</legend>
                    <div className="flex flex-wrap gap-2">
                      {["Grateful", "Calm", "Focused", "Tired"].map((mood) => (
                        <button
                          type="button"
                          key={mood}
                          onClick={() =>
                            setJournalForm((current) => ({ ...current, mood }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                            journalForm.mood === mood
                              ? "bg-[#F0EAFF] text-[#815BBA]"
                              : "bg-[#F6F5F8] text-[#818A99] hover:bg-[#EEEAF5]"
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {journalError && (
                    <p className="rounded-lg bg-[#FFF1EF] px-3 py-2 text-xs font-medium text-[#D95E50]">
                      {journalError}
                    </p>
                  )}
                </div>
                <SheetFooter className="border-t border-[#EBEDF2] bg-white p-4 sm:p-5">
                  <div className="flex w-full gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDrawer(null)}
                      className="h-10 flex-1 border-[#E0E5ED] bg-white text-xs font-semibold text-[#657188]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 flex-[1.35] bg-[#8C67C5] text-xs font-semibold text-white hover:bg-[#7955AF]"
                    >
                      <RiBookOpenLine className="size-4" /> Save entry
                    </Button>
                  </div>
                </SheetFooter>
              </form>
            )}
          </SheetContent>
        </Sheet>

        {toast && (
          <div
            role="status"
            className="fixed bottom-5 right-4 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-[#DFE5F5] bg-[#202D44] px-3.5 py-3 text-xs font-medium text-white shadow-[0_15px_36px_rgba(23,35,57,0.25)] sm:right-6"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3E8F79]">
              <RiCheckboxCircleFill className="size-3.5" />
            </span>
            <span>{toast}</span>
            {submitting && <span className="ml-1 text-[#AAB9D3]">Syncing…</span>}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
