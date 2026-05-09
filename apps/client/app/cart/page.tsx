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
        "flex gap-4 rounded-3xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5",
        inactive && "opacity-80",
      )}
    >
      <Link
        href={`/shop/${item.product.slug}`}
        className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 sm:size-28"
        aria-label={`View ${item.product.title}`}
      >
        {thumbUrl ? (
          <Image
            src={thumbUrl}
            alt={thumbAlt}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-cover"
          />
        ) : (
          <Package className="size-10 text-muted-foreground/70 sm:size-12" strokeWidth={1.25} aria-hidden />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            href={`/shop/${item.product.slug}`}
            className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            {item.product.title}
          </Link>
          {item.selectedFlavourLabel !== "" || item.selectedSizeLabel !== "" ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {item.selectedFlavourLabel !== "" ? (
                <span className="inline-flex items-center rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-900 dark:text-cyan-100">
                  Flavour: {item.selectedFlavourLabel}
                </span>
              ) : null}
              {item.selectedSizeLabel !== "" ? (
                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground">
                  Size: {item.selectedSizeLabel}
                </span>
              ) : null}
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground mt-2">
            {formatInr(item.unitPrice)} each
            {inactive ? (
              <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                Unavailable
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:justify-end">
          <div className="flex h-11 items-center rounded-2xl border border-border bg-background/90 px-0.5 dark:bg-muted/40">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-xl"
              disabled={isBusy || inactive || item.quantity <= 1}
              onClick={() => onSetQty(item, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </Button>
            <span className="min-w-[2.5ch] px-2 text-center text-sm font-bold tabular-nums text-foreground">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-xl"
              disabled={isBusy || inactive || item.quantity >= maxQty}
              onClick={() => onSetQty(item, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <p className="min-w-22 text-right text-lg font-bold tabular-nums text-foreground sm:text-xl">
            {formatInr(item.lineTotal)}
          </p>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isBusy}
            onClick={() => onRemove(item.id)}
            aria-label="Remove from cart"
          >
            <Trash2 className="size-4" />
          </Button>
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
    <main className="relative isolate mx-auto flex min-h-[calc(100svh-5rem)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
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
      <main className="relative isolate mx-auto min-h-svh w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-3xl lg:sticky lg:top-24" />
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
    <main className="relative isolate mx-auto min-h-svh w-full max-w-7xl overflow-hidden px-4 py-6 text-foreground sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/"
          className="rounded-full px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
        >
          Home
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-70" />
        <Link
          href="/shop"
          className="rounded-full px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
        >
          Shop
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-70" />
        <span className="line-clamp-1 rounded-full border border-border bg-card px-2 py-1 text-foreground shadow-sm">
          Cart
        </span>
      </nav>

      <header className="mb-8 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
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
          <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
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
              <div className="border-t border-border pt-3" />
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
              className="mt-6 h-12 w-full rounded-2xl text-base font-semibold"
              onClick={() =>
                toast.message("Checkout", {
                  description: "Payments and shipping will be available in a future update.",
                })
              }
            >
              Proceed to checkout
            </Button>

            <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Truck className="size-5 shrink-0 text-cyan-500" />
                Fast delivery across India
              </div>
              <div className="flex items-center gap-3">
                <Package className="size-5 shrink-0 text-cyan-500" />
                Genuine products, packed with care
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
