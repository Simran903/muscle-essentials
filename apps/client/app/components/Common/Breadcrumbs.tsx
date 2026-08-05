"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

import { cn } from "@/lib/utils"

const SEGMENT_LABELS: Record<string, string> = {
  shop: "Shop",
  about: "About",
  contact: "Contact",
  cart: "Cart",
  account: "Account",
  orders: "Orders",
  admin: "Admin",
  products: "Products",
  brands: "Brands",
  categories: "Categories",
  users: "Users",
  reviews: "Reviews",
  cookies: "Cookie Policy",
  legal: "Legal",
  policy: "Delivery & Returns",
  new: "New product",
}

/** Full paths that resolve to an actual page and can be linked from a breadcrumb. */
const LINKABLE_PATHS = new Set([
  "/",
  "/shop",
  "/about",
  "/contact",
  "/cart",
  "/account",
  "/account/orders",
  "/admin",
  "/admin/products",
  "/admin/brands",
  "/admin/categories",
  "/admin/orders",
  "/admin/users",
  "/admin/reviews",
])

function humanize(segment: string): string {
  const mapped = SEGMENT_LABELS[segment]
  if (mapped) return mapped
  return segment
    .split("-")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ")
}

export type BreadcrumbsProps = {
  className?: string
  /** Replaces the auto-generated label of the current (deepest) crumb. */
  currentLabel?: string
}

export function Breadcrumbs({ className, currentLabel }: BreadcrumbsProps) {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)

  const crumbs: { label: string; href?: string }[] = []
  let href = ""
  for (let i = 0; i < parts.length; i++) {
    href += `/${parts[i]}`
    const isLast = i === parts.length - 1
    crumbs.push({
      href: isLast ? undefined : href,
      label: isLast && currentLabel ? currentLabel : humanize(parts[i]),
    })
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-6 flex items-center gap-1.5 overflow-x-auto text-sm text-muted-foreground",
        className,
      )}
    >
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md transition-colors hover:text-foreground"
      >
        <Home className="size-3.5" aria-hidden />
        <span>Home</span>
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.label} className="flex shrink-0 items-center gap-1.5">
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          {crumb.href && LINKABLE_PATHS.has(crumb.href) ? (
            <Link href={crumb.href} className="rounded-md transition-colors hover:text-foreground">
              {crumb.label}
            </Link>
          ) : (
            <span aria-current="page" className="font-medium text-foreground">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
