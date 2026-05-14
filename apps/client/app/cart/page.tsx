"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  ChevronRight,
  Lock,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import {
  fetchCart,
  removeCartLine,
  updateCartLineQuantity,
  type Cart,
  type CartLineItem,
} from "@/lib/api"
import { getAccessToken } from "@/lib/auth-storage"
import { cn } from "@/lib/utils"

/** Clears fixed mobile tab bar in Navbar (`md:hidden`) + iOS home indicator. */
const MOBILE_TAB_BAR_BOTTOM =
  "max-md:pb-[max(7rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))]"

function formatInr(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

type PageMode = "guest" | "loading" | "error" | "empty" | "ready"

function CartLineRow({
  item,
  busyId,
  onSetQty,
  onRemove,
}: {
  item: CartLineItem
  busyId: string | null
  onSetQty: (item: CartLineItem, next: number) => void
  onRemove: (itemId: string) => void
}) {
  const inactive = !item.product.isActive
  const maxQty = item.product.stockQuantity
  const isBusy = busyId === item.id
  const thumbUrl = item.product.imageUrl
  const thumbAlt = item.product.imageAlt ?? item.product.title

  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-sm ring-1 ring-border/15 backdrop-blur-sm transition-shadow hover:shadow-md",
        inactive && "opacity-75",
      )}
    >
      <div className="flex gap-3 p-3.5 sm:gap-4 sm:p-5">
        <Link
          href={`/shop/${item.product.slug}`}
          className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/40 sm:size-29 sm:rounded-2xl"
          aria-label={`View ${item.product.title}`}
        >
          {thumbUrl ? (
            <Image
              src={thumbUrl}
              alt={thumbAlt}
              fill
              sizes="(max-width: 640px) 80px, 116px"
              className="object-cover"
            />
          ) : (
            <Package className="size-9 text-muted-foreground/65 sm:size-11" strokeWidth={1.25} aria-hidden />
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  href={`/shop/${item.product.slug}`}
                  className="line-clamp-2 min-w-0 text-[15px] font-semibold leading-snug tracking-tight text-foreground underline-offset-2 transition-opacity hover:opacity-80 sm:text-base"
                >
                  {item.product.title}
                </Link>
                {inactive ? (
                  <span className="shrink-0 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                    Unavailable
                  </span>
                ) : null}
              </div>
              {item.selectedFlavourLabel !== "" || item.selectedSizeLabel !== "" ? (
                <div className="flex flex-wrap gap-1.5">
                  {item.selectedFlavourLabel !== "" ? (
                    <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {item.selectedFlavourLabel}
                    </span>
                  ) : null}
                  {item.selectedSizeLabel !== "" ? (
                    <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {item.selectedSizeLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:size-10"
              disabled={isBusy}
              onClick={() => onRemove(item.id)}
              aria-label="Remove from cart"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/40 pt-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-3">
            <p className="text-xs tabular-nums text-muted-foreground sm:text-sm">
              <span className="text-muted-foreground/80">Each </span>
              <span className="font-medium text-foreground">{formatInr(item.unitPrice)}</span>
            </p>

            <div className="flex items-center gap-4 max-sm:justify-between">
              <div className="flex h-10 items-center rounded-xl border border-border/60 bg-background/80 px-0.5 shadow-sm dark:bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg"
                  disabled={isBusy || inactive || item.quantity <= 1}
                  onClick={() => onSetQty(item, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="min-w-9 px-1.5 text-center text-sm font-bold tabular-nums text-foreground">
                  {item.quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg"
                  disabled={isBusy || inactive || item.quantity >= maxQty}
                  onClick={() => onSetQty(item, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Line total
                </p>
                <p className="text-lg font-bold tabular-nums leading-tight text-foreground sm:text-xl">
                  {formatInr(item.lineTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <main
      className={cn(
        "relative isolate mx-auto flex min-h-[calc(100svh-5rem)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center sm:py-24",
        MOBILE_TAB_BAR_BOTTOM,
      )}
    >
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-muted/30 text-muted-foreground">
        <Icon className="size-9" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">{description}</p>
      {children ? <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </main>
  )
}

export default function CartPage() {
  const [cart, setCart] = React.useState<Cart | null>(null)
  const [mode, setMode] = React.useState<PageMode>("loading")
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setCart(null)
      setMode("guest")
      return
    }
    setMode("loading")
    setLoadError(null)
    try {
      const data = await fetchCart(token)
      setCart(data)
      setMode(data.items.length === 0 ? "empty" : "ready")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't load cart."
      setLoadError(msg)
      setCart(null)
      setMode("error")
    }
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount fetch delegates to async `load`
    void load()
  }, [load])

  React.useEffect(() => {
    const onUpdated = () => {
      void load()
    }
    window.addEventListener("cart:updated", onUpdated)
    return () => window.removeEventListener("cart:updated", onUpdated)
  }, [load])

  const setQty = async (item: CartLineItem, next: number) => {
    const t = getAccessToken()
    if (!t) return
    if (next < 1) return
    if (next > item.product.stockQuantity) {
      toast.error("Not enough stock for that quantity.")
      return
    }
    setBusyId(item.id)
    try {
      const updated = await updateCartLineQuantity(t, item.id, next)
      setCart(updated)
      setMode(updated.items.length === 0 ? "empty" : "ready")
      window.dispatchEvent(new Event("cart:updated"))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update quantity.")
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (itemId: string) => {
    const t = getAccessToken()
    if (!t) return
    setBusyId(itemId)
    try {
      const updated = await removeCartLine(t, itemId)
      setCart(updated)
      setMode(updated.items.length === 0 ? "empty" : "ready")
      window.dispatchEvent(new Event("cart:updated"))
      toast.success("Removed from cart.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove item.")
    } finally {
      setBusyId(null)
    }
  }

  const itemCount = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0

  if (mode === "guest") {
    return (
      <EmptyState
        icon={Lock}
        title="Sign in to see your cart"
        description="Your bag is tied to your account. Log in from the navbar, then come back here to review items and checkout."
      >
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/shop">Browse shop</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full px-8">
          <Link href="/">Back to home</Link>
        </Button>
      </EmptyState>
    )
  }

  if (mode === "loading") {
    return (
      <main
        className={cn(
          "relative isolate mx-auto min-h-svh w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10",
          MOBILE_TAB_BAR_BOTTOM,
        )}
      >
        <Skeleton className="mb-6 h-5 w-64 rounded-full" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48 rounded-2xl" />
            <Skeleton className="h-4 w-72 rounded-full" />
          </div>
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl lg:sticky lg:top-24" />
        </div>
      </main>
    )
  }

  if (mode === "error") {
    return (
      <EmptyState
        icon={AlertCircle}
        title="We couldn’t load your cart"
        description={loadError ?? "Something went wrong. Check your connection and try again."}
      >
        <Button type="button" size="lg" className="rounded-full px-8" onClick={() => void load()}>
          Try again
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full px-8">
          <Link href="/shop">Browse shop</Link>
        </Button>
      </EmptyState>
    )
  }

  if (mode === "empty") {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven’t added anything yet. Explore the shop for protein, stacks, and recovery essentials."
      >
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </EmptyState>
    )
  }

  if (!cart || mode !== "ready") {
    return null
  }

  const discount = Number(cart.discountAmount)
  const hasDiscount = discount > 0

  return (
    <main
      className={cn(
        "relative isolate mx-auto min-h-svh w-full max-w-6xl overflow-hidden px-4 py-6 text-foreground sm:px-6 sm:py-8 lg:px-10 lg:py-12",
        MOBILE_TAB_BAR_BOTTOM,
      )}
    >
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/"
          className="rounded-full px-2.5 py-1 transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          Home
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-50" />
        <Link
          href="/shop"
          className="rounded-full px-2.5 py-1 transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          Shop
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-50" />
        <span className="line-clamp-1 rounded-full border border-border/50 bg-card/80 px-3 py-1 text-foreground shadow-none">
          Cart
        </span>
      </nav>

      <header className="mb-10 flex flex-col gap-4 border-b border-border/50 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700/85 dark:text-cyan-400/75">
            Shopping bag
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your cart
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"} · Review quantities before checkout.
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit shrink-0 rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
        <ul className="space-y-4">
          {cart.items.map((item) => (
            <CartLineRow
              key={item.id}
              item={item}
              busyId={busyId}
              onSetQty={setQty}
              onRemove={remove}
            />
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-none backdrop-blur-sm">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Order summary</h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatInr(cart.subtotalAmount)}
                </span>
              </div>
              {hasDiscount ? (
                <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span className="font-medium tabular-nums">−{formatInr(cart.discountAmount)}</span>
                </div>
              ) : null}
              <div className="border-t border-border/50 pt-3" />
              <div className="flex justify-between gap-4 text-base font-bold">
                <span>Total</span>
                <span className="tabular-nums text-foreground">{formatInr(cart.totalAmount)}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Taxes and shipping are estimated at checkout. Prices in {cart.currency}.
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              className="mt-6 h-12 w-full rounded-2xl text-base font-semibold shadow-none"
              onClick={() =>
                toast.message("Checkout", {
                  description: "Payments and shipping will be available in a future update.",
                })
              }
            >
              Proceed to checkout
            </Button>

            <div className="mt-6 space-y-3 border-t border-border/50 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Truck className="size-5 shrink-0 text-cyan-600/80 dark:text-cyan-400/80" />
                Fast delivery across India
              </div>
              <div className="flex items-center gap-3">
                <Package className="size-5 shrink-0 text-cyan-600/80 dark:text-cyan-400/80" />
                Genuine products, packed with care
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
