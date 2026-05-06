"use client"

import React from "react"
import { Dropdown } from "@/app/components/Common/Dropdown"
import { Pill } from "@/app/components/Common/Pill"
import { Button } from "@/app/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSkeleton,
} from "@/app/components/ui/sidebar"

export const BRAND_PICKER_DEFAULT = "Select brand"
export const CATEGORY_PICKER_DEFAULT = "Select category"

export type ShopSortBy =
  | "default"
  | "title-asc"
  | "title-desc"
  | "price-asc"
  | "price-desc"
  | "date-desc"
  | "date-asc"

type DropdownOption = { value: string; label: string }

export type ShopSidebarProps = {
  isLoading: boolean
  brandPickerValue: string
  categoryPickerValue: string
  onBrandPickerValueChange: (value: string) => void
  onCategoryPickerValueChange: (value: string) => void
  brandOptions: DropdownOption[]
  categoryOptions: DropdownOption[]
  selectedBrandSlugs: string[]
  selectedCategorySlugs: string[]
  onSelectedBrandSlugsChange: React.Dispatch<React.SetStateAction<string[]>>
  onSelectedCategorySlugsChange: React.Dispatch<React.SetStateAction<string[]>>
  featuredOnly: boolean
  onFeaturedOnlyChange: (value: boolean) => void
  sortBy: ShopSortBy
  onSortByChange: (value: ShopSortBy) => void
  onResetFilters: () => void
  onResetPage: () => void
}

export function ShopSidebar({
  isLoading,
  brandPickerValue,
  categoryPickerValue,
  onBrandPickerValueChange,
  onCategoryPickerValueChange,
  brandOptions,
  categoryOptions,
  selectedBrandSlugs,
  selectedCategorySlugs,
  onSelectedBrandSlugsChange,
  onSelectedCategorySlugsChange,
  featuredOnly,
  onFeaturedOnlyChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  onResetPage,
}: ShopSidebarProps) {
  const selectedBrandLabels = React.useMemo(
    () =>
      selectedBrandSlugs.map(
        (slug) => brandOptions.find((option) => option.value === slug)?.label ?? slug
      ),
    [brandOptions, selectedBrandSlugs]
  )
  const selectedCategoryLabels = React.useMemo(
    () =>
      selectedCategorySlugs.map(
        (slug) => categoryOptions.find((option) => option.value === slug)?.label ?? slug
      ),
    [categoryOptions, selectedCategorySlugs]
  )
  const sortLabel = React.useMemo(
    () =>
      ({
        default: "Default",
        "title-asc": "Alphabetically, A-Z",
        "title-desc": "Alphabetically, Z-A",
        "price-asc": "Price, low to high",
        "price-desc": "Price, high to low",
        "date-desc": "Date, new to old",
        "date-asc": "Date, old to new",
      })[sortBy] ?? sortBy,
    [sortBy]
  )

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <p className="px-2 pt-1 text-sm font-semibold text-sidebar-foreground">Shop Controls</p>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <>
            <SidebarSkeleton />
            <SidebarSkeleton />
          </>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Filters</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-3 px-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Brand</label>
                  <Dropdown
                    value={brandPickerValue}
                    onChange={(value) => {
                      if (value !== BRAND_PICKER_DEFAULT) {
                        onSelectedBrandSlugsChange((prev) =>
                          prev.includes(value) ? prev : [...prev, value]
                        )
                      }
                      onBrandPickerValueChange(BRAND_PICKER_DEFAULT)
                      onResetPage()
                    }}
                    options={brandOptions}
                  />
                  {selectedBrandSlugs.length ? (
                    <div className="flex flex-wrap gap-2 pt-4">
                      {selectedBrandSlugs.map((slug, index) => (
                        <Pill
                          key={slug}
                          label={selectedBrandLabels[index] ?? slug}
                          onRemove={() => {
                            onSelectedBrandSlugsChange((prev) =>
                              prev.filter((value) => value !== slug)
                            )
                            onResetPage()
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Category</label>
                  <Dropdown
                    value={categoryPickerValue}
                    onChange={(value) => {
                      if (value !== CATEGORY_PICKER_DEFAULT) {
                        onSelectedCategorySlugsChange((prev) =>
                          prev.includes(value) ? prev : [...prev, value]
                        )
                      }
                      onCategoryPickerValueChange(CATEGORY_PICKER_DEFAULT)
                      onResetPage()
                    }}
                    options={categoryOptions}
                  />
                  {selectedCategorySlugs.length ? (
                    <div className="flex flex-wrap gap-2 pt-4">
                      {selectedCategorySlugs.map((slug, index) => (
                        <Pill
                          key={slug}
                          label={selectedCategoryLabels[index] ?? slug}
                          onRemove={() => {
                            onSelectedCategorySlugsChange((prev) =>
                              prev.filter((value) => value !== slug)
                            )
                            onResetPage()
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground">Featured only</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={featuredOnly}
                    onClick={() => {
                      onFeaturedOnlyChange(!featuredOnly)
                      onResetPage()
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featuredOnly ? "bg-[#F1C232]" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        featuredOnly ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                    <span className="sr-only">Toggle featured only</span>
                  </button>
                </div>
                {featuredOnly ? (
                  <Pill
                    label="Featured only"
                    onRemove={() => {
                      onFeaturedOnlyChange(false)
                      onResetPage()
                    }}
                  />
                ) : null}
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Sort</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-2 px-2">
                <Dropdown
                  value={sortBy}
                  onChange={(value) => onSortByChange(value as ShopSortBy)}
                  options={[
                    { value: "default", label: "Default" },
                    { value: "title-asc", label: "Alphabetically, A-Z" },
                    { value: "title-desc", label: "Alphabetically, Z-A" },
                    { value: "price-asc", label: "Price, low to high" },
                    { value: "price-desc", label: "Price, high to low" },
                    { value: "date-desc", label: "Date, new to old" },
                    { value: "date-asc", label: "Date, old to new" },
                  ]}
                />
                {sortBy !== "default" ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Pill
                      label={sortLabel}
                      onRemove={() => {
                        onSortByChange("default")
                        onResetPage()
                      }}
                    />
                  </div>
                ) : null}
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent className="px-2">
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  onClick={onResetFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
