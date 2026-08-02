"use client"

import { Moon, Sun } from "lucide-react"

import { Button } from "@/app/components/ui/button"
import { useTheme } from "@/app/components/theme-provider"

export function ThemeFloatingToggle() {
  const { toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed bottom-20 right-5 z-50 rounded-full border-border/40 bg-background/80 shadow-glass backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-primary/[0.06] hover:shadow-glass-lg md:bottom-5"
      aria-label="Toggle theme"
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  )
}
