import type { Metadata } from "next"

import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: "DailyTrack — personal money & moments",
  description: "A calm home for daily expenses and journal reflections.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#F7F8FC] font-sans text-[#1D2739]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
