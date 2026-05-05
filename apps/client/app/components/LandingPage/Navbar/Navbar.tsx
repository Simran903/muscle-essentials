"use client"

import * as React from "react"
import { House, Search, ShoppingCart, Store, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/app/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/app/components/ui/navigation-menu"

export function Navbar() {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 hidden border-b border-border/70 bg-background/95 backdrop-blur md:block">
        <NavigationMenu className="mx-auto flex w-full max-w-360 items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center text-lg font-semibold tracking-tight text-foreground"
          >
            <Image
              src="/logo-new.png"
              alt="Muscle Essentials"
              width={200}
              height={200}
              priority
              className="h-16 w-auto object-contain"
            />
          </Link>

          <div className="mx-4 hidden w-full max-w-md md:block">
            <label htmlFor="navbar-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="navbar-search"
                type="search"
                placeholder="Search products, brands, goals..."
                className="h-10 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              />
            </div>
          </div>

          <NavigationMenuList className="gap-2">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <Button asChild variant="outline" size="icon" className="rounded-full" aria-label="Cart">
                <Link href="/cart">
                  <ShoppingCart className="size-4" />
                </Link>
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button asChild size="lg" className="rounded-full bg-[#F1C232] px-5 text-[#2d2a2a] hover:bg-[#dfb42f] dark:bg-[#F1C232] dark:text-[#2d2a2a] dark:hover:bg-[#dfb42f]">
                <Link href="/login">Login</Link>
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-360 items-center justify-around px-2 py-2">
          <Link href="/" className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-foreground">
            <House className="size-4" />
            Home
          </Link>
          <Link href="/shop" className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <Store className="size-4" />
            Shop
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <ShoppingCart className="size-4" />
            Cart
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <User className="size-4" />
            Login
          </Link>
        </div>
      </nav>
    </>
  )
}
