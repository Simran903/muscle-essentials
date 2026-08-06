"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import { Breadcrumbs } from "@/app/components/Common/Breadcrumbs"
import {
  fetchAuthUser,
  getAccountAddresses,
  getAccountOrders,
  logoutSession,
  refreshSession,
  type AccountAddress,
  type AccountOrder,
  type AuthUser,
} from "@/lib/api"
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth-storage"
import { pageMainCenteredClassName, pageMainClassName } from "@/lib/page-layout"
import { cn } from "@/lib/utils"

import { AccountAddresses } from "../components/Account/AccountAddresses"
import { AccountBackground } from "../components/Account/AccountBackground"
import { applyAccountOrderMocks } from "../components/Account/account-order-mocks"

type PageMode = "guest" | "loading" | "ready"

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function initialsFor(user: AuthUser): string {
  const name = user.name?.trim()
  if (name) {
    const parts = name.split(/\s+/)
    const first = parts[0]?.[0] ?? ""
    const last = parts.length > 1 ? parts[parts.length - 1]![0] : ""
    const out = `${first}${last}`.toUpperCase()
    if (out.length > 0) return out
  }
  const email = user.email?.trim()
  if (email) return email[0]!.toUpperCase()
  return "ME"
}

function titleCase(value: string): string {
  if (!value) return ""
  return value
    .toLowerCase()
    .split("_")
    .map((seg) => (seg ? seg[0]!.toUpperCase() + seg.slice(1) : seg))
    .join(" ")
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  accent = "default",
}: {
  icon: typeof Package
  label: string
  value: string | number
  hint?: string
  accent?: "default" | "primary"
}) {
  const iconWrap = {
    default: "border-border/60 bg-muted/30 text-muted-foreground",
    primary: "border-primary/25 bg-primary/10 text-primary",
  }[accent]

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-foreground/3 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border",
            iconWrap,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  )
}

function ContactCard({ user }: { user: AuthUser }) {
  const rows = [
    {
      icon: Mail,
      label: "Email",
      value: user.email?.trim(),
    },
    {
      icon: Phone,
      label: "Phone",
      value: user.phone?.trim(),
    },
  ] as const

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/85 shadow-sm backdrop-blur-sm">
      <div className="border-b border-border/40 bg-muted/20 px-5 py-4 sm:px-6">
        <SectionLabel>Contact</SectionLabel>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Reach you about orders
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Used for receipts, delivery updates, and support.
        </p>
      </div>
      <ul className="divide-y divide-border/40">
        {rows.map(({ icon: Icon, label, value }) => {
          const empty = !value
          return (
            <li key={label} className="flex items-start gap-4 px-5 py-4 sm:px-6">
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/70 text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p
                  className={cn(
                    "mt-0.5 break-all text-sm",
                    empty
                      ? "italic text-muted-foreground"
                      : "font-medium text-foreground",
                  )}
                >
                  {empty ? "Not on file" : value}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ShortcutTile({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: typeof Package
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-card/90 to-card/60 p-3.5 shadow-sm transition-all hover:border-border hover:shadow-md"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<PageMode>("loading")
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [orders, setOrders] = React.useState<AccountOrder[]>([])
  const [addresses, setAddresses] = React.useState<AccountAddress[]>([])
  const [accessToken, setAccessTokenState] = React.useState<string | null>(null)
  const [signingOut, setSigningOut] = React.useState(false)

  const hydrate = React.useCallback(async (token: string) => {
    const [u, ords, addrs] = await Promise.all([
      fetchAuthUser(token),
      getAccountOrders(token),
      getAccountAddresses(token),
    ])
    if (!u) return null
    setUser(u)
    setOrders(applyAccountOrderMocks(ords))
    setAddresses(addrs)
    setAccessTokenState(token)
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

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await logoutSession()
    } finally {
      clearAccessToken()
      window.dispatchEvent(new Event("auth:force-check"))
      toast.success("Signed out.")
      router.push("/")
    }
  }

  if (mode === "guest") {
    return (
      <div className="relative min-h-svh bg-background">
        <AccountBackground />
        <main className={pageMainCenteredClassName()}>
          <Breadcrumbs className="self-start" />
          <div className="rounded-2xl border border-border/20 bg-card/60 p-8 text-center shadow-sm backdrop-blur-sm sm:p-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 ring-4 ring-muted/20">
              <Lock className="size-7 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Sign in to continue
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your account area shows orders, saved addresses, and quick links after you log in.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                type="button"
                size="lg"
                className="h-11 rounded-xl px-8 shadow-sm"
                onClick={() => window.dispatchEvent(new Event("auth:open-login"))}
              >
                Log in
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-xl px-8">
                <Link href="/shop">Browse shop</Link>
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
        <main className={pageMainClassName()}>
          <Breadcrumbs />
          <Skeleton className="h-4 w-48 rounded-full" />
          <Skeleton className="mt-6 h-52 w-full rounded-3xl sm:h-48" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-4 lg:col-span-7">
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
            <div className="space-y-4 lg:col-span-5">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  const displayName = user.name?.trim() || "Welcome back"
  const memberSince = formatDate(user.createdAt)
  const lastLogin = formatDate(user.lastLoginAt)
  const isAdmin = user.role === "ADMIN"
  const isActive = user.status?.toUpperCase() === "ACTIVE"
  const defaultAddr =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null

  return (
    <div className="relative min-h-svh bg-background">
      <AccountBackground />

      <main className={pageMainClassName()}>

        <Breadcrumbs />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border/20 bg-card/60 shadow-sm ring-1 ring-border/20 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-primary/[0.07] via-transparent to-primary/6" />
          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8 lg:p-10">
            <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/85 text-lg font-bold tracking-tight text-primary-foreground shadow-md ring-2 ring-primary/20 sm:size-18 sm:text-2xl"
                aria-hidden
              >
                {initialsFor(user)}
              </div>
              <div className="min-w-0 flex-1">
                <SectionLabel>Your account</SectionLabel>
                <h1 className="mt-1.5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                  {displayName}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/12 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                      <Sparkles className="size-3.5 text-primary" /> Admin
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      isActive
                        ? "border-emerald-500/35 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200"
                        : "border-amber-500/35 bg-amber-500/12 text-amber-900 dark:text-amber-100",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isActive ? "bg-emerald-500" : "bg-amber-500",
                      )}
                    />
                    {titleCase(user.status)}
                  </span>
                  {memberSince ? (
                    <span className="text-xs text-muted-foreground">
                      Member since {memberSince}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 w-full rounded-xl border-border/70 sm:w-auto"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
              >
                <LogOut className="size-4" />
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
              {lastLogin ? (
                <p className="text-center text-xs text-muted-foreground sm:text-right">
                  Last sign-in · {lastLogin}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Summary tiles */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
          <SummaryTile
            icon={Package}
            label="Orders"
            value={orders.length}
            hint={
              orders.length === 0
                ? "Completed purchases show up here."
                : `${orders.length} ${orders.length === 1 ? "order" : "orders"} on file`
            }
            accent="primary"
          />
          <SummaryTile
            icon={MapPin}
            label="Saved addresses"
            value={addresses.length}
            hint={
              addresses.length === 0
                ? "Add one for faster checkout."
                : defaultAddr
                  ? `Default · ${defaultAddr.city}`
                  : "Set a default for checkout."
            }
            accent="primary"
          />
        </section>

        {/* Main grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Primary column: contact + addresses */}
          <div className="space-y-8 lg:col-span-7">
            <ContactCard user={user} />
            <AccountAddresses
              addresses={addresses}
              accessToken={accessToken}
              onChange={setAddresses}
              className="mt-0"
            />
          </div>

          {/* Sidebar: orders CTA + shortcuts + admin */}
          <aside className="space-y-6 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/85 shadow-sm backdrop-blur-sm">
              <div className="border-b border-border/40 bg-muted/15 px-5 py-4 sm:px-6">
                <SectionLabel>Orders</SectionLabel>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  Order history
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {orders.length === 0
                    ? "You have not placed any orders yet. Browse the shop to get started."
                    : `You have ${orders.length} ${orders.length === 1 ? "order" : "orders"} on file. View details, status, and totals in one place.`}
                </p>
                <Button asChild size="lg" className="mt-4 w-full rounded-xl shadow-none sm:w-auto">
                  <Link href="/account/orders" className="gap-2">
                    View orders
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <SectionLabel>Shortcuts</SectionLabel>
              <h2 className="mt-1 text-base font-semibold text-foreground">
                Keep moving
              </h2>
              <div className="mt-4 grid gap-2.5">
                <ShortcutTile
                  href="/shop"
                  icon={ShoppingBag}
                  title="Shop catalog"
                  description="All products & filters"
                />
                <ShortcutTile
                  href="/cart"
                  icon={Package}
                  title="Your cart"
                  description="Review bag & checkout"
                />
                <ShortcutTile
                  href="/contact"
                  icon={Mail}
                  title="Contact us"
                  description="Help with an order"
                />
              </div>
            </div>

            {isAdmin ? (
              <div className="overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-br from-primary/12 via-primary/6 to-transparent p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <SectionLabel>Admin</SectionLabel>
                    <h2 className="mt-1 text-base font-semibold text-foreground">
                      Store console
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Products, orders, reviews, and merchandising.
                    </p>
                  </div>
                  <Button asChild size="lg" className="shrink-0 rounded-xl px-5 shadow-none">
                    <Link href="/admin">Open admin</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  )
}
