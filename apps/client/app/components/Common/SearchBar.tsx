"use client"

import { Search } from "lucide-react"

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
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="group relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[#F1C232]" />
        <input
          id={id}
          type="search"
          placeholder={placeholder}
          className="h-11 w-full rounded-full border border-border/80 bg-background/95 pl-11 pr-10 text-sm text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all placeholder:text-muted-foreground/90 hover:border-border hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1C232]/35 focus-visible:border-[#F1C232]/60"
        />
      </div>
    </div>
  )
}
