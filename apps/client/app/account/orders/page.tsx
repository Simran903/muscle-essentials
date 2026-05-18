"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Package } from "lucide-react"

import { Button } from "@/app/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import {
  fetchAuthUser,
  getAccountOrders,
  refreshSession,
  type AccountOrder,
  type AuthUser,
} from "@/lib/api"
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth-storage"

import { AccountBackground } from "../../components/Account/AccountBackground"
import { AccountOrderCard } from "../../components/Account/AccountOrderCard"
import { applyAccountOrderMocks } from "../../components/Account/account-order-mocks"

type PageMode = "guest" | "loading" | "ready"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  )
}

export default function AccountOrdersPage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<PageMode>("loading")
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [orders, setOrders] = React.useState<AccountOrder[]>([])

  const hydrate = React.useCallback(async (token: string) => {
    const [u, ords] = await Promise.all([
      fetchAuthUser(token),
      getAccountOrders(token),
    ])
    if (!u) return null
    setUser(u)
    setOrders(applyAccountOrderMocks(ords))
    return u
  }, [])

  const load = React.useCallback(async () => {
    let token = getAccessToken()
    if (!token) {
      const rotated = await refreshSession()
      if (!rotated) {
        setMode("guest")
        return
      }
      setAccessToken(rotated)
      token = rotated
    }
    const u = await hydrate(token)
    if (!u) {
      const rotated = await refreshSession()
      if (!rotated) {
        clearAccessToken()
        setMode("guest")
        return
      }
      setAccessToken(rotated)
      const retry = await hydrate(rotated)
      if (!retry) {
        clearAccessToken()
        setMode("guest")
        return
      }
    }
    setMode("ready")
  }, [hydrate])

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(id)
  }, [load])

  if (mode === "guest") {
    return (
      <div className="relative min-h-svh bg-background">
        <AccountBackground />
        <main className="relative isolate mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-border/50 bg-card/90 p-8 text-center shadow-xl backdrop-blur-md sm:p-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 ring-4 ring-muted/20">
              <Lock className="size-7 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Sign in to view orders
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Order history is available after you sign in from the navbar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="h-11 rounded-full px-8 shadow-none">
                <Link href="/shop">Browse shop</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-8">
                <Link href="/account">Account</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (mode === "loading" || !user) {
    return (
      <div className="relative min-h-svh bg-background">
        <AccountBackground />
        <main className="relative isolate mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pb-16 lg:px-10 lg:pt-10">
          <Skeleton className="h-4 w-64 rounded-full" />
          <Skeleton className="mt-8 h-10 w-48 rounded-lg" />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-svh bg-background">
      <AccountBackground />
      <main className="relative isolate mx-auto w-full max-w-6xl px-4 pb-28 text-foreground sm:px-6 sm:pb-16 lg:px-10">

        <header className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>Your purchases</SectionLabel>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Orders
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Status and totals for every order tied to your account.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-xl"
            onClick={() => router.push("/account")}
          >
            Back to account
          </Button>
        </header>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-6 py-14 text-center">
            <Package className="mx-auto size-10 text-muted-foreground/80" />
            <p className="mt-4 text-base font-semibold text-foreground">No orders yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              When you check out, your orders will be listed here.
            </p>
            <Button asChild className="mt-6 rounded-full px-8">
              <Link href="/shop">Shop supplements</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {orders.map((o) => (
              <AccountOrderCard key={o.id} order={o} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
