"use client"

import React from "react"
import { AnimatePresence, motion } from "motion/react"
import LandingPage, {
  LandingMainSkeleton,
} from "@/app/components/LandingPage/LandingPage"
import {
  SplashScreen,
  SPLASH_DURATION_MS,
} from "@/app/components/SplashScreen/SplashScreen"

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
        <SplashScreen />
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
