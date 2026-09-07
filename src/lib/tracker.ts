export type ExpenseRecord = {
  id: string
  description: string
  amount: number
  category: string
  categoryColor: string
  spentAt: string
  recordedAt: string
  notes?: string | null
  paymentMethod?: string | null
}

export type JournalRecord = {
  id: string
  entryDate: string
  title: string
  content: string
  mood: string | null
  createdAt: string
  updatedAt: string
}

export const expenseCategories = [
  { name: "Food & Dining", color: "#F97350" },
  { name: "Groceries", color: "#77A63C" },
  { name: "Transport", color: "#4B83F5" },
  { name: "Health & Wellness", color: "#B768D9" },
  { name: "Shopping", color: "#E6A53A" },
  { name: "Housing", color: "#7663D4" },
  { name: "Personal", color: "#20A6A1" },
  { name: "Other", color: "#8B95A7" },
] as const

export function categoryColorForName(category: string) {
  return (
    expenseCategories.find((item) => item.name === category)?.color ?? "#8B95A7"
  )
}

/**
 * A polished offline starting state for local development. When DATABASE_URL is
 * configured, the dashboard replaces these with records from the API.
 */
export const demoExpenses: ExpenseRecord[] = [
  {
    id: "demo-groceries",
    description: "Farmer's market",
    amount: 1180,
    category: "Groceries",
    categoryColor: "#77A63C",
    spentAt: "2026-09-07T09:18:00.000Z",
    recordedAt: "2026-09-07T09:20:00.000Z",
    paymentMethod: "Cash",
  },
  {
    id: "demo-lunch",
    description: "Lunch at Biryani House",
    amount: 600,
    category: "Food & Dining",
    categoryColor: "#F97350",
    spentAt: "2026-09-07T13:35:00.000Z",
    recordedAt: "2026-09-07T13:35:00.000Z",
    paymentMethod: "bKash",
  },
  {
    id: "demo-ride",
    description: "Ride to work",
    amount: 380,
    category: "Transport",
    categoryColor: "#4B83F5",
    spentAt: "2026-09-07T08:43:00.000Z",
    recordedAt: "2026-09-07T08:44:00.000Z",
    paymentMethod: "Card",
  },
  {
    id: "demo-coffee",
    description: "Morning coffee",
    amount: 280,
    category: "Food & Dining",
    categoryColor: "#F97350",
    spentAt: "2026-09-07T06:55:00.000Z",
    recordedAt: "2026-09-07T06:57:00.000Z",
    paymentMethod: "Cash",
  },
  {
    id: "demo-pharmacy",
    description: "Pharmacy run",
    amount: 400,
    category: "Health & Wellness",
    categoryColor: "#B768D9",
    spentAt: "2026-09-07T18:05:00.000Z",
    recordedAt: "2026-09-07T18:07:00.000Z",
    paymentMethod: "Card",
  },
  {
    id: "demo-books",
    description: "Books & stationery",
    amount: 1200,
    category: "Shopping",
    categoryColor: "#E6A53A",
    spentAt: "2026-09-06T14:12:00.000Z",
    recordedAt: "2026-09-06T14:13:00.000Z",
    paymentMethod: "Card",
  },
  {
    id: "demo-dinner",
    description: "Dinner at home",
    amount: 920,
    category: "Food & Dining",
    categoryColor: "#F97350",
    spentAt: "2026-09-05T19:30:00.000Z",
    recordedAt: "2026-09-05T19:31:00.000Z",
    paymentMethod: "bKash",
  },
  {
    id: "demo-data",
    description: "Mobile data top-up",
    amount: 650,
    category: "Personal",
    categoryColor: "#20A6A1",
    spentAt: "2026-09-04T11:30:00.000Z",
    recordedAt: "2026-09-04T11:31:00.000Z",
    paymentMethod: "bKash",
  },
  {
    id: "demo-coffee-pastry",
    description: "Coffee & pastry",
    amount: 450,
    category: "Food & Dining",
    categoryColor: "#F97350",
    spentAt: "2026-09-03T09:05:00.000Z",
    recordedAt: "2026-09-03T09:07:00.000Z",
    paymentMethod: "Cash",
  },
  {
    id: "demo-vegetables",
    description: "Vegetables for home",
    amount: 850,
    category: "Groceries",
    categoryColor: "#77A63C",
    spentAt: "2026-09-02T17:00:00.000Z",
    recordedAt: "2026-09-02T17:01:00.000Z",
    paymentMethod: "Cash",
  },
  {
    id: "demo-bus",
    description: "Bus pass top-up",
    amount: 450,
    category: "Transport",
    categoryColor: "#4B83F5",
    spentAt: "2026-09-01T08:15:00.000Z",
    recordedAt: "2026-09-01T08:16:00.000Z",
    paymentMethod: "Cash",
  },
]

export const demoJournal: JournalRecord[] = [
  {
    id: "demo-journal-today",
    entryDate: "2026-09-07",
    title: "A small win today",
    content:
      "I made space for a slower morning and finished the task I had been putting off. Keeping that calm energy for the rest of the week.",
    mood: "Grateful",
    createdAt: "2026-09-07T16:42:00.000Z",
    updatedAt: "2026-09-07T16:42:00.000Z",
  },
]
