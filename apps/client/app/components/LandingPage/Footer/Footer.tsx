import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  FileText,
  Mail,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react"

import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"

import { GlowHero } from "./GlowHero"

const fssaiLicenseNo = process.env.NEXT_PUBLIC_FSSAI_LICENSE_NO?.trim()
const gstNo = process.env.NEXT_PUBLIC_GST_NO?.trim()

const CONTACT_EMAIL = "support@genonenutrition.in"
const CONTACT_PHONE = "+91 92895 11600"
const CONTACT_PHONE_TEL = "tel:+919289511600"
const INSTAGRAM_URL =
  "https://www.instagram.com/_muscle_essentials_?igsh=MTRkbXozOGMzZmplcQ%3D%3D&utm_source=qr"

const linkColumns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/shop", label: "Shop all" },
      { href: "/#deal-of-the-day", label: "Deals" },
      { href: "/#bestsellers", label: "Bestsellers" },
      { href: "/#featured", label: "Featured" },
      { href: "/#categories", label: "Categories" },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: "/shop/protein", label: "Protein" },
      { href: "/shop/creatine", label: "Creatine" },
      { href: "/shop/pre-workout", label: "Pre-workout" },
      { href: "/shop/gainers", label: "Gainers" },
      { href: "/shop/vitamins", label: "Vitamins" },
      { href: "/shop/combos", label: "Combos" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/#faq", label: "FAQ" },
      { href: "/#testimonials", label: "Reviews" },
      { href: "/account", label: "My account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/cookies", label: "Cookies" },
      { href: "/legal/policy", label: "Delivery & Returns" },
    ],
  },
]

const trustHighlights = [
  { icon: PackageCheck, label: "Genuine supplements" },
  { icon: Truck, label: "Pan-India delivery" },
  { icon: ShieldCheck, label: "FSSAI compliant" },
] as const

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  )
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <ul className="mt-4 space-y-2.5">
        {links.map((item) => (
          <li key={`${title}-${item.href}-${item.label}`}>
            <Link
              href={item.href}
              className="group inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="border-b border-transparent transition-colors group-hover:border-foreground/30">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  )
}

function SocialButton({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl border border-border/40 bg-background/60 text-muted-foreground shadow-sm",
        "transition-all hover:border-border/60 hover:bg-background hover:text-foreground hover:shadow-glass",
      )}
    >
      {children}
    </a>
  )
}

export const Footer = () => {
  const year = new Date().getFullYear()
  const legalLinks = linkColumns.find((c) => c.title === "Legal")?.links ?? []

  return (
    <footer className="relative overflow-x-clip border-t border-border/30 bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(156,212,0,0.10),transparent)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(156,212,0,0.10),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-360 px-4 pt-16 sm:px-6 lg:px-10 lg:pt-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20 xl:gap-28">
          <div className="lg:max-w-sm lg:shrink-0">
            <Link href="/" className="inline-flex transition-opacity hover:opacity-85">
              <Image
                src="/logo-light.png"
                alt="GEN1"
                width={160}
                height={48}
                className="h-16 w-auto object-contain dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="GEN1"
                width={160}
                height={48}
                className="hidden h-16 w-auto object-contain dark:block"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Curated protein, pre-workout, and recovery essentials — tested, vetted, and shipped
              with care across India.
            </p>

            <ul className="mt-6 space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-card/70 text-foreground/80 shadow-sm">
                    <Mail className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 break-all underline-offset-4 group-hover:underline">
                    {CONTACT_EMAIL}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={CONTACT_PHONE_TEL}
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-card/70 text-foreground/80 shadow-sm">
                    <Phone className="size-4" aria-hidden />
                  </span>
                  <span className="tabular-nums underline-offset-4 group-hover:underline">
                    {CONTACT_PHONE}
                  </span>
                </a>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <SocialButton href={INSTAGRAM_URL} label="Instagram">
                <InstagramIcon className="size-4" />
              </SocialButton>
              <SocialButton href={`mailto:${CONTACT_EMAIL}`} label="Email">
                <Mail className="size-4" />
              </SocialButton>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-full shadow-sm">
                <Link href="/shop">Shop now</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {linkColumns.map((col) => (
              <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>

        <ul className="mt-12 flex flex-wrap gap-2.5 sm:gap-3">
          {trustHighlights.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/50 px-3.5 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm"
            >
              <Icon className="size-3.5 shrink-0 text-primary/80" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <section
          className="mt-8 overflow-hidden rounded-2xl border border-border/30 bg-card/60 shadow-sm backdrop-blur-sm"
          aria-labelledby="compliance-footer-heading"
        >
          <div className="border-b border-border/30 bg-muted/10 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary dark:text-primary">
                <ShieldCheck className="size-5" aria-hidden />
              </span>
              <div>
                <SectionLabel>Compliance</SectionLabel>
                <h3
                  id="compliance-footer-heading"
                  className="mt-0.5 text-base font-semibold tracking-tight text-foreground"
                >
                  Business Compliance
                </h3>
              </div>
            </div>
          </div>
          <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              <abbr title="Food Safety and Standards Authority of India" className="no-underline">
                FSSAI
              </abbr>{" "}
              regulates food safety in India. GEN1 sells supplements in line with
              applicable FSSAI requirements. GEN 1 Nutrition is a GST-registered business.
            </p>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 px-4 py-3">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" aria-hidden />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">FSSAI Licence Number</dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {fssaiLicenseNo ? (
                      <span className="font-mono tabular-nums">{fssaiLicenseNo}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        On product labels & invoices —{" "}
                        <a
                          href={`mailto:${CONTACT_EMAIL}?subject=FSSAI%20licence%20details`}
                          className="text-foreground underline-offset-4 hover:underline"
                        >
                          request by email
                        </a>
                      </span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 px-4 py-3">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" aria-hidden />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">GSTIN</dt>
                  <dd className="mt-0.5 font-mono tabular-nums font-medium text-foreground">
                    {gstNo ?? "N/A"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-b border-border/30 pb-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            © {year} GEN1. All rights reserved.
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
            aria-label="Footer legal"
          >
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                <ArrowUpRight className="size-3 opacity-60" aria-hidden />
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <GlowHero />
    </footer>
  )
}
