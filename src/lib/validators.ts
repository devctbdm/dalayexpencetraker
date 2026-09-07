import { z } from "zod"

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date.")

export const expensePayloadSchema = z.object({
  description: z.string().trim().min(1, "Add an item description.").max(180),
  amount: z.coerce
    .number()
    .finite()
    .positive("The amount must be greater than zero.")
    .max(9_999_999.99),
  category: z.string().trim().min(1, "Select a category.").max(80),
  spentAt: isoDateSchema.optional(),
  notes: z.string().trim().max(600).optional().nullable(),
  paymentMethod: z.string().trim().max(40).optional().nullable(),
})

export const expenseUpdateSchema = expensePayloadSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one expense field to update.",
  })

export const journalPayloadSchema = z.object({
  entryDate: isoDateSchema,
  title: z.string().trim().min(1, "Add a journal title.").max(180),
  content: z.string().trim().min(1, "Write a few words first.").max(10_000),
  mood: z.string().trim().max(40).optional().nullable(),
})
