"use client"

import * as React from "react"
import { House, LogOut, ChevronDown, ShoppingCart, Store, User } from "lucide-react"
import { Magic } from "magic-sdk"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { SearchBar } from "@/app/components/Common/SearchBar"
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth-storage"
import {
  fetchAuthUser,
  fetchCart,
  getMe,
  getShopFilters,
  logoutSession,
  refreshSession,
  verifyDid,
} from "@/lib/api"
import { Button } from "@/app/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/app/components/ui/navigation-menu"
import { InputField } from "@/app/components/Common/InputField"
import { cn } from "@/lib/utils"

const HIDE_NAVBAR_CLASS = "image-viewer-open"

const shopSubmenuLinkClass =
  "block rounded-md px-2 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-muted/70 hover:text-foreground sm:text-sm"

const shopSubmenuSectionTitleClass =
  "border-b border-border/50 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"

const navLinkClass =
  "inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"

function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)
  /** Avoid calling /auth/me + /auth/me profile on every poll (was tripping API rate limits). */
  const profileFetchedForToken = React.useRef<string | null>(null)

  const checkLoginStatus = React.useCallback(async () => {
    const token = getAccessToken()

    try {
      const isValidSession = await getMe(token)
      if (isValidSession) {
        setIsLoggedIn(true)
        const active = getAccessToken()
        if (!active) {
          profileFetchedForToken.current = null
          setIsAdmin(false)
          return
        }
        if (active !== profileFetchedForToken.current) {
          profileFetchedForToken.current = active
          const user = await fetchAuthUser(active)
          setIsAdmin(user?.role === "ADMIN")
        }
        return
      }

      const rotatedToken = await refreshSession()
      if (rotatedToken) {
        setAccessToken(rotatedToken)
        profileFetchedForToken.current = rotatedToken
        setIsLoggedIn(true)
        const user = await fetchAuthUser(rotatedToken)
        setIsAdmin(user?.role === "ADMIN")
        return
      }

      clearAccessToken()
      profileFetchedForToken.current = null
      setIsLoggedIn(false)
      setIsAdmin(false)
    } catch {
      profileFetchedForToken.current = null
      setIsLoggedIn(false)
      setIsAdmin(false)
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
      profileFetchedForToken.current = accessToken
    }
    setIsLoggedIn(true)
    if (accessToken) {
      void fetchAuthUser(accessToken).then((u) => setIsAdmin(u?.role === "ADMIN"))
    }
  }, [])

  return { isLoggedIn, isAdmin, onLoginSuccess }
}

export function Navbar() {
  const router = useRouter()
  const magicRef = React.useRef<Magic | null>(null)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [signingOut, setSigningOut] = React.useState(false)
  const [isNavbarHidden, setIsNavbarHidden] = React.useState(false)
  const [cartItemCountWhenLoggedIn, setCartItemCountWhenLoggedIn] = React.useState(0)
  const { isLoggedIn, isAdmin, onLoginSuccess } = useAuthStatus()
  const cartItemCount = isLoggedIn ? cartItemCountWhenLoggedIn : 0

  const [shopBrands, setShopBrands] = React.useState<{ slug: string; name: string }[]>([])
  const [shopCategories, setShopCategories] = React.useState<{ slug: string; name: string }[]>([])

  React.useEffect(() => {
    void getShopFilters()
      .then((f) => {
        setShopBrands([...f.brands].sort((a, b) => a.name.localeCompare(b.name)))
        setShopCategories([...f.categories].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch(() => {
        setShopBrands([])
        setShopCategories([])
      })
  }, [])

  const handleSignOut = React.useCallback(async () => {
    setSigningOut(true)
    try {
      await logoutSession()
    } finally {
      clearAccessToken()
      window.dispatchEvent(new Event("auth:force-check"))
      window.dispatchEvent(new Event("cart:updated"))
      toast.success("Signed out.")
      router.push("/")
      setSigningOut(false)
    }
  }, [router])

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
            <NavigationMenuItem>
              <Link href="/" className={navLinkClass}>
                Home
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem className="group/shop-nav relative">
              <Link href="/shop" className={cn(navLinkClass, "lg:hidden")}>
                Shop
              </Link>
              <div className="relative hidden lg:block">
                <Link
                  href="/shop"
                  className={cn(navLinkClass, "inline-flex items-center gap-1")}
                >
                  Shop
                  <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
                </Link>
                <div
                  className={cn(
                    "absolute left-0 top-full z-50 mt-1 -ml-36 w-max max-w-[min(56rem,calc(100vw-1.5rem))] min-w-[min(42rem,calc(100vw-1.5rem))] pt-1",
                    "pointer-events-none opacity-0 transition-[opacity,transform] duration-150 ease-out",
                    "invisible translate-y-0.5",
                    "group-hover/shop-nav:pointer-events-auto group-hover/shop-nav:visible group-hover/shop-nav:opacity-100 group-hover/shop-nav:translate-y-0",
                  )}
                >
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card text-card-foreground shadow-xl ring-1 ring-border/25 backdrop-blur-md">
                    <div className="border-b border-border/50 bg-muted/15 px-3 py-2.5">
                      <Link
                        href="/shop"
                        className={cn(
                          shopSubmenuLinkClass,
                          "bg-transparent px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-muted/50",
                        )}
                      >
                        All products
                      </Link>
                    </div>
                    <div className="grid max-h-[min(58vh,22rem)] grid-cols-3 divide-x divide-border/50 bg-muted/10">
                      <div className="flex min-h-0 min-w-0 flex-col gap-2 p-3">
                        <p className={shopSubmenuSectionTitleClass}>Collections</p>
                        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
                          <Link href="/shop?bestseller=1" className={shopSubmenuLinkClass}>
                            Shop bestsellers
                          </Link>
                          <Link href="/shop?featured=1" className={shopSubmenuLinkClass}>
                            Shop featured
                          </Link>
                          <Link href="/shop?deal=1" className={shopSubmenuLinkClass}>
                            Shop deal of the day
                          </Link>
                          <Link href="/shop?combo=1" className={shopSubmenuLinkClass}>
                            Shop stacks
                          </Link>
                        </div>
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-col gap-2 p-3">
                        <p className={shopSubmenuSectionTitleClass}>Shop by brand</p>
                        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
                          {shopBrands.map((b) => (
                            <Link
                              key={b.slug}
                              href={`/shop?brand=${encodeURIComponent(b.slug)}`}
                              className={shopSubmenuLinkClass}
                            >
                              {b.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-col gap-2 p-3">
                        <p className={shopSubmenuSectionTitleClass}>Shop by category</p>
                        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
                          {shopCategories.map((c) => (
                            <Link
                              key={c.slug}
                              href={`/shop?category=${encodeURIComponent(c.slug)}`}
                              className={shopSubmenuLinkClass}
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/contact" className={navLinkClass}>
                Contact
              </Link>
            </NavigationMenuItem>
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
            {isLoggedIn && isAdmin ? (
              <NavigationMenuItem>
                <Link
                  href="/admin"
                  className="inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  Admin
                </Link>
              </NavigationMenuItem>
            ) : null}
            {isLoggedIn ? (
              <>
                <NavigationMenuItem>
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="rounded-md border-border/60"
                    aria-label="Account"
                  >
                    <Link href="/account">
                      <User className="size-4" />
                    </Link>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="h-9 cursor-pointer"
                    disabled={signingOut}
                    onClick={() => void handleSignOut()}
                  >
                    <LogOut className="size-3.5" />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </Button>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem>
                <Button asChild size="lg" variant="default" className="cursor-pointer rounded-md px-5 shadow-none">
                  <button type="button" onClick={openLoginDialog}>
                    Login
                  </button>
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/85 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex w-full max-w-360 items-center justify-between gap-0.5 px-1 py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:justify-around sm:gap-0 sm:px-2">
          <Link
            href="/"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[10px] font-medium text-foreground sm:flex-none sm:px-2 sm:text-[11px]"
          >
            <House className="size-4 shrink-0" />
            <span className="truncate">Home</span>
          </Link>
          <Link
            href="/shop"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[10px] font-medium text-muted-foreground sm:flex-none sm:px-2 sm:text-[11px]"
          >
            <Store className="size-4 shrink-0" />
            <span className="truncate">Shop</span>
          </Link>
          <Link
            href="/cart"
            className="relative flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[10px] font-medium text-muted-foreground sm:flex-none sm:px-2 sm:text-[11px]"
          >
            <ShoppingCart className="size-4 shrink-0" />
            <span className="truncate">Cart</span>
            {cartItemCount > 0 ? (
              <span className="absolute right-0.5 top-0 inline-flex min-w-4 items-center justify-center rounded-sm bg-primary px-1 text-[9px] font-semibold text-primary-foreground sm:right-1">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/account"
                className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[10px] font-medium text-muted-foreground sm:flex-none sm:px-2 sm:text-[11px]"
              >
                <User className="size-4 shrink-0" />
                <span className="truncate">Account</span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={signingOut}
                onClick={() => void handleSignOut()}
                className="h-auto min-h-0 min-w-0 flex-1 flex-col gap-1 rounded-lg px-1 py-1 text-[10px] font-medium whitespace-normal text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground sm:h-auto sm:flex-none sm:px-2 sm:text-[11px]"
              >
                <LogOut className="size-4 shrink-0" />
                <span className="truncate">{signingOut ? "…" : "Sign out"}</span>
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={openLoginDialog}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[10px] font-medium text-muted-foreground sm:flex-none sm:px-2 sm:text-[11px]"
            >
              <User className="size-4 shrink-0" />
              <span className="truncate">Login</span>
            </button>
          )}
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
