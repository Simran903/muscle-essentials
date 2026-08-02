"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  HeartHandshake,
  IndianRupee,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  Zap,
} from "lucide-react"

import { Button } from "@/app/components/ui/button"
import { pageMainClassName } from "@/lib/page-layout"
import { cn } from "@/lib/utils"

import { AccountBackground } from "../components/Account/AccountBackground"

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

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/20 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8", className)}>
      {children}
    </div>
  )
}

const whyChooseUs = [
  {
    icon: BadgeCheck,
    title: "Genuine products, always",
    description: "Authentic supplements sourced from trusted and reputed brands.",
  },
  {
    icon: Target,
    title: "Budget-friendly picks",
    description: "Recommendations tailored to your fitness goals and your budget.",
  },
  {
    icon: PackageCheck,
    title: "Wide range",
    description:
      "Protein powders, pre-workouts, creatine, vitamins, mass gainers, wellness supplements, and healthy snacking options.",
  },
  {
    icon: Tag,
    title: "Competitive pricing",
    description: "Fair prices with regular offers and discounts across the catalog.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & reliable",
    description: "Secure shopping experience and dependable, on-time delivery.",
  },
  {
    icon: Headphones,
    title: "Customer-first support",
    description: "Friendly support to help you choose the right products with confidence.",
  },
]

const AboutPage = () => {
  return (
    <div className="relative min-h-svh bg-background">
      <AccountBackground />
      <main className={pageMainClassName({ maxWidth: "7xl" })}>
        <FadeUp>
          <header className="max-w-3xl pb-10 sm:pb-14">
            <SectionLabel>About us</SectionLabel>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-tight">
              About GEN 1 Nutrition
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Welcome to GEN 1 Nutrition, your trusted destination for quality sports nutrition and
              fitness supplements. We believe that achieving your health and fitness goals shouldn't
              require overspending. That's why we're committed to helping every customer find the
              best genuine supplements that match both their goals and their budget.
            </p>
          </header>
        </FadeUp>

        <FadeUp delay={0.05}>
          <GlassCard className="mb-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                <Sparkles className="size-5" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Supplements for every goal
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Whether you're a beginner starting your fitness journey, an athlete aiming to
                improve performance, or someone focused on overall health and wellness, we carefully
                curate products from trusted brands to ensure you get genuine, effective, and
                value-for-money supplements.
              </p>
            </div>
            <div>
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                <IndianRupee className="size-5" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                The right supplement, at the right price
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                At GEN 1 Nutrition, we understand that every individual has different nutritional
                needs and financial priorities. Instead of promoting the most expensive products, our
                focus is on recommending the right supplements at the right price, so you can make
                informed decisions without compromising on quality.
              </p>
            </div>
          </GlassCard>
        </FadeUp>

        <FadeUp delay={0.05}>
          <section className="mb-6 mt-16 sm:mt-20">
            <div className="mb-8 max-w-2xl">
              <SectionLabel>Why choose us</SectionLabel>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Built around your goals
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Every product we stock is chosen for quality, authenticity, and customer value.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whyChooseUs.map((item) => {
                const Icon = item.icon
                return (
                  <GlassCard key={item.title}>
                    <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-sm">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </GlassCard>
                )
              })}
            </div>
          </section>
        </FadeUp>

        <FadeUp delay={0.05}>
          <section className="mt-16 sm:mt-20">
            <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/8 via-primary/5 to-transparent p-8 text-center shadow-sm sm:p-12 lg:p-16">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,var(--primary)_0%,transparent_70%)] opacity-[0.07]" />
              <div className="relative mx-auto max-w-2xl">
                <Target className="mx-auto size-8 text-primary" aria-hidden />
                <SectionLabel>Our mission</SectionLabel>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Quality nutrition, made accessible
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  Our mission is simple: to make premium-quality nutrition accessible, affordable,
                  and trustworthy for everyone.
                </p>
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp delay={0.05}>
          <GlassCard className="mt-16 sm:mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mx-auto flex size-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 shadow-sm dark:text-emerald-300">
                <HeartHandshake className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                More than just a store
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                We are more than just an online supplement store — we're your fitness partner. Every
                product we offer is selected with quality, authenticity, and customer value in mind,
                ensuring you get the best results without exceeding your budget.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Thank you for choosing GEN 1 Nutrition.
              </p>
            </div>
          </GlassCard>
        </FadeUp>

        <FadeUp delay={0.05}>
          <section className="mt-16 sm:mt-20">
            <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/8 via-primary/5 to-transparent p-8 text-center shadow-sm sm:p-12 lg:p-16">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,var(--primary)_0%,transparent_70%)] opacity-[0.07]" />
              <div className="relative">
                <Zap className="mx-auto size-8 text-primary" aria-hidden />
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  BUY GEN1. BE GEN1.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                  Join thousands of customers who trust GEN 1 Nutrition for genuine supplements at
                  honest prices. Your fitness goals start here.
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

export default AboutPage
