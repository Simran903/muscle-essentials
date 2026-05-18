"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  Copy,
  ExternalLink,
  Home,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"

import { AccountBackground } from "../components/Account/AccountBackground"

const CONTACT_EMAIL = "essentialsmuscle@gmail.com"
const EMAIL_SUBJECT = "Muscle Essentials — Question"
const GMAIL_COMPOSE_HREF = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(EMAIL_SUBJECT)}`
const CONTACT_PHONE_DISPLAY = "+91 92895 11600"
const CONTACT_PHONE_TEL = `tel:${CONTACT_PHONE_DISPLAY.replace(/\s/g, "")}`
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/_muscle_essentials_?igsh=MTRkbXozOGMzZmplcQ%3D%3D&utm_source=qr"
const INSTAGRAM_QR_SRC = "/instagram.png"

const SectionLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  )
}

const InstagramDmQr = () => {
  const [broken, setBroken] = React.useState(false)

  if (broken) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
        <MessageCircle className="size-12 text-muted-foreground" aria-hidden />
        <p className="max-w-xs text-sm text-muted-foreground">
          The QR image is not available right now. Tap below to open Instagram and send us a DM.
        </p>
        <Button asChild className="rounded-full">
          <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            Open Instagram
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50 bg-background p-3 shadow-inner",
          "ring-1 ring-border/30",
        )}
      >
        <Image
          src={INSTAGRAM_QR_SRC}
          alt="Scan to open Instagram and send a DM to Muscle Essentials"
          width={220}
          height={220}
          className="size-[220px] rounded-xl object-cover"
          onError={() => setBroken(true)}
        />
      </div>
      <p className="mt-4 max-w-xs text-center text-sm text-muted-foreground">
        Scan with your phone camera to open Instagram and message us directly.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
        <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-3.5" />
          @essentialsmuscle
        </a>
      </Button>
    </div>
  )
}

const ContactPage = () => {
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      toast.success("Email copied to clipboard.")
    } catch {
      toast.error("Could not copy. You can select the address manually.")
    }
  }

  const copyPhone = async () => {
    const digits = CONTACT_PHONE_DISPLAY.replace(/\s/g, "")
    try {
      await navigator.clipboard.writeText(digits)
      toast.success("Phone number copied to clipboard.")
    } catch {
      toast.error("Could not copy. You can select the number manually.")
    }
  }

  return (
    <div className="relative min-h-svh bg-background">
      <AccountBackground />
      <main className="relative isolate mx-auto w-full max-w-6xl px-4 pb-24 text-foreground sm:px-6 sm:pb-16 lg:px-10">

        <header className="mt-8 max-w-2xl pb-10">
          <SectionLabel>We are here to help</SectionLabel>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Contact Muscle Essentials
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Questions about products, your order, or shipping? Reach us by phone, email, or
            Instagram DM — we typically reply within one business day.
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <section className="overflow-hidden rounded-2xl border border-border/50 bg-card/85 shadow-sm backdrop-blur-sm">
            <div className="border-b border-border/40 bg-muted/15 px-5 py-4 sm:px-6">
              <SectionLabel>Email & phone</SectionLabel>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                Write or call us
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Best for order details, receipts, and quick questions. Email opens Gmail in your
                browser; phone opens your dialer.
              </p>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-background/60 p-4">
                <span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <a
                    href={GMAIL_COMPOSE_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all text-base font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-xl">
                  <a href={GMAIL_COMPOSE_HREF} target="_blank" rel="noopener noreferrer">
                    <Mail className="size-4" />
                    Compose in Gmail
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => void copyEmail()}
                >
                  <Copy className="size-4" />
                  Copy email
                </Button>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-background/60 p-4">
                <span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <Phone className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">Phone</p>
                  <a
                    href={CONTACT_PHONE_TEL}
                    className="mt-1 block text-base font-semibold text-foreground underline-offset-4 hover:underline tabular-nums"
                  >
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-xl">
                  <a href={CONTACT_PHONE_TEL}>
                    <Phone className="size-4" />
                    Call now
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => void copyPhone()}
                >
                  <Copy className="size-4" />
                  Copy number
                </Button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border/50 bg-card/85 shadow-sm backdrop-blur-sm">
            <div className="border-b border-border/40 bg-muted/15 px-5 py-4 sm:px-6">
              <SectionLabel>Instagram</SectionLabel>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                DM us on Instagram
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quick questions and product advice — scan the QR or tap the link below.
              </p>
            </div>
            <div className="flex justify-center px-5 py-8 sm:px-6 sm:py-10">
              <InstagramDmQr />
            </div>
          </section>
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Prefer the shop?{" "}
          <Link href="/shop" className="font-medium text-foreground underline-offset-4 hover:underline">
            Browse the catalog
          </Link>
        </p>
      </main>
    </div>
  )
}

export default ContactPage