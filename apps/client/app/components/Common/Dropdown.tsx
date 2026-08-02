"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface CustomDropdownProps {
  value: string
  onChange: (value: string) => void
  options: Array<string | { value: string; label: string }>
  className?: string
  openUp?: boolean
  searchable?: boolean
  searchPlaceholder?: string
}

type NormalizedOption = {
  value: string
  label: string
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  className = "",
  openUp = false,
  searchable = false,
  searchPlaceholder = "Search...",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [query, setQuery] = useState<string>("")
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const targetNode = event.target as Node | null
      if (!dropdownRef.current || !targetNode) return
      if (!dropdownRef.current.contains(targetNode)) {
        setIsOpen(false)
        setQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const closeDropdown = (): void => {
    setIsOpen(false)
    setQuery("")
  }

  const toggleDropdown = (): void => {
    if (isOpen) {
      closeDropdown()
      return
    }
    setIsOpen(true)
  }

  const filteredOptions = useMemo<NormalizedOption[]>(() => {
    const normalizedOptions = options.map((option) =>
      typeof option === "string"
        ? { value: option, label: option }
        : { value: option.value, label: option.label }
    )

    if (!searchable) return normalizedOptions

    const normalizedQuery: string = query.trim().toLowerCase()
    if (!normalizedQuery) return normalizedOptions

    return normalizedOptions.filter((option: NormalizedOption) =>
      option.label.toLowerCase().includes(normalizedQuery)
    )
  }, [options, query, searchable])

  const selectedOption = useMemo<NormalizedOption | undefined>(() => {
    return filteredOptions.find((option) => option.value === value)
  }, [filteredOptions, value])

  return (
    <div
      className={`relative w-full min-w-48 ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="inline-flex w-full items-center justify-between rounded-xl border border-border/70 bg-background px-3.5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-border hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        onClick={toggleDropdown}
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <svg
          className={`-mr-1 ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 left-0 z-300 w-full min-w-48 overflow-hidden rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-glass-lg",
            openUp ? "bottom-full mb-2 origin-bottom-right" : "mt-2 origin-top-right"
          )}
        >
          {searchable && (
            <div className="border-b border-border/50 p-2">
              <input
                type="text"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-input/80 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
          )}

          <div
            className="max-h-60 overflow-y-auto overscroll-contain py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {filteredOptions.map((option: NormalizedOption) => (
              <button
                type="button"
                key={option.value}
                className={cn(
                  "flex w-full items-center px-3.5 py-2.5 text-sm text-left transition-colors duration-150",
                  value === option.value
                    ? "bg-primary/8 font-medium text-foreground"
                    : "text-popover-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                onClick={() => {
                  onChange(option.value)
                  closeDropdown()
                }}
              >
                {option.label}
              </button>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-3.5 py-2.5 text-sm text-muted-foreground">No matching options</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const Dropdown = CustomDropdown
