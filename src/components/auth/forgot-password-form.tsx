"use client"

import Link from "next/link"
import * as React from "react"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiMailLine,
  RiRefreshLine,
} from "@remixicon/react"

import { responseMessage } from "@/components/auth/form-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [pending, setPending] = React.useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setPending(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        setError(await responseMessage(response))
        return
      }

      const message = await responseMessage(response)
      setSuccess(message)
    } catch {
      setError("We could not request a reset email. Please try again.")
    } finally {
      setPending(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#DCE6FF] bg-[#F3F6FF] p-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-[#6380F8] shadow-sm">
            <RiCheckboxCircleFill className="size-5" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#465574]">Check your inbox</p>
          <p className="mt-1.5 text-xs leading-5 text-[#76839A]">{success}</p>
        </div>
        <button
          type="button"
          onClick={() => setSuccess("")}
          className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-[#627DF2] hover:text-[#4B67D9]"
        >
          <RiRefreshLine className="size-4" /> Use another email address
        </button>
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#7E899B] hover:text-[#526078]">
          <RiArrowLeftLine className="size-4" /> Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-[#56637A]">Email address</span>
        <div className="relative">
          <RiMailLine className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-[#99A4B5]" />
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-11 border-[#E0E5EE] bg-white pl-10 text-sm placeholder:text-[#B1B9C5]"
            required
          />
        </div>
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-[#FFF1EF] px-3 py-2.5 text-xs font-medium leading-5 text-[#D85D50]">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-[#637EFF] text-sm font-semibold text-white shadow-[0_10px_22px_rgba(91,118,238,0.22)] hover:bg-[#536FEE]"
      >
        {pending ? "Sending reset link…" : "Send reset link"}
        {!pending && <RiArrowRightLine className="size-[18px]" />}
      </Button>
      <Link href="/login" className="flex items-center justify-center gap-1.5 pt-1 text-xs font-semibold text-[#7E899B] hover:text-[#526078]">
        <RiArrowLeftLine className="size-4" /> Back to sign in
      </Link>
    </form>
  )
}
