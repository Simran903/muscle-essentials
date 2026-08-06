"use client"

import * as React from "react"
import {
  BadgePercent,
  ChevronDown,
  Headphones,
  House,
  Info,
  LayoutGrid,
  LogOut,
  Menu,
  ShoppingCart,
  Store,
  Tags,
  User,
} from "lucide-react"
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/app/components/ui/navigation-menu"
import { InputField } from "@/app/components/Common/InputField"
import { cn } from "@/lib/utils"

const HIDE_NAVBAR_CLASS = "image-viewer-open"

const navLinkClass =
  "inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"

function MobileMenuLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon?: typeof Store
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
      >
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        {label}
      </Link>
    </SheetClose>
  )
}

function MobileMenuGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof Store
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
      >
        <span className="flex items-center gap-3">
          <Icon className="size-4 shrink-0" />
          {label}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="mt-0.5 ml-9 flex flex-col border-l border-border/40 pl-3">
          {children}
        </div>
      ) : null}
    </div>
  )
}

function MobileMenuSubLink({ href, label }: { href: string; label: string }) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
      </Link>
    </SheetClose>
  )
}

function MobileMenuSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
      {children}
    </p>
  )
}

function BottomNavLink({
  href,
  label,
  icon: Icon,
  badge,
}: {
  href: string
  label: string
  icon: typeof Store
  badge?: number
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex min-w-0 flex-1 flex-col items-center gap-1 px-1.5 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="relative">
        <Icon className="size-4 shrink-0" />
        {badge && badge > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground ring-2 ring-background">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

const bottomNavItems: { href: string; label: string; icon: typeof Store }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account", label: "Account", icon: User },
]

function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)
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

  React.useEffect(() => {
    const onOpenLogin = () => setIsLoginDialogOpen(true)
    window.addEventListener("auth:open-login", onOpenLogin)
    return () => window.removeEventListener("auth:open-login", onOpenLogin)
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
      <header className="sticky top-0 z-50 hidden border-b border-border/30 bg-background/70 backdrop-blur-2xl supports-backdrop-filter:bg-background/60 md:block">
        <NavigationMenu className="mx-auto flex w-full max-w-360 items-center justify-between px-5 py-3 lg:px-8">
          <Link
            href="/"
            className="flex items-center text-lg font-medium tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo-light.png"
              alt="GEN1 NUTRITION"
              width={200}
              height={200}
              priority
              className="h-14 w-auto object-contain dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              alt="GEN1 NUTRITION"
              width={200}
              height={200}
              priority
              className="hidden h-14 w-auto object-contain dark:block"
            />
          </Link>

          <SearchBar className="mx-4 hidden w-full max-w-md md:block" />

          <NavigationMenuList className="gap-1.5">
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
                  <ChevronDown className="size-3.5 shrink-0 opacity-60 transition-transform duration-200 group-hover/shop-nav:rotate-180" aria-hidden />
                </Link>
                <div
                  className={cn(
                    "absolute left-0 top-full z-50 mt-1.5 -ml-36 w-max max-w-[min(56rem,calc(100vw-1.5rem))] min-w-[min(42rem,calc(100vw-1.5rem))] pt-1",
                    "pointer-events-none opacity-0 transition-[opacity,transform] duration-200 ease-out",
                    "invisible translate-y-1",
                    "group-hover/shop-nav:pointer-events-auto group-hover/shop-nav:visible group-hover/shop-nav:opacity-100 group-hover/shop-nav:translate-y-0",
                  )}
                >
                  <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/95 text-card-foreground shadow-glass-lg ring-1 ring-border/20 backdrop-blur-xl">
                    <div className="border-b border-border/30 bg-muted/10 px-4 py-2.5">
                      <Link
                        href="/shop"
                        className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                      >
                        All products
                      </Link>
                    </div>
                    <div className="grid max-h-[min(58vh,22rem)] grid-cols-3 divide-x divide-border/30">
                      <div className="flex min-h-0 min-w-0 flex-col gap-2 p-4">
                        <p className="border-b border-border/30 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Collections</p>
                        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain">
                          <Link href="/shop?bestseller=1" className="block rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground">
                            Shop bestsellers
                          </Link>
                          <Link href="/shop?featured=1" className="block rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground">
                            Shop featured
                          </Link>
                          <Link href="/shop?deal=1" className="block rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground">
                            Shop deal of the day
                          </Link>
                          <Link href="/shop?combo=1" className="block rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground">
                            Shop stacks
                          </Link>
                        </div>
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-col gap-2 p-4">
                        <p className="border-b border-border/30 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Shop by brand</p>
                        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain">
                          {shopBrands.map((b) => (
                            <Link
                              key={b.slug}
                              href={`/shop?brand=${encodeURIComponent(b.slug)}`}
                              className="block rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
                            >
                              {b.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-col gap-2 p-4">
                        <p className="border-b border-border/30 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Shop by category</p>
                        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain">
                          {shopCategories.map((c) => (
                            <Link
                              key={c.slug}
                              href={`/shop?category=${encodeURIComponent(c.slug)}`}
                              className="block rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
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
              <Link href="/about" className={navLinkClass}>
                About
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/contact" className={navLinkClass}>
                Contact
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button asChild variant="outline" size="icon" className="relative rounded-xl border-border/60" aria-label="Cart">
                <Link href="/cart">
                  <ShoppingCart className="size-4" />
                  {cartItemCount > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
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
                  className="inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
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
                    className="rounded-xl border-border/60"
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
                    variant="ghost"
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
                <Button asChild size="lg" variant="default" className="cursor-pointer rounded-xl px-5 shadow-sm">
                  <button type="button" onClick={openLoginDialog}>
                    Login
                  </button>
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </header>

      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-2xl supports-backdrop-filter:bg-background/60 md:hidden">
        <div className="mx-auto flex w-full max-w-360 items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
            aria-label="GEN1 NUTRITION home"
          >
            <Image
              src="/logo-light.png"
              alt="GEN1 NUTRITION"
              width={160}
              height={48}
              priority
              className="h-10 w-auto object-contain dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              alt="GEN1 NUTRITION"
              width={160}
              height={48}
              priority
              className="hidden h-10 w-auto object-contain dark:block"
            />
          </Link>

          <div className="flex items-center gap-1.5">
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="relative rounded-xl"
              aria-label="Cart"
            >
              <Link href="/cart">
                <ShoppingCart className="size-5" />
                {cartItemCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground ring-2 ring-background">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                ) : null}
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] max-w-sm">
                <SheetHeader className="border-b border-border/30">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Mobile navigation menu for GEN1 NUTRITION
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
                  <MobileMenuSectionLabel>Shop</MobileMenuSectionLabel>
                  <div className="flex flex-col gap-1">
                    <MobileMenuLink href="/shop" label="Shop All" icon={Store} />
                    <MobileMenuGroup label="Brands" icon={Tags}>
                      {shopBrands.length > 0 ? (
                        shopBrands.map((b) => (
                          <MobileMenuSubLink
                            key={b.slug}
                            href={`/shop?brand=${encodeURIComponent(b.slug)}`}
                            label={b.name}
                          />
                        ))
                      ) : (
                        <MobileMenuSubLink href="/shop" label="Browse all products" />
                      )}
                    </MobileMenuGroup>
                    <MobileMenuGroup label="Collections" icon={LayoutGrid}>
                      <MobileMenuSubLink href="/shop?bestseller=1" label="Bestsellers" />
                      <MobileMenuSubLink href="/shop?featured=1" label="Featured" />
                      <MobileMenuSubLink href="/shop?combo=1" label="Stacks" />
                    </MobileMenuGroup>
                    <MobileMenuLink href="/shop?deal=1" label="Deals" icon={BadgePercent} />
                  </div>

                  <MobileMenuSectionLabel>Support</MobileMenuSectionLabel>
                  <div className="flex flex-col gap-1">
                    <MobileMenuLink href="/about" label="About" icon={Info} />
                    <MobileMenuLink href="/contact" label="Contact" icon={Headphones} />
                  </div>

                  {isLoggedIn ? (
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={signingOut}
                        onClick={() => void handleSignOut()}
                        className="mt-4 w-full justify-start rounded-xl text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                      >
                        <LogOut className="size-4" />
                        {signingOut ? "Signing out…" : "Logout"}
                      </Button>
                    </SheetClose>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/30 bg-background/80 backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex w-full max-w-360 items-stretch justify-around gap-0 px-1 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {bottomNavItems.map((item) => (
            <BottomNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              badge={item.label === "Cart" ? cartItemCount : undefined}
            />
          ))}
        </div>
      </nav>

      {isLoginDialogOpen ? (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close login dialog"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeLoginDialog}
          />
          <div className="relative z-10 w-full max-w-md animate-scale-in rounded-2xl border border-border/40 bg-card/95 p-8 shadow-glass-lg backdrop-blur-xl">
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
                  placeholder="Email address"
                />
              </div>

              <div className="space-y-2">
                <InputField
                  id="login-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeLoginDialog} disabled={isSubmitting} className="cursor-pointer rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="cursor-pointer rounded-xl px-5 shadow-sm" disabled={isSubmitting}>
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
