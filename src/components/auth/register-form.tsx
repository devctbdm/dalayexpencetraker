"use client"

import Link from "next/link"
import * as React from "react"
import { useRouter } from "next/navigation"
import {
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiUser3Line,
} from "@remixicon/react"

import { responseMessage } from "@/components/auth/form-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [pending, setPending] = React.useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("The passwords don’t match. Please try again.")
      return
    }

    setPending(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      if (!response.ok) {
        setError(await responseMessage(response))
        return
      }

      router.replace("/dashboard")
      router.refresh()
    } catch {
      setError("We could not create your account. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-[#56637A]">Your name</span>
        <div className="relative">
          <RiUser3Line className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-[#99A4B5]" />
          <Input
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Alex Morgan"
            className="h-11 border-[#E0E5EE] bg-white pl-10 text-sm placeholder:text-[#B1B9C5]"
            required
          />
        </div>
      </label>
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
        <span className="mb-2 block text-xs font-semibold text-[#56637A]">Create a password</span>
        <div className="relative">
          <RiLock2Line className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-[#99A4B5]" />
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
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
        <span className="mb-2 block text-xs font-semibold text-[#56637A]">Confirm password</span>
        <Input
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your password"
          className="h-11 border-[#E0E5EE] bg-white text-sm placeholder:text-[#B1B9C5]"
          required
        />
      </label>

      <div className="rounded-xl bg-[#F4F6FC] px-3 py-2.5 text-[11px] leading-5 text-[#7B8799]">
        <span className="flex items-center gap-1.5 font-medium text-[#6170A5]">
          <RiCheckboxCircleFill className="size-3.5 text-[#6F87FC]" />
          A strong password has:
        </span>
        <span className="ml-[22px]">8+ characters, an uppercase letter, a lowercase letter, and a number.</span>
      </div>

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
        {pending ? "Creating your account…" : "Create account"}
        {!pending && <RiArrowRightLine className="size-[18px]" />}
      </Button>

      <p className="pt-1 text-center text-xs text-[#818C9D]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#607AF2] hover:text-[#4B67D9]">
          Sign in
        </Link>
      </p>
    </form>
  )
}
