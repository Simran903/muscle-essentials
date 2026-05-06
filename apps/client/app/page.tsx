"use client"

import React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Michroma } from "next/font/google"
import LandingPage, {
  LandingMainSkeleton,
} from "@/app/components/LandingPage/LandingPage"

const SPLASH_DURATION_MS = 1000
const michroma = Michroma({ subsets: ["latin"], weight: "400" })
const SPLASH_SEEN_KEY = "muscle-essentials-splash-seen"

const HomePage = () => {
  const [showSplash, setShowSplash] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const hasSeenSplash = window.localStorage.getItem(SPLASH_SEEN_KEY) === "true"
    let timeout: number | undefined

    if (hasSeenSplash) {
      const frame = window.requestAnimationFrame(() => {
        setShowSplash(false)
      })
      return () => window.cancelAnimationFrame(frame)
    }

    const frame = window.requestAnimationFrame(() => {
      setShowSplash(true)
      timeout = window.setTimeout(() => {
        window.localStorage.setItem(SPLASH_SEEN_KEY, "true")
        setShowSplash(false)
      }, SPLASH_DURATION_MS)
    })

    return () => {
      window.cancelAnimationFrame(frame)
      if (timeout) window.clearTimeout(timeout)
    }
  }, [])

  if (showSplash === null) {
    return (
      <div className="min-h-screen bg-background">
        <LandingMainSkeleton />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.section
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
          className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F1C232]"
          aria-label="Loading website"
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 45%)",
                "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%)",
                "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 45%)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [0.94, 1, 0.98, 1], opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <h1 className={`${michroma.className} text-3xl tracking-wide text-[#454040] sm:text-5xl`}>
                MUSCLE ESSENTIALS
              </h1>
            </motion.div>
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="h-2.5 w-2.5 rounded-full bg-[#454040]"
                  animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.16 }}
                />
              ))}
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.div
          key="landing-page"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <LandingPage />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HomePage