"use client"

import { Search } from "lucide-react"
import { InputField } from "./InputField"
import { cn } from "@/lib/utils"

type SearchBarProps = {
  id?: string
  label?: string
  placeholder?: string
  className?: string
}

export function SearchBar({
  id = "navbar-search",
  label = "Search",
  placeholder = "Search products, brands, goals...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={cn("", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="group relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
        <InputField
          id={id}
          type="search"
          placeholder={placeholder}
          className="h-10 w-full rounded-full border border-border/60 bg-muted/20 pl-10 pr-4 text-sm text-foreground shadow-none transition-all placeholder:text-muted-foreground/50 hover:border-border/80 hover:bg-muted/30 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/12 focus-visible:bg-background"
        />
      </div>
    </div>
  )
}
