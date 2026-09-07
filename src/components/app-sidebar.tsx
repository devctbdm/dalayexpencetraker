"use client"

import * as React from "react"
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiBookOpenLine,
  RiCalendarCheckLine,
  RiCompass3Line,
  RiLayoutGridLine,
  RiQuestionLine,
  RiSettings3Line,
  RiWallet3Line,
} from "@remixicon/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onAddExpense?: () => void
  onWriteEntry?: () => void
}

const navigation = [
  { title: "Overview", href: "#overview", icon: RiLayoutGridLine, active: true },
  { title: "Expenses", href: "#expenses", icon: RiWallet3Line },
  { title: "Journal", href: "#journal", icon: RiBookOpenLine },
  { title: "Insights", href: "#insights", icon: RiBarChartBoxLine },
]

export function AppSidebar({
  onAddExpense,
  onWriteEntry,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-0"
      style={
        {
          "--sidebar": "#111C2E",
          "--sidebar-foreground": "#D7E0F0",
          "--sidebar-primary": "#5F80FF",
          "--sidebar-primary-foreground": "#FFFFFF",
          "--sidebar-accent": "#1D2B43",
          "--sidebar-accent-foreground": "#FFFFFF",
          "--sidebar-border": "#263752",
          "--sidebar-ring": "#7D9BFF",
        } as React.CSSProperties
      }
      {...props}
    >
      <SidebarHeader className="px-3 pb-2 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="DailyTrack"
              render={<a href="#overview" />}
              className="h-12 px-1.5 hover:bg-transparent"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#6380FF] text-white shadow-[0_8px_20px_rgba(75,103,235,0.35)]">
                <RiCalendarCheckLine className="size-[18px]" />
              </span>
              <span className="font-heading text-[17px] font-semibold tracking-[-0.03em] text-white">
                dailytrack
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-5">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 text-[10px] font-semibold tracking-[0.14em] text-[#8795AC] uppercase">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu className="mt-2 gap-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.active}
                    render={<a href={item.href} />}
                    className={
                      item.active
                        ? "h-10 rounded-lg bg-[#263B61] text-white hover:bg-[#2C436D] hover:text-white"
                        : "h-10 rounded-lg text-[#B1BDD0] hover:bg-[#1D2B43] hover:text-white"
                    }
                  >
                    <Icon className="size-[17px]" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-6 p-0">
          <SidebarGroupLabel className="px-2 text-[10px] font-semibold tracking-[0.14em] text-[#8795AC] uppercase">
            Quick actions
          </SidebarGroupLabel>
          <SidebarMenu className="mt-2 gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Add expense"
                onClick={onAddExpense}
                className="h-10 rounded-lg text-[#B1BDD0] hover:bg-[#1D2B43] hover:text-white"
              >
                <RiAddLine className="size-[17px]" />
                <span>Add expense</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Write entry"
                onClick={onWriteEntry}
                className="h-10 rounded-lg text-[#B1BDD0] hover:bg-[#1D2B43] hover:text-white"
              >
                <RiBookOpenLine className="size-[17px]" />
                <span>Write entry</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <div className="mt-auto overflow-hidden rounded-xl border border-[#2C3C58] bg-[#182740] p-3.5 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#DDE7F8]">Your rhythm</span>
            <span className="rounded-full bg-[#29446A] px-2 py-0.5 text-[10px] font-semibold text-[#9AB4FF]">
              7 days
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-[#9DAEC7]">
            You&apos;re building a lovely daily habit.
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2A3B58]">
            <div className="h-full w-[78%] rounded-full bg-[#6A84FF]" />
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#263752] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              render={<a href="#settings" />}
              className="h-9 rounded-lg text-[#B1BDD0] hover:bg-[#1D2B43] hover:text-white"
            >
              <RiSettings3Line className="size-[17px]" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Need help?"
              render={<a href="mailto:hello@dailytrack.app" />}
              className="h-9 rounded-lg text-[#B1BDD0] hover:bg-[#1D2B43] hover:text-white"
            >
              <RiQuestionLine className="size-[17px]" />
              <span>Help & feedback</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-2 border-t border-[#263752] pt-2">
            <SidebarMenuButton
              size="lg"
              tooltip="Alex Morgan"
              render={<button type="button" />}
              className="h-12 rounded-lg px-1.5 text-[#D7E0F0] hover:bg-[#1D2B43] hover:text-white"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F7B696] to-[#D476A6] text-[11px] font-bold text-white">
                AM
              </span>
              <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                <span className="truncate text-[12px] font-medium text-white">
                  Alex Morgan
                </span>
                <span className="truncate text-[10px] text-[#91A1B9]">
                  Personal workspace
                </span>
              </span>
              <RiCompass3Line className="size-4 text-[#91A1B9]" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
