"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  IconBuildingStore,
  IconCategory,
  IconLayoutDashboard,
  IconPackage,
  IconReceipt,
  IconStar,
  IconUsers,
} from "@tabler/icons-react"

import { fetchAuthUser } from "@/lib/api"
import { getAccessToken } from "@/lib/auth-storage"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin", label: "Overview", icon: IconLayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: IconPackage },
  { href: "/admin/brands", label: "Brands", icon: IconBuildingStore },
  { href: "/admin/categories", label: "Categories", icon: IconCategory },
  { href: "/admin/orders", label: "Orders", icon: IconReceipt },
  { href: "/admin/users", label: "Users", icon: IconUsers },
  { href: "/admin/reviews", label: "Reviews", icon: IconStar },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [gate, setGate] = React.useState<"loading" | "ok" | "signin" | "forbidden">("loading")

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      const token = getAccessToken()
      if (!token) {
        if (!cancelled) setGate("signin")
        return
      }
      const user = await fetchAuthUser(token)
      if (cancelled) return
      if (!user) {
        setGate("signin")
        return
      }
      if (user.role !== "ADMIN") {
        setGate("forbidden")
        return
      }
      setGate("ok")
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  if (gate === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    )
  }

  if (gate === "signin") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-foreground">Admin sign-in required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the site header to sign in with an administrator account.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40"
        >
          Back to store
        </Link>
      </div>
    )
  }

  if (gate === "forbidden") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-foreground">Forbidden</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account is not an administrator.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Back to store
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-0 px-0 pb-16 pt-6 sm:flex-row sm:px-4 lg:gap-8 lg:px-6">
      <aside className="shrink-0 sm:w-52 lg:w-56">
        <div className="sticky top-24 space-y-1 rounded-xl border border-border/60 bg-card/70 p-3 shadow-none">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="size-4 opacity-80" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
