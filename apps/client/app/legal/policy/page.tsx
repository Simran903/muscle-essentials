"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  Truck,
  RotateCcw,
  IndianRupee,
  XCircle,
  Package,
  Headphones,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Phone,
  Mail,
  ArrowRight,
  PackageCheck,
  Search,
  Camera,
  MessageSquare,
  Zap,
  HeartHandshake,
  Timer,
  CreditCard,
} from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { pageMainClassName } from "@/lib/page-layout"
import { cn } from "@/lib/utils"

const AccountBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
    <div className="absolute -left-48 top-[-10%] size-120 rounded-full bg-primary/10 blur-3xl dark:bg-primary/6" />
    <div className="absolute right-[-20%] top-[28%] size-104 rounded-full bg-primary/8 blur-3xl dark:bg-primary/6" />
    <div className="absolute bottom-[-15%] left-[20%] size-88 rounded-full bg-primary/8 blur-3xl" />
  </div>
)

const navSections = [
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "returns", label: "Returns", icon: RotateCcw },
  { id: "refunds", label: "Refunds", icon: IndianRupee },
  { id: "cancellation", label: "Cancellation", icon: XCircle },
  { id: "damaged", label: "Damaged Orders", icon: AlertTriangle },
  { id: "support", label: "Support", icon: Headphones },
] as const


function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  )
}

function FadeUp({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

type GlassCardProps = { children: React.ReactNode; className?: string; tag?: "div" | "section" }
function GlassCard({ children, className, tag: Tag = "div" }: GlassCardProps) {
  return (
    <Tag className={cn("rounded-2xl border border-border/20 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8", className)}>
      {children}
    </Tag>
  )
}

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border/20 bg-card/40 shadow-sm transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-4 pt-0 text-sm leading-7 text-muted-foreground">{children}</div>
      </motion.div>
    </div>
  )
}

function Timeline({ steps }: { steps: { icon: typeof Truck; title: string; description: string }[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[1.125rem] top-3 bottom-3 w-px bg-border/40" aria-hidden />
      <div className="space-y-0">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div key={i} className="relative flex gap-5 pb-8 last:pb-0">
              <div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/8 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function IconList({ items }: { items: { icon: typeof Truck; text: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <li key={i} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-3" />
            </span>
            {item.text}
          </li>
        )
      })}
    </ul>
  )
}

function TableCard({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/20 shadow-sm">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/20 bg-muted/20">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/10 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-muted-foreground">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DeliveryReturnsPage() {
  const [activeNav, setActiveNav] = React.useState("delivery")
  const navRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id)
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    )

    const sections = document.querySelectorAll("[data-policy-section]")
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 120
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  return (
    <div className="relative min-h-svh bg-background">
      <AccountBackground />

      {/* Sticky section nav */}
      <div
        ref={navRef}
        className="py-4 sticky top-16 z-30 border-b border-border/10 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 sm:py-0 lg:px-10">
          {navSections.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 whitespace-nowrap sm:px-4 sm:py-3 sm:text-sm",
                  activeNav === s.id
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5 sm:size-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <main className={pageMainClassName({ maxWidth: "7xl" })}>
        {/* Hero */}
        <FadeUp>
          <header className="max-w-3xl pb-10 sm:pb-14">
            <SectionLabel>Policy</SectionLabel>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-tight">
              Delivery &amp; Returns
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              We are dedicated to providing a seamless, transparent, and customer-focused shopping
              experience for all your sports nutrition and supplement requirements. Our commitment is
              to ensure that every order reaches you safely, securely, and in excellent condition.
            </p>
          </header>
        </FadeUp>

        {/* Delivery */}
        <FadeUp delay={0.05}>
          <section id="delivery" data-policy-section className="scroll-mt-28">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                <Truck className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Delivery Policy
                </h2>
                <p className="text-sm text-muted-foreground">
                  We partner with reliable logistics providers to deliver your supplements safely.
                </p>
              </div>
            </div>

            {/* Order Processing */}
            <div className="mb-6 grid gap-5 sm:grid-cols-3">
              <GlassCard className="sm:col-span-2">
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                    <Timer className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Order Processing</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      All orders are processed after successful payment confirmation. Orders are
                      generally processed within 24–48 hours. Orders placed on weekends, public
                      holidays, or during promotional periods may require additional processing time
                      and are processed on the next working day.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Once dispatched, you will receive shipment confirmation along with tracking
                      details through email, SMS, WhatsApp, or other available channels.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <div className="space-y-5">
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Additional Time</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        Weekends, holidays &amp; promotions may add processing time.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Dispatch Confirmation</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        Tracking details sent via email, SMS, or WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Timeline Table */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold text-foreground">Delivery Timeline</p>
              <TableCard
                headers={["Factor", "Details"]}
                rows={[
                  ["Standard delivery", "1–5 business days from dispatch"],
                  ["Timeline affected by", "Weather, natural events, holidays, courier delays"],
                  ["Remote locations", "May experience longer delivery times"],
                  ["Delivery guarantee", "Dates are indicative, not guaranteed"],
                ]}
              />
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                While we strive to deliver every order within the estimated timeframe, delivery dates
                are indicative and not guaranteed. We appreciate your understanding when delays occur
                due to external circumstances.
              </p>
            </div>

            {/* Shipping Charges */}
            <div className="mb-6 grid gap-5 sm:grid-cols-2">
              <GlassCard>
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                    <IndianRupee className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Shipping Charges</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Charges are based on order value, delivery location, package weight, and
                      applicable rates. Free shipping may be offered on select products, order
                      values, or promotional campaigns. All charges are displayed during checkout.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Shipping Information Accuracy</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      You are responsible for providing accurate delivery details. Delays or
                      additional charges from incorrect information may be your responsibility.
                      Returns due to incorrect addresses may incur re-dispatch charges.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Delivery Checklist */}
            <GlassCard>
              <p className="mb-3 text-sm font-semibold text-foreground">Delivery Confirmation Checklist</p>
              <IconList
                items={[
                  { icon: Search, text: "Inspect the package condition at the time of delivery." },
                  { icon: Camera, text: "If damaged, notify the delivery partner immediately and photograph the package." },
                  { icon: MessageSquare, text: "Contact our support team with relevant details and evidence." },
                ]}
              />
            </GlassCard>
          </section>
        </FadeUp>

        {/* Returns & Replacements */}
        <FadeUp delay={0.05}>
          <section id="returns" data-policy-section className="mt-16 scroll-mt-28 sm:mt-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                <RotateCcw className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Return &amp; Replacement Policy
                </h2>
                <p className="text-sm text-muted-foreground">
                  Customer satisfaction is our priority. We carefully inspect and pack every order
                  before dispatch.
                </p>
              </div>
            </div>

            <p className="mb-6 max-w-3xl text-sm leading-7 text-muted-foreground">
              Due to the nature of sports nutrition and supplement products, we follow strict return
              guidelines to maintain product safety, hygiene, and authenticity. If you receive a
              product that is damaged, incorrect, defective, or affected by a genuine quality issue,
              we will assist you with a suitable resolution.
            </p>

            <div className="mb-6 grid gap-5 sm:grid-cols-2">
              {/* Eligible */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                  <CheckCircle2 className="size-4" />
                  Eligible Returns
                </p>
                <div className="space-y-3">
                  {[
                    "Product received is damaged during transit.",
                    "Wrong product, flavour, size, or quantity delivered.",
                    "Manufacturing defect or genuine quality issue.",
                    "Package received tampered, leaked, or unacceptable.",
                    "Product received does not match the order placed.",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground shadow-sm"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Eligible */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                  <XCircle className="size-4" />
                  Non-Returnable Items
                </p>
                <div className="space-y-3">
                  {[
                    "Opened or used supplements.",
                    "Broken seals or packaging damaged after delivery.",
                    "Products purchased by mistake or change of mind.",
                    "Products without original packaging or proof of purchase.",
                    "Products expired due to improper storage after delivery.",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-border/20 bg-card/40 px-4 py-3 text-sm leading-6 text-muted-foreground shadow-sm"
                    >
                      <XCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Return Conditions Accordion */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Return Conditions &amp; Process</p>
              <AccordionSection title="Conditions for a valid return">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Request must be raised within the specified return period (24–48 hours of delivery).
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Product must be unused, unopened, in original sealed packaging (unless damaged/defective).
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Include all original packaging, labels, accessories, and documentation.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Proof of purchase must be provided for verification.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Products returned without prior approval may not be accepted.
                  </li>
                </ul>
              </AccordionSection>
            </div>
          </section>
        </FadeUp>

        {/* Return Process Timeline */}
        <FadeUp delay={0.05}>
          <section className="mt-16 sm:mt-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                <PackageCheck className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Return Request Process
                </h2>
                <p className="text-sm text-muted-foreground">
                  Follow these steps to initiate a return or replacement.
                </p>
              </div>
            </div>

            <GlassCard>
              <Timeline
                steps={[
                  {
                    icon: MessageSquare,
                    title: "Contact Support",
                    description:
                      "Contact our customer support team within 24–48 hours of receiving your order. Provide your order number, invoice details, and a clear description of the issue.",
                  },
                  {
                    icon: Camera,
                    title: "Submit Evidence",
                    description:
                      "Share supporting images or videos of the product, packaging, batch details, and shipping label if requested. Do not discard the original packaging until the issue has been resolved.",
                  },
                  {
                    icon: Search,
                    title: "Verification",
                    description:
                      "Our team will review your request and supporting evidence. Each return or replacement request is verified before approval.",
                  },
                  {
                    icon: Truck,
                    title: "Pickup / Replacement / Refund",
                    description:
                      "Once approved, we will provide further instructions regarding pickup, replacement shipment, or refund processing.",
                  },
                ]}
              />
            </GlassCard>
          </section>
        </FadeUp>

        {/* Refund Policy */}
        <FadeUp delay={0.05}>
          <section id="refunds" data-policy-section className="mt-16 scroll-mt-28 sm:mt-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                <IndianRupee className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Refund Policy
                </h2>
                <p className="text-sm text-muted-foreground">
                  We process refunds promptly after verification and inspection.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <GlassCard>
                <CreditCard className="mb-3 size-6 text-primary" />
                <p className="text-sm font-semibold text-foreground">Refund Method</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Refunds are processed through the original payment method or as store credit,
                  depending on the circumstances.
                </p>
              </GlassCard>

              <GlassCard>
                <Timer className="mb-3 size-6 text-primary" />
                <p className="text-sm font-semibold text-foreground">Processing Timeline</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Initiated after the returned product is received and inspected. Time to reflect
                  varies by bank, card issuer, and payment gateway.
                </p>
              </GlassCard>

              <GlassCard>
                <AlertTriangle className="mb-3 size-6 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-semibold text-foreground">Important Notes</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Shipping charges may not be refundable unless the return is due to our error or a
                  defective product. We apply proper verification and fraud prevention measures.
                </p>
              </GlassCard>
            </div>
          </section>
        </FadeUp>

        {/* Order Cancellation */}
        <FadeUp delay={0.05}>
          <section id="cancellation" data-policy-section className="mt-16 scroll-mt-28 sm:mt-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                <XCircle className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Order Cancellation
                </h2>
                <p className="text-sm text-muted-foreground">
                  We understand that plans may change.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <GlassCard className="border-primary/15">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                    <CheckCircle2 className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Before Shipment</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Cancellation requests submitted before the order is shipped can be processed.
                      Eligible refunds will follow our refund guidelines.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="border-amber-500/15">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/8 text-amber-600 dark:text-amber-400">
                    <Clock className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">After Shipment</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Once packed and dispatched, cancellation cannot be guaranteed. Shipped orders
                      must follow the applicable return policy.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        </FadeUp>

        {/* Damaged / Missing Orders */}
        <FadeUp delay={0.05}>
          <section id="damaged" data-policy-section className="mt-16 scroll-mt-28 sm:mt-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-600 dark:text-red-400 shadow-sm">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Damaged, Missing, or Incorrect Orders
                </h2>
                <p className="text-sm text-muted-foreground">
                  We are here to help — report issues promptly for a quick resolution.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400">
                  <Package className="size-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">
                    Received a damaged, missing, or incorrect item?
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                        <span className="size-1.5 rounded-full bg-current" />
                      </span>
                      Notify us within <strong className="text-foreground">48 hours</strong> of delivery.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                        <span className="size-1.5 rounded-full bg-current" />
                      </span>
                      Provide your order details along with supporting images or videos.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                        <span className="size-1.5 rounded-full bg-current" />
                      </span>
                      Our team will investigate and provide a suitable resolution — replacement, refund, or store credit.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </FadeUp>

        {/* Customer Support */}
        <FadeUp delay={0.05}>
          <section id="support" data-policy-section className="mt-16 scroll-mt-28 sm:mt-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                <Headphones className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Customer Support
                </h2>
                <p className="text-sm text-muted-foreground">
                  We are always available to assist you with any order-related queries.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <GlassCard className="sm:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-xl border border-border/20 bg-background/40 p-4">
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                      <Mail className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">support@genonenutrition.in</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        We typically reply within one business day.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-xl border border-border/20 bg-background/40 p-4">
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                      <Phone className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</p>
                      <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">+91 92895 11600</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Available during business hours.
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="flex flex-col">
                <HeartHandshake className="mb-3 size-6 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  We are here to help
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  At GEN 1 Nutrition, we believe that great service goes beyond selling products.
                  We are committed to providing genuine sports nutrition products, dependable
                  delivery, and customer-first support.
                </p>
                <div className="mt-auto pt-4">
                  <Button asChild size="lg" className="w-full rounded-xl shadow-sm">
                    <a href="mailto:support@genonenutrition.in?subject=Delivery/Returns%20Question">
                      <Mail className="size-4" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </GlassCard>
            </div>
          </section>
        </FadeUp>

        {/* Footer CTA */}
        <FadeUp delay={0.05}>
          <section className="mt-16 sm:mt-20">
            <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/8 via-primary/5 to-transparent p-8 text-center shadow-sm sm:p-12 lg:p-16">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,var(--primary)_0%,transparent_70%)] opacity-[0.07]" />
              <div className="relative">
                <Zap className="mx-auto size-8 text-primary" />
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  BUY GEN1. BE GEN1.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                  Thank you for trusting GEN 1 Nutrition as your preferred sports nutrition partner.
                  We appreciate your business and look forward to serving you better.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="rounded-xl shadow-sm">
                    <Link href="/shop">
                      Browse supplements
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl">
                    <Link href="/contact">Contact us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </FadeUp>
      </main>
    </div>
  )
}
