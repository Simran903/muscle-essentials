import Image from "next/image"
import Link from "next/link"
import { GlowHero } from "./GlowHero"

const fssaiLicenseNo = process.env.NEXT_PUBLIC_FSSAI_LICENSE_NO?.trim()

const linkColumns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Pages",
    links: [
      { href: "/", label: "Home" },
      { href: "/shop", label: "Shop" },
      { href: "/#deal-of-the-day", label: "Deals" },
      { href: "/#bestsellers", label: "Bestsellers" },
      { href: "/#featured", label: "Featured" },
      { href: "/#categories", label: "Categories" },
      { href: "/#brands", label: "Brands" },
      { href: "/#faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/cookies", label: "Cookie Policy" },
      { href: "/legal/refunds", label: "Refund Policy" },
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
      { href: "/shop/recovery", label: "Recovery" },
      { href: "/shop/combos", label: "Combos" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/#faq", label: "Help & FAQ" },
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/#testimonials", label: "Reviews" },
    ],
  },
]

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <h3 className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-cyan-700/80 dark:text-cyan-400/70">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((item) => (
          <li key={`${title}-${item.href}-${item.label}`}>
            <Link
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-cyan-700 dark:hover:text-cyan-300"
            >
              {item.label}
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

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border/50 bg-muted/20 text-foreground dark:bg-background">
      <div className="relative z-10 mx-auto w-full max-w-360 px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-12">
          {linkColumns.map((col) => (
            <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
          ))}

          <div className="col-span-2 sm:col-span-3 lg:col-span-1 lg:col-start-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo-new.png"
                alt="Muscle Essentials Logo"
                width={48}
                height={48}
                className="h-10 w-28 object-contain dark:brightness-0 dark:invert"
              />
            </Link>
            
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://www.instagram.com/_muscle_essentials_?igsh=MTRkbXozOGMzZmplcQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Instagram"
              >
                <InstagramIcon className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <section
          className="mt-12 rounded-xl border border-border/60 bg-background/60 px-4 py-6 sm:px-6"
          aria-labelledby="fssai-footer-heading"
        >
          <h3
            id="fssai-footer-heading"
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-cyan-700/80 dark:text-cyan-400/70"
          >
            FSSAI details
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <abbr title="Food Safety and Standards Authority of India" className="no-underline">
              FSSAI
            </abbr>{" "}
            (Food Safety and Standards Authority of India) regulates food safety in India. Muscle
            Essentials sells food and supplement products in compliance with applicable FSSAI
            rules.
          </p>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-foreground">FSSAI licence no.</dt>
              <dd className="mt-1 text-muted-foreground">
                {fssaiLicenseNo ? (
                  <span className="font-mono tabular-nums">{fssaiLicenseNo}</span>
                ) : (
                  <>
                    Available on product labels and invoices. For a copy,{" "}
                    <a
                      href="mailto:essentialsmuscle@gmail.com?subject=FSSAI%20licence%20details"
                      className="text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-400"
                    >
                      email us
                    </a>
                    .
                  </>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Muscle Essentials. All rights reserved.
        </p>
        <hr className="my-10 border-border/50" />


      </div>
      <GlowHero />
    </footer>
  )
}
