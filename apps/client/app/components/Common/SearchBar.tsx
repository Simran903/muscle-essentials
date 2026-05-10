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
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400" />
        <InputField
        id={id}
        type="search"
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-border/60 bg-muted/15 pl-11 pr-4 text-sm text-foreground shadow-none transition-[border-color,background-color,box-shadow] placeholder:text-muted-foreground hover:border-border hover:bg-muted/25 focus-visible:border-cyan-500/40 focus-visible:ring-2 focus-visible:ring-cyan-500/15 dark:focus-visible:border-cyan-400/45 dark:focus-visible:ring-cyan-400/15"
        />
      </div>
    </div>
  )
}
