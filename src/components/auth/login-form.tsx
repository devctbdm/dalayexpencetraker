"use client"

import Link from "next/link"
import * as React from "react"
import { useRouter } from "next/navigation"
import {
  RiArrowRightLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { responseMessage } from "@/components/auth/form-utils"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [pending, setPending] = React.useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) {
        setError(await responseMessage(response))
        return
      }

      router.replace("/dashboard")
      router.refresh()
    } catch {
      setError("We could not reach DailyTrack. Please check your connection.")
    } finally {
      setPending(false)
    }
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
      <label className="block">
        <span className="mb-2 flex items-center justify-between text-xs font-semibold text-[#56637A]">
          Password
          <Link
            href="/forgot-password"
            className="font-medium text-[#637DFA] transition-colors hover:text-[#4D67DB]"
          >
            Forgot password?
          </Link>
        </span>
        <div className="relative">
          <RiLock2Line className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-[#99A4B5]" />
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
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
        {pending ? "Signing you in…" : "Sign in"}
        {!pending && <RiArrowRightLine className="size-[18px]" />}
      </Button>

      <p className="pt-1 text-center text-xs text-[#818C9D]">
        New to DailyTrack?{" "}
        <Link href="/register" className="font-semibold text-[#607AF2] hover:text-[#4B67D9]">
          Create an account
        </Link>
      </p>
    </form>
  )
}
