"use client"

import Link from "next/link"
import CookieConsent from "react-cookie-consent"
import { COOKIE_CONSENT_NAME } from "@/lib/cookie-consent"

export function CookieConsentBar() {
  return (
    <CookieConsent
      location="bottom"
      cookieName={COOKIE_CONSENT_NAME}
      expires={365}
      sameSite="lax"
      enableDeclineButton
      flipButtons
      buttonText="Accept all"
      declineButtonText="Decline"
      disableStyles
      containerClasses={[
        "fixed inset-x-0 z-[60] mx-auto flex w-full flex-wrap items-center justify-between gap-4",
        "border-t border-border/50 bg-card/95 px-4 py-4 text-foreground shadow-lg backdrop-blur-md",
        "sm:px-6 sm:py-4",
        "max-md:bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]",
        "md:bottom-0",
      ].join(" ")}
      contentClasses="min-w-[min(100%,18rem)] flex-1 text-sm leading-relaxed text-muted-foreground"
      buttonWrapperClasses="flex shrink-0 flex-wrap items-center gap-2"
      buttonClasses="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-none transition-opacity hover:opacity-95"
      declineButtonClasses="inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
      ariaAcceptLabel="Accept cookies"
      ariaDeclineLabel="Decline cookies"
    >
      We use cookies to remember your preferences and improve your experience.{" "}
      <Link
        href="/cookies"
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        Cookie policy
      </Link>
      .
    </CookieConsent>
  )
}
