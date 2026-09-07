import Link from "next/link"
import {
  RiCalendarCheckLine,
  RiCheckboxCircleFill,
  RiLock2Line,
  RiSparkling2Line,
} from "@remixicon/react"

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-svh bg-[#F7F8FC] lg:grid lg:grid-cols-[minmax(380px,0.93fr)_minmax(520px,1.07fr)]">
      <aside className="relative hidden overflow-hidden bg-[#111C2E] p-10 text-white lg:flex lg:min-h-svh lg:flex-col xl:p-14">
        <div className="absolute -left-20 top-1/3 size-72 rounded-full bg-[#405FD6]/20 blur-3xl" />
        <div className="absolute -right-16 -top-16 size-72 rounded-full border border-[#7993FF]/10" />
        <div className="absolute bottom-0 right-0 size-80 translate-x-1/3 translate-y-1/3 rounded-full bg-[#6E62C7]/25 blur-3xl" />

        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5 self-start">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#6682FF] text-white shadow-[0_10px_28px_rgba(84,112,240,0.35)]">
            <RiCalendarCheckLine className="size-5" />
          </span>
          <span className="font-heading text-[20px] font-semibold tracking-[-0.04em]">
            dailytrack
          </span>
        </Link>

        <div className="relative z-10 my-auto max-w-md pt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-[#C5D1FF]">
            <RiSparkling2Line className="size-3.5" />
            Your calm daily companion
          </span>
          <h1 className="mt-6 font-heading text-[42px] font-semibold leading-[1.08] tracking-[-0.055em] text-white xl:text-[50px]">
            Make room for what matters.
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-[#AEBBD1]">
            Keep your spending and small moments together in one private, thoughtful space.
          </p>

          <div className="mt-10 max-w-[345px] rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.14)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#F1EDFF] text-[#A677DB]">
                <RiCheckboxCircleFill className="size-[18px]" />
              </span>
              <div>
                <p className="text-[12px] font-semibold text-white">A habit worth keeping</p>
                <p className="mt-0.5 text-[11px] text-[#A9B7CD]">A private check-in, one day at a time.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <span
                  className={`h-1.5 flex-1 rounded-full ${
                    day < 7 ? "bg-[#7790FF]" : "bg-white/15"
                  }`}
                  key={day}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[11px] text-[#8392AC]">
          <RiLock2Line className="size-3.5" />
          Your data stays private to your account.
        </div>
      </aside>

      <section className="relative flex min-h-svh flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
        <Link href="/" className="inline-flex items-center gap-2.5 self-start lg:hidden">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#6682FF] text-white shadow-sm">
            <RiCalendarCheckLine className="size-[18px]" />
          </span>
          <span className="font-heading text-[18px] font-semibold tracking-[-0.04em] text-[#273247]">
            dailytrack
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-10 lg:py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.13em] text-[#7485DC] uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-3 font-heading text-[31px] font-semibold tracking-[-0.05em] text-[#263146] sm:text-[35px]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7D889B]">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>

        <p className="text-center text-[11px] leading-5 text-[#99A3B3] lg:text-left">
          Protected with secure, HTTP-only sessions.
        </p>
      </section>
    </main>
  )
}
