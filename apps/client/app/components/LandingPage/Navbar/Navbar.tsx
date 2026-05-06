"use client"

import * as React from "react"
import { House, ShoppingCart, Store, User } from "lucide-react"
import { Magic } from "magic-sdk"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

import { SearchBar } from "@/app/components/Common/SearchBar"
import { getMe, refreshSession, verifyDid } from "@/lib/api"
import { Button } from "@/app/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/app/components/ui/navigation-menu"

const ACCESS_TOKEN_STORAGE_KEY = "muscle-essentials-access-token"

function getStoredAccessToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

function setStoredAccessToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

function clearStoredAccessToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  const checkLoginStatus = React.useCallback(async () => {
    const token = getStoredAccessToken()

    try {
      const isValidSession = await getMe(token)
      if (isValidSession) {
        setIsLoggedIn(true)
        return
      }

      const rotatedToken = await refreshSession()
      if (rotatedToken) {
        setStoredAccessToken(rotatedToken)
        setIsLoggedIn(true)
        return
      }

      clearStoredAccessToken()
      setIsLoggedIn(false)
    } catch {
      setIsLoggedIn(false)
    }
  }, [])

  React.useEffect(() => {
    const runCheck = () => {
      void checkLoginStatus()
    }

    const initialCheckId = window.setTimeout(runCheck, 0)
    const intervalId = window.setInterval(runCheck, 5000)

    window.addEventListener("auth:force-check", runCheck)

    return () => {
      window.clearTimeout(initialCheckId)
      window.clearInterval(intervalId)
      window.removeEventListener("auth:force-check", runCheck)
    }
  }, [checkLoginStatus])

  const onLoginSuccess = React.useCallback((accessToken: string | null) => {
    if (accessToken) {
      setStoredAccessToken(accessToken)
    }
    setIsLoggedIn(true)
  }, [])

  return { isLoggedIn, onLoginSuccess }
}

export function Navbar() {
  const magicRef = React.useRef<Magic | null>(null)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { isLoggedIn, onLoginSuccess } = useAuthStatus()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/contact", label: "Contact" },
  ]

  const closeLoginDialog = React.useCallback(() => setIsLoginDialogOpen(false), [])
  const openLoginDialog = React.useCallback(() => setIsLoginDialogOpen(true), [])

  React.useEffect(() => {
    if (!isLoginDialogOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLoginDialog()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [closeLoginDialog, isLoginDialogOpen])

  const handleLoginSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setIsSubmitting(true)

      try {
        const trimmedEmail = email.trim()
        const trimmedPhone = phone.trim()
        if (!trimmedEmail || !trimmedPhone) {
          throw new Error("Email and phone are required.")
        }

        const publishableKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
        if (!publishableKey) {
          throw new Error("Magic publishable key is missing.")
        }

        if (!magicRef.current) {
          magicRef.current = new Magic(publishableKey)
        }

        const didToken = await magicRef.current.auth.loginWithMagicLink({
          email: trimmedEmail,
        })
        if (!didToken) {
          throw new Error("Unable to generate DID token. Please try again.")
        }

        const accessToken = await verifyDid({
          didToken,
          email: trimmedEmail,
          phone: trimmedPhone,
        })

        onLoginSuccess(accessToken)
        toast.success("Login SuccessFull")
        closeLoginDialog()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [closeLoginDialog, email, onLoginSuccess, phone]
  )

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

          <SearchBar className="mx-4 hidden w-full max-w-md md:block" />

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
            {!isLoggedIn ? (
              <NavigationMenuItem>
                <Button asChild size="lg" className="rounded-full bg-[#F1C232] px-5 text-[#2d2a2a] hover:bg-[#dfb42f] dark:bg-[#F1C232] dark:text-[#2d2a2a] dark:hover:bg-[#dfb42f]">
                  <button type="button" onClick={openLoginDialog}>
                    Login
                  </button>
                </Button>
              </NavigationMenuItem>
            ) : null}
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
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={openLoginDialog}
              className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground"
            >
              <User className="size-4" />
              Login
            </button>
          ) : null}
        </div>
      </nav>

      {isLoginDialogOpen ? (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close login dialog"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={closeLoginDialog}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-foreground">Login</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email and phone to verify your account.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="login-phone" className="text-sm font-medium text-foreground">
                  Phone
                </label>
                <input
                  id="login-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeLoginDialog} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#F1C232] text-[#2d2a2a] hover:bg-[#dfb42f]" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
