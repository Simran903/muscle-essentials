"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"

import {
  adminListBrands,
  adminListCategories,
  adminListOrders,
  adminListProducts,
  adminListReviews,
  adminListUsers,
  toAdminError,
} from "@/lib/admin-api"

import { adminCard } from "./admin-styles"

export default function AdminHomePage() {
  const [counts, setCounts] = React.useState<{
    products: number
    brands: number
    categories: number
    orders: number
    users: number
    reviews: number
  } | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [p, b, c, o, u, r] = await Promise.all([
          adminListProducts(1, 1),
          adminListBrands(1, 1),
          adminListCategories(1, 1),
          adminListOrders(1, 1),
          adminListUsers(1, 1),
          adminListReviews(1, 1),
        ])
        if (cancelled) return
        setCounts({
          products: p.pagination.total,
          brands: b.pagination.total,
          categories: c.pagination.total,
          orders: o.pagination.total,
          users: u.pagination.total,
          reviews: r.pagination.total,
        })
      } catch (e) {
        if (!cancelled) toast.error(toAdminError(e, "Could not load stats.").message)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const tiles = [
    { label: "Products", value: counts?.products, href: "/admin/products" },
    { label: "Brands", value: counts?.brands, href: "/admin/brands" },
    { label: "Categories", value: counts?.categories, href: "/admin/categories" },
    { label: "Orders", value: counts?.orders, href: "/admin/orders" },
    { label: "Users", value: counts?.users, href: "/admin/users" },
    { label: "Reviews", value: counts?.reviews, href: "/admin/reviews" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage catalog, orders, and moderation from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`${adminCard} transition-colors hover:border-border hover:bg-muted/15`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
              {t.value === undefined ? "—" : t.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
