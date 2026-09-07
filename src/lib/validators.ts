import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use no more than 128 characters.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.")

export const registerPayloadSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: emailSchema,
  password: passwordSchema,
})

export const loginPayloadSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(128),
})

export const forgotPasswordPayloadSchema = z.object({
  email: emailSchema,
})

export const resetPasswordPayloadSchema = z.object({
  token: z.string().min(40, "That reset link is invalid.").max(200),
  password: passwordSchema,
})

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
