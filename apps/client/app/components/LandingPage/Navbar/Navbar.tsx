"use client"

import * as React from "react"
import { House, ShoppingCart, Store, User } from "lucide-react"
import { Magic } from "magic-sdk"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

import { SearchBar } from "@/app/components/Common/SearchBar"
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth-storage"
import { fetchCart, getMe, refreshSession, verifyDid } from "@/lib/api"
import { Button } from "@/app/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/app/components/ui/navigation-menu"
import { InputField } from "@/app/components/Common/InputField"

const HIDE_NAVBAR_CLASS = "image-viewer-open"

function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  const checkLoginStatus = React.useCallback(async () => {
    const token = getAccessToken()

    try {
      const isValidSession = await getMe(token)
      if (isValidSession) {
        setIsLoggedIn(true)
        return
      }

      const rotatedToken = await refreshSession()
      if (rotatedToken) {
        setAccessToken(rotatedToken)
        setIsLoggedIn(true)
        return
      }

      clearAccessToken()
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
      setAccessToken(accessToken)
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
  const [isNavbarHidden, setIsNavbarHidden] = React.useState(false)
  const [cartItemCountWhenLoggedIn, setCartItemCountWhenLoggedIn] = React.useState(0)
  const { isLoggedIn, onLoginSuccess } = useAuthStatus()
  const cartItemCount = isLoggedIn ? cartItemCountWhenLoggedIn : 0

  React.useEffect(() => {
    if (!isLoggedIn) {
      return
    }
    const loadCount = async () => {
      const token = getAccessToken()
      if (!token) return
      try {
        const cart = await fetchCart(token)
        const n = cart.items.reduce((sum, line) => sum + line.quantity, 0)
        setCartItemCountWhenLoggedIn(n)
      } catch {
        setCartItemCountWhenLoggedIn(0)
      }
    }
    void loadCount()
    const onCartUpdated = () => {
      void loadCount()
    }
    window.addEventListener("cart:updated", onCartUpdated)
    return () => window.removeEventListener("cart:updated", onCartUpdated)
  }, [isLoggedIn])

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

  React.useEffect(() => {
    const updateVisibility = () => {
      setIsNavbarHidden(document.body.classList.contains(HIDE_NAVBAR_CLASS))
    }

    updateVisibility()

    const observer = new MutationObserver(updateVisibility)
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect()
  }, [])

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

  if (isNavbarHidden) {
    return null
  }

  return (
    <>
      <header className="sticky top-0 z-50 hidden border-b border-border/40 bg-background/75 backdrop-blur-xl supports-backdrop-filter:bg-background/65 md:block">
        <NavigationMenu className="mx-auto flex w-full max-w-360 items-center justify-between px-5 py-3 lg:px-8">
          <Link
            href="/"
            className="flex items-center text-lg font-medium tracking-tight text-foreground"
          >
            <Image
              src="/logo-new.png"
              alt="Muscle Essentials"
              width={200}
              height={200}
              priority
              className="h-11 w-auto object-contain"
            />
          </Link>

          <SearchBar className="mx-4 hidden w-full max-w-md md:block" />

          <NavigationMenuList className="gap-2">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                >
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <Button asChild variant="outline" size="icon" className="relative rounded-md border-border/60" aria-label="Cart">
                <Link href="/cart">
                  <ShoppingCart className="size-4" />
                  {cartItemCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-sm bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
            </NavigationMenuItem>
            {!isLoggedIn ? (
              <NavigationMenuItem>
                <Button asChild size="lg" variant="default" className="cursor-pointer rounded-md px-5 shadow-none">
                  <button type="button" onClick={openLoginDialog}>
                    Login
                  </button>
                </Button>
              </NavigationMenuItem>
            ) : null}
          </NavigationMenuList>
        </NavigationMenu>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/85 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex w-full max-w-360 items-center justify-around px-2 py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <Link href="/" className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-foreground">
            <House className="size-4" />
            Home
          </Link>
          <Link href="/shop" className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <Store className="size-4" />
            Shop
          </Link>
          <Link
            href="/cart"
            className="relative flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground"
          >
            <ShoppingCart className="size-4" />
            Cart
            {cartItemCount > 0 ? (
              <span className="absolute right-1 top-0 inline-flex min-w-4 items-center justify-center rounded-sm bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
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
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border/60 bg-card/95 p-7 shadow-xl backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Login</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Enter your email and phone to verify your account.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                
                <InputField
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email"
                />
              </div>

              <div className="space-y-2">
                <InputField
                id="login-phone"
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="phone"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeLoginDialog} disabled={isSubmitting} className="cursor-pointer rounded-md">
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="cursor-pointer rounded-md px-5 shadow-none" disabled={isSubmitting}>
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
