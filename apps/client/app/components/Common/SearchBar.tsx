"use client"

import { Search } from "lucide-react"
import { InputField } from "./InputField"

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
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-500" />
        <InputField
        id={id}
        type="search"
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-border/80 bg-background/95 pl-11 pr-10 text-sm text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all placeholder:text-muted-foreground/90 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
        />
      </div>
    </div>
  )
}
