"use client"

import * as React from "react"
type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "light"

    const savedTheme = window.localStorage.getItem("theme")
    return savedTheme === "dark" ? "dark" : "light"
  })

  React.useEffect(() => {
    const root = document.documentElement
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!prefersReducedMotion) {
      root.classList.add("theme-transitioning")
    }

    root.classList.toggle("dark", theme === "dark")
    window.localStorage.setItem("theme", theme)

    if (!prefersReducedMotion) {
      const timeoutId = window.setTimeout(() => {
        root.classList.remove("theme-transitioning")
      }, 320)

      return () => window.clearTimeout(timeoutId)
    }
  }, [theme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark")),
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
