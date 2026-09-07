"use client"

import Link from "next/link"
import * as React from "react"
import { useRouter } from "next/navigation"
import {
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiEyeLine,
  RiEyeOffLine,
  RiKey2Line,
  RiLock2Line,
} from "@remixicon/react"

import { responseMessage } from "@/components/auth/form-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [complete, setComplete] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!token) {
      setError("This reset link is missing its token. Request a new one.")
      return
    }
    if (password !== confirmPassword) {
      setError("The passwords don’t match. Please try again.")
      return
    }

    setPending(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      if (!response.ok) {
        setError(await responseMessage(response))
        return
      }
      setComplete(true)
    } catch {
      setError("We could not reset your password. Please try again.")
    } finally {
      setPending(false)
    }
  }

  if (complete) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#DCE6FF] bg-[#F3F6FF] p-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-[#6380F8] shadow-sm">
            <RiCheckboxCircleFill className="size-5" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#465574]">Your password is updated</p>
          <p className="mt-1.5 text-xs leading-5 text-[#76839A]">
            You&apos;re signed in and ready to return to your DailyTrack workspace.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            router.replace("/dashboard")
            router.refresh()
          }}
          className="h-11 w-full rounded-xl bg-[#637EFF] text-sm font-semibold text-white hover:bg-[#536FEE]"
        >
          Continue to dashboard <RiArrowRightLine className="size-[18px]" />
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="rounded-xl bg-[#F4F6FC] p-3 text-xs leading-5 text-[#748198]">
        <span className="flex items-center gap-1.5 font-semibold text-[#5A6D9B]">
          <RiKey2Line className="size-4 text-[#6F87FC]" />
          Choose a fresh password
        </span>
        <span className="mt-0.5 block">Use 8+ characters with uppercase, lowercase, and a number.</span>
      </div>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-[#56637A]">New password</span>
        <div className="relative">
          <RiLock2Line className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-[#99A4B5]" />
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a new password"
            className="h-11 border-[#E0E5EE] bg-white px-10 text-sm placeholder:text-[#B1B9C5]"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8E99AA] hover:bg-[#F3F5F8] hover:text-[#56647C]"
          >
            {showPassword ? <RiEyeOffLine className="size-[17px]" /> : <RiEyeLine className="size-[17px]" />}
          </button>
        </div>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-[#56637A]">Confirm new password</span>
        <Input
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your new password"
          className="h-11 border-[#E0E5EE] bg-white text-sm placeholder:text-[#B1B9C5]"
          required
        />
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
        {pending ? "Updating password…" : "Update password"}
        {!pending && <RiArrowRightLine className="size-[18px]" />}
      </Button>
      <Link href="/login" className="block pt-1 text-center text-xs font-semibold text-[#71809A] hover:text-[#536176]">
        Back to sign in
      </Link>
    </form>
  )
}
