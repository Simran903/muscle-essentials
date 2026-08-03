import type { Metadata } from "next"
import Link from "next/link"
import { Cookie, ShieldCheck } from "lucide-react"

import { COOKIE_CONSENT_LEGACY_NAME, COOKIE_CONSENT_NAME } from "@/lib/cookie-consent"
import { AccountBackground } from "@/app/components/Account/AccountBackground"
import { pageMainClassName } from "@/lib/page-layout"

export const metadata: Metadata = {
  title: "Cookie Policy · GEN1",
  description:
    "How GEN1 uses cookies and similar technologies on our website.",
}

const CONTACT_EMAIL = "support@genonenutrition.in"

const cookieRows = [
  {
    name: COOKIE_CONSENT_NAME,
    kind: "Cookie",
    purpose: "Remembers whether you accepted or declined optional cookies.",
    duration: "365 days",
  },
  {
    name: COOKIE_CONSENT_LEGACY_NAME,
    kind: "Cookie",
    purpose: "Fallback consent cookie for older browsers.",
    duration: "365 days",
  },
  {
    name: "Refresh session",
    kind: "HttpOnly cookie",
    purpose: "Keeps you signed in securely when you use your account.",
    duration: "Until logout or expiry",
  },
] as const

const storageRows = [
  {
    name: "muscle-essentials-access-token",
    kind: "localStorage",
    purpose: "Stores your sign-in session on this device.",
    duration: "Until you sign out",
  },
  {
    name: "theme",
    kind: "localStorage",
    purpose: "Remembers light or dark mode preference.",
    duration: "Until cleared",
  },
  {
    name: "muscle-essentials-splash-seen",
    kind: "localStorage",
    purpose: "Avoids showing the welcome splash on repeat visits.",
    duration: "Until cleared",
  },
  {
    name: "sidebar_state",
    kind: "Cookie",
    purpose: "Remembers admin sidebar open/closed state (admin area only).",
    duration: "7 days",
  },
] as const

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  )
}

function PolicySection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-card/85 shadow-sm backdrop-blur-sm">
      <div className="border-b border-border/40 bg-muted/15 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4 p-5 sm:p-6">{children}</div>
    </section>
  )
}

function DataTable({
  rows,
}: {
  rows: readonly {
    name: string
    kind: string
    purpose: string
    duration: string
  }[]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full min-w-xl text-left text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/20 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Purpose</th>
            <th className="px-4 py-3 font-semibold">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-foreground">{row.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.kind}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.purpose}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CookiesPage() {
  return (
    <div className="relative min-h-svh bg-background">
      <AccountBackground />
      <main className={pageMainClassName({ maxWidth: "7xl" })}>
        <header className="max-w-2xl pb-10">
          <SectionLabel>Legal</SectionLabel>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            This policy explains how GEN1 uses cookies and similar technologies when you
            browse our shop, sign in to your account, or use this website.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Last updated: May 2026</p>
        </header>

        <div className="space-y-6">
          <PolicySection
            title="What are cookies?"
            description="Small files stored on your device that help the site work and remember choices."
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cookies are text files placed on your phone or computer. We also use{" "}
              <strong className="font-medium text-foreground">localStorage (browser storage) </strong> for some
              preferences — it works similarly but is managed in your browser&apos;s site data
              settings.
            </p>
          </PolicySection>

          <PolicySection
            title="Cookies we set"
            description="Including consent and sign-in session cookies."
          >
            <DataTable rows={cookieRows} />
          </PolicySection>

          <PolicySection
            title="Local storage & other data"
            description="Preferences and session data stored in your browser."
          >
            <DataTable rows={storageRows} />
          </PolicySection>

          <PolicySection
            title="Your choices"
            description="You control optional cookies and can clear data anytime."
          >
            <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li className="flex gap-3">
                <Cookie className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  When you first visit, a banner lets you <strong className="text-foreground">Accept all</strong> or{" "}
                  <strong className="text-foreground">Decline</strong> optional cookies. Essential cookies
                  needed for sign-in may still be used when you log in.
                </span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  You can delete cookies and site data in your browser settings at any time. Clearing
                  data may sign you out and reset preferences such as theme.
                </span>
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Questions?">
            <p className="text-sm leading-relaxed text-muted-foreground">
              For questions about this policy or how we handle your data, email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Cookie%20policy%20question`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              or visit our{" "}
              <Link href="/contact" className="font-medium text-foreground underline-offset-4 hover:underline">
                contact page
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/shop"
                className="inline-flex h-9 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95"
              >
                Back to shop
              </Link>
              <Link
                href="/"
                className="inline-flex h-9 items-center rounded-full border border-border/70 bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
              >
                Home
              </Link>
            </div>
          </PolicySection>
        </div>
      </main>
    </div>
  )
}
