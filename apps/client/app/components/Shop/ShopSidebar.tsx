"use client"

import React from "react"
import { X } from "lucide-react"
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
  useSidebar,
} from "@/app/components/ui/sidebar"

export const BRAND_PICKER_DEFAULT = "Select brand"
export const CATEGORY_PICKER_DEFAULT = "Select category"
export const FLAVOUR_PICKER_DEFAULT = "Select flavour"

export type ShopDietFilter = "all" | "VEG" | "NON_VEG"

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
  flavourPickerValue: string
  onBrandPickerValueChange: (value: string) => void
  onCategoryPickerValueChange: (value: string) => void
  onFlavourPickerValueChange: (value: string) => void
  brandOptions: DropdownOption[]
  categoryOptions: DropdownOption[]
  flavourOptions: DropdownOption[]
  selectedBrandSlugs: string[]
  selectedCategorySlugs: string[]
  selectedFlavours: string[]
  onSelectedBrandSlugsChange: React.Dispatch<React.SetStateAction<string[]>>
  onSelectedCategorySlugsChange: React.Dispatch<React.SetStateAction<string[]>>
  onSelectedFlavoursChange: React.Dispatch<React.SetStateAction<string[]>>
  featuredOnly: boolean
  onFeaturedOnlyChange: (value: boolean) => void
  bestsellerOnly: boolean
  onBestsellerOnlyChange: (value: boolean) => void
  dealOfTheDayOnly: boolean
  onDealOfTheDayOnlyChange: (value: boolean) => void
  comboOnly: boolean
  onComboOnlyChange: (value: boolean) => void
  dietFilter: ShopDietFilter
  onDietFilterChange: (value: ShopDietFilter) => void
  sortBy: ShopSortBy
  onSortByChange: (value: ShopSortBy) => void
  onResetFilters: () => void
  onResetPage: () => void
}

export function ShopSidebar({
  isLoading,
  brandPickerValue,
  categoryPickerValue,
  flavourPickerValue,
  onBrandPickerValueChange,
  onCategoryPickerValueChange,
  onFlavourPickerValueChange,
  brandOptions,
  categoryOptions,
  flavourOptions,
  selectedBrandSlugs,
  selectedCategorySlugs,
  selectedFlavours,
  onSelectedBrandSlugsChange,
  onSelectedCategorySlugsChange,
  onSelectedFlavoursChange,
  featuredOnly,
  onFeaturedOnlyChange,
  bestsellerOnly,
  onBestsellerOnlyChange,
  dealOfTheDayOnly,
  onDealOfTheDayOnlyChange,
  comboOnly,
  onComboOnlyChange,
  dietFilter,
  onDietFilterChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  onResetPage,
}: ShopSidebarProps) {
  const { setOpenMobile } = useSidebar()
  const switchClass = (enabled: boolean) =>
    `relative inline-flex h-6 w-10 items-center rounded-md border transition-colors ${
      enabled
        ? "border-primary/40 bg-primary/15"
        : "border-border/70 bg-muted/40"
    }`
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
  const selectedFlavourLabels = React.useMemo(
    () =>
      selectedFlavours.map(
        (value) => flavourOptions.find((option) => option.value === value)?.label ?? value
      ),
    [flavourOptions, selectedFlavours]
  )

  const dietFilterLabel = React.useMemo(() => {
    const labels: Record<ShopDietFilter, string> = {
      all: "Any diet",
      VEG: "Vegetarian",
      NON_VEG: "Non-vegetarian",
    }
    return labels[dietFilter]
  }, [dietFilter])

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center justify-between border-b border-border/50 px-2 pb-3 pt-1">
          <p className="text-sm font-semibold tracking-wide text-sidebar-foreground">Shop Controls</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setOpenMobile(false)}
          >
            <X className="size-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
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
              <SidebarGroupLabel className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Filters
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-3 px-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Brand
                  </label>
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
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </label>
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

                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Flavour
                  </label>
                  <Dropdown
                    value={flavourPickerValue}
                    onChange={(value) => {
                      if (value !== FLAVOUR_PICKER_DEFAULT) {
                        onSelectedFlavoursChange((prev) =>
                          prev.includes(value) ? prev : [...prev, value]
                        )
                      }
                      onFlavourPickerValueChange(FLAVOUR_PICKER_DEFAULT)
                      onResetPage()
                    }}
                    options={flavourOptions}
                  />
                  {selectedFlavours.length ? (
                    <div className="flex flex-wrap gap-2 pt-4">
                      {selectedFlavours.map((value, index) => (
                        <Pill
                          key={value}
                          label={selectedFlavourLabels[index] ?? value}
                          onRemove={() => {
                            onSelectedFlavoursChange((prev) =>
                              prev.filter((flavour) => flavour !== value)
                            )
                            onResetPage()
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Diet type
                  </label>
                  <Dropdown
                    value={dietFilter}
                    onChange={(value) => {
                      onDietFilterChange(value as ShopDietFilter)
                      onResetPage()
                    }}
                    options={[
                      { value: "all", label: "Any diet" },
                      { value: "VEG", label: "Vegetarian" },
                      { value: "NON_VEG", label: "Non-vegetarian" },
                    ]}
                  />
                  {dietFilter !== "all" ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Pill
                        label={dietFilterLabel}
                        onRemove={() => {
                          onDietFilterChange("all")
                          onResetPage()
                        }}
                      />
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
                    className={switchClass(featuredOnly)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-sm bg-background shadow-sm transition-transform ${
                        featuredOnly ? "translate-x-[1.15rem]" : "translate-x-1"
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

                <div className="flex items-center justify-between gap-2 pt-2">
                  <span className="text-sm text-foreground">Bestseller only</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={bestsellerOnly}
                    onClick={() => {
                      onBestsellerOnlyChange(!bestsellerOnly)
                      onResetPage()
                    }}
                    className={switchClass(bestsellerOnly)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-sm bg-background shadow-sm transition-transform ${
                        bestsellerOnly ? "translate-x-[1.15rem]" : "translate-x-1"
                      }`}
                    />
                    <span className="sr-only">Toggle bestseller only</span>
                  </button>
                </div>
                {bestsellerOnly ? (
                  <Pill
                    label="Bestseller only"
                    onRemove={() => {
                      onBestsellerOnlyChange(false)
                      onResetPage()
                    }}
                  />
                ) : null}

                <div className="flex items-center justify-between gap-2 pt-2">
                  <span className="text-sm text-foreground">Deal of the day only</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={dealOfTheDayOnly}
                    onClick={() => {
                      onDealOfTheDayOnlyChange(!dealOfTheDayOnly)
                      onResetPage()
                    }}
                    className={switchClass(dealOfTheDayOnly)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-sm bg-background shadow-sm transition-transform ${
                        dealOfTheDayOnly ? "translate-x-[1.15rem]" : "translate-x-1"
                      }`}
                    />
                    <span className="sr-only">Toggle deal of the day only</span>
                  </button>
                </div>
                {dealOfTheDayOnly ? (
                  <Pill
                    label="Deal of the day only"
                    onRemove={() => {
                      onDealOfTheDayOnlyChange(false)
                      onResetPage()
                    }}
                  />
                ) : null}

                <div className="flex items-center justify-between gap-2 pt-2">
                  <span className="text-sm text-foreground">Combo only</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={comboOnly}
                    onClick={() => {
                      onComboOnlyChange(!comboOnly)
                      onResetPage()
                    }}
                    className={switchClass(comboOnly)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-sm bg-background shadow-sm transition-transform ${
                        comboOnly ? "translate-x-[1.15rem]" : "translate-x-1"
                      }`}
                    />
                    <span className="sr-only">Toggle combo only</span>
                  </button>
                </div>
                {comboOnly ? (
                  <Pill
                    label="Combo only"
                    onRemove={() => {
                      onComboOnlyChange(false)
                      onResetPage()
                    }}
                  />
                ) : null}
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Sort
              </SidebarGroupLabel>
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
                  className="w-full rounded-md"
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
