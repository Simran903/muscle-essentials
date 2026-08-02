"use client"

import React, { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Card } from "@/app/components/Common/Card"
import { Pagination } from "@/app/components/Common/Pagination"
import { Skeleton } from "@/app/components/ui/skeleton"
import {
  effectiveVariantFlags,
  getProducts,
  getShopFilters,
  type ProductListResponse,
} from "@/lib/api"
import { pageMainClassName } from "@/lib/page-layout"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar"
import {
  BRAND_PICKER_DEFAULT,
  CATEGORY_PICKER_DEFAULT,
  FLAVOUR_PICKER_DEFAULT,
  ShopSidebar,
  type ShopDietFilter,
  type ShopSortBy,
} from "../components/Shop/ShopSidebar"

const PAGE_SIZE = 12
const isQueryFlagEnabled = (value: string | null) => value === "1" || value === "true"
type ShopVariantItem = {
  key: string
  product: ProductListResponse["items"][number]
  flavourLabel?: string
  sizeLabel?: string
  price: number
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading shop…</p>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  )
}

function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [page, setPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState<ProductListResponse | null>(null)
  const [brandPickerValue, setBrandPickerValue] = React.useState(BRAND_PICKER_DEFAULT)
  const [categoryPickerValue, setCategoryPickerValue] = React.useState(CATEGORY_PICKER_DEFAULT)
  const [flavourPickerValue, setFlavourPickerValue] = React.useState(FLAVOUR_PICKER_DEFAULT)
  const [selectedBrandSlugs, setSelectedBrandSlugs] = React.useState<string[]>([])
  const [selectedCategorySlugs, setSelectedCategorySlugs] = React.useState<string[]>([])
  const [selectedFlavours, setSelectedFlavours] = React.useState<string[]>([])
  const [brandOptions, setBrandOptions] = React.useState<Array<{ value: string; label: string }>>([
    { value: BRAND_PICKER_DEFAULT, label: BRAND_PICKER_DEFAULT },
  ])
  const [categoryOptions, setCategoryOptions] = React.useState<Array<{ value: string; label: string }>>([
    { value: CATEGORY_PICKER_DEFAULT, label: CATEGORY_PICKER_DEFAULT },
  ])
  const [flavourOptions, setFlavourOptions] = React.useState<Array<{ value: string; label: string }>>([
    { value: FLAVOUR_PICKER_DEFAULT, label: FLAVOUR_PICKER_DEFAULT },
  ])
  const [featuredOnlyUser, setFeaturedOnlyUser] = React.useState<boolean | undefined>(undefined)
  const [bestsellerOnlyUser, setBestsellerOnlyUser] = React.useState<boolean | undefined>(undefined)
  const [dealOfTheDayOnlyUser, setDealOfTheDayOnlyUser] = React.useState<boolean | undefined>(undefined)
  const [comboOnlyUser, setComboOnlyUser] = React.useState<boolean | undefined>(undefined)
  const [dietFilter, setDietFilter] = React.useState<ShopDietFilter>("all")
  const [queryFlags, setQueryFlags] = React.useState({
    featured: false,
    bestseller: false,
    deal: false,
    combo: false,
  })
  const [sortBy, setSortBy] = React.useState<ShopSortBy>("default")

  React.useEffect(() => {
    setQueryFlags({
      featured: isQueryFlagEnabled(searchParams.get("featured")),
      bestseller: isQueryFlagEnabled(searchParams.get("bestseller")),
      deal: isQueryFlagEnabled(searchParams.get("deal")),
      combo: isQueryFlagEnabled(searchParams.get("combo")),
    })
  }, [searchParams])

  React.useEffect(() => {
    const brandsReady = brandOptions.some((o) => o.value !== BRAND_PICKER_DEFAULT)
    const catsReady = categoryOptions.some((o) => o.value !== CATEGORY_PICKER_DEFAULT)
    if (!brandsReady && !catsReady) return

    const allowedBrands = new Set(
      brandOptions.filter((o) => o.value !== BRAND_PICKER_DEFAULT).map((o) => o.value),
    )
    const allowedCats = new Set(
      categoryOptions.filter((o) => o.value !== CATEGORY_PICKER_DEFAULT).map((o) => o.value),
    )

    const parseSlugs = (raw: string | null, allowed: Set<string>) => {
      if (!raw?.trim()) return []
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => allowed.has(s))
    }

    setSelectedBrandSlugs(parseSlugs(searchParams.get("brand") ?? searchParams.get("brands"), allowedBrands))
    setSelectedCategorySlugs(
      parseSlugs(searchParams.get("category") ?? searchParams.get("categories"), allowedCats),
    )
  }, [searchParams, brandOptions, categoryOptions])

  const featuredOnlyFromQuery = queryFlags.featured
  const bestsellerOnlyFromQuery = queryFlags.bestseller
  const dealOfTheDayOnlyFromQuery = queryFlags.deal
  const comboOnlyFromQuery = queryFlags.combo

  const featuredOnly = featuredOnlyUser ?? featuredOnlyFromQuery
  const bestsellerOnly = bestsellerOnlyUser ?? bestsellerOnlyFromQuery
  const dealOfTheDayOnly = dealOfTheDayOnlyUser ?? dealOfTheDayOnlyFromQuery
  const comboOnly = comboOnlyUser ?? comboOnlyFromQuery

  const resetPage = React.useCallback(() => setPage(1), [])

  const resetFilters = React.useCallback(() => {
    setBrandPickerValue(BRAND_PICKER_DEFAULT)
    setCategoryPickerValue(CATEGORY_PICKER_DEFAULT)
    setFlavourPickerValue(FLAVOUR_PICKER_DEFAULT)
    setSelectedBrandSlugs([])
    setSelectedCategorySlugs([])
    setSelectedFlavours([])
    setFeaturedOnlyUser(false)
    setBestsellerOnlyUser(false)
    setDealOfTheDayOnlyUser(false)
    setComboOnlyUser(false)
    setDietFilter("all")
    setSortBy("default")
    setPage(1)
  }, [])

  React.useEffect(() => {
    let cancelled = false

    const loadFilterOptions = async () => {
      try {
        const filters = await getShopFilters()
        if (cancelled) return

        setBrandOptions([
          { value: BRAND_PICKER_DEFAULT, label: BRAND_PICKER_DEFAULT },
          ...filters.brands.map((b) => ({ value: b.slug, label: b.name })),
        ])

        setCategoryOptions([
          { value: CATEGORY_PICKER_DEFAULT, label: CATEGORY_PICKER_DEFAULT },
          ...filters.categories.map((c) => ({ value: c.slug, label: c.name })),
        ])

        setFlavourOptions([
          { value: FLAVOUR_PICKER_DEFAULT, label: FLAVOUR_PICKER_DEFAULT },
          ...filters.flavours
            .map((f) => f.label.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
            .map((flavour) => ({ value: flavour, label: flavour })),
        ])
      } catch {
      }
    }

    void loadFilterOptions()

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const response = await getProducts({
          page,
          limit: PAGE_SIZE,
        })
        if (!cancelled) {
          setData(response)
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load shop.")
          setData(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [page])

  const visibleItems = React.useMemo<ShopVariantItem[]>(() => {
    const items = [...(data?.items ?? [])]
    const brandFiltered =
      selectedBrandSlugs.length === 0
        ? items
        : items.filter((item) => item.brand?.slug && selectedBrandSlugs.includes(item.brand.slug))

    const categoryFiltered =
      selectedCategorySlugs.length === 0
        ? brandFiltered
        : brandFiltered.filter(
            (item) => item.category?.slug && selectedCategorySlugs.includes(item.category.slug)
          )

    const flavourFiltered =
      selectedFlavours.length === 0
        ? categoryFiltered
        : categoryFiltered.filter((item) =>
            (item.flavours ?? []).some((f) => selectedFlavours.includes(f.label)),
          )

    const dietFiltered =
      dietFilter === "all"
        ? flavourFiltered
        : flavourFiltered.filter((item) => item.dietType === dietFilter)

    const comboFiltered = comboOnly
      ? dietFiltered.filter((item) =>
          `${item.title} ${item.shortDesc ?? ""} ${item.flavours?.map((f) => f.label).join(" ")}`.toLowerCase().includes("combo")
        )
      : dietFiltered

    const expanded = comboFiltered.flatMap((product) => {
      const flavourOptions = (product.flavours ?? []).length ? product.flavours : [null]
      const sizeOptions = (product.sizes ?? []).length ? product.sizes : [null]

      return flavourOptions.flatMap((flavour) =>
        sizeOptions.map((size) => ({
          key: `${product.id}:${flavour?.id ?? "noflavour"}:${size?.id ?? "nosize"}`,
          product,
          flavourLabel: flavour?.label,
          sizeLabel: size?.label,
          price: size ? Number(size.price) : Number(product.price),
        }))
      )
    })

    const spotlightFiltered = expanded.filter((row) => {
      const flags = effectiveVariantFlags(row.product, row.flavourLabel, row.sizeLabel)
      if (featuredOnly && !flags.isFeatured) return false
      if (bestsellerOnly && !flags.isBestseller) return false
      if (dealOfTheDayOnly && !flags.isDealoftheDay) return false
      return true
    })

    const sorted = [...spotlightFiltered]

    const createdMs = (p: ShopVariantItem) => new Date(p.product.createdAt).getTime()

    if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price)
    } else if (sortBy === "title-asc") {
      sorted.sort((a, b) => a.product.title.localeCompare(b.product.title))
    } else if (sortBy === "title-desc") {
      sorted.sort((a, b) => b.product.title.localeCompare(a.product.title))
    } else if (sortBy === "date-desc") {
      sorted.sort((a, b) => createdMs(b) - createdMs(a))
    } else if (sortBy === "date-asc") {
      sorted.sort((a, b) => createdMs(a) - createdMs(b))
    }

    return sorted
  }, [
    data?.items,
    selectedBrandSlugs,
    selectedCategorySlugs,
    selectedFlavours,
    sortBy,
    bestsellerOnly,
    featuredOnly,
    dealOfTheDayOnly,
    comboOnly,
    dietFilter,
  ])

  const hasClientFilters =
    selectedBrandSlugs.length > 0 ||
    selectedCategorySlugs.length > 0 ||
    selectedFlavours.length > 0 ||
    featuredOnly ||
    bestsellerOnly ||
    dealOfTheDayOnly ||
    comboOnly ||
    dietFilter !== "all" ||
    sortBy !== "default"
  const hasPrev = hasClientFilters ? false : (data?.pagination.page ?? 1) > 1
  const hasNext = hasClientFilters
    ? false
    : (data?.pagination.page ?? 1) < (data?.pagination.totalPages ?? 1)
  const currentPage = hasClientFilters ? 1 : (data?.pagination.page ?? 1)
  const totalPages = hasClientFilters ? 1 : (data?.pagination.totalPages ?? 1)
  const productCount = visibleItems.length

  return (
    <SidebarProvider className="bg-background text-foreground dark:bg-background">
      <ShopSidebar
        isLoading={isLoading}
        brandPickerValue={brandPickerValue}
        categoryPickerValue={categoryPickerValue}
        flavourPickerValue={flavourPickerValue}
        onBrandPickerValueChange={setBrandPickerValue}
        onCategoryPickerValueChange={setCategoryPickerValue}
        onFlavourPickerValueChange={setFlavourPickerValue}
        brandOptions={brandOptions}
        categoryOptions={categoryOptions}
        flavourOptions={flavourOptions}
        selectedBrandSlugs={selectedBrandSlugs}
        selectedCategorySlugs={selectedCategorySlugs}
        selectedFlavours={selectedFlavours}
        onSelectedBrandSlugsChange={setSelectedBrandSlugs}
        onSelectedCategorySlugsChange={setSelectedCategorySlugs}
        onSelectedFlavoursChange={setSelectedFlavours}
        featuredOnly={featuredOnly}
        onFeaturedOnlyChange={setFeaturedOnlyUser}
        bestsellerOnly={bestsellerOnly}
        onBestsellerOnlyChange={setBestsellerOnlyUser}
        dealOfTheDayOnly={dealOfTheDayOnly}
        onDealOfTheDayOnlyChange={setDealOfTheDayOnlyUser}
        comboOnly={comboOnly}
        onComboOnlyChange={setComboOnlyUser}
        dietFilter={dietFilter}
        onDietFilterChange={setDietFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={resetFilters}
        onResetPage={resetPage}
      />

      <SidebarInset className="overflow-hidden bg-transparent">
        <main className={pageMainClassName({ maxWidth: false })}>

          <div className="mb-8 rounded-2xl border border-border/30 bg-card/60 p-6 text-card-foreground shadow-sm backdrop-blur-sm sm:mb-10 sm:flex sm:items-end sm:justify-between sm:p-8">
            <div className="min-w-0">
              <div className="mb-2 md:hidden">
                <SidebarTrigger className="bg-background/70 shadow-sm dark:bg-muted/50" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
                All Products
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Explore all of the tested and vetted supplements sold on GEN1! Use our
                filter or sort by features to find your stack.
              </p>
            </div>
            {!isLoading && data ? (
              <p className="mt-4 inline-flex shrink-0 items-center rounded-full border border-border/40 bg-muted/20 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm sm:mt-0">
                {productCount} products
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-2xl border border-border/40 bg-card/60 p-3 shadow-sm"
                >
                  <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : visibleItems.length ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <div key={item.key} className="h-full">
                    <Card
                      imageSrc={item.product.images.find((image) => image.isPrimary)?.url ?? item.product.images[0]?.url ?? "/images/placeholder.jpg"}
                      imageAlt={item.product.images.find((image) => image.isPrimary)?.altText ?? item.product.title}
                      title={item.product.title}
                      subtitle={item.product.brand?.name ?? "GEN1"}
                      price={item.price}
                      priceFrom={false}
                      productId={item.product.id}
                      productSlug={item.product.slug}
                      flavourOptionCount={item.flavourLabel ? 1 : 0}
                      sizeOptionCount={item.sizeLabel ? 1 : 0}
                      flavourLabels={item.flavourLabel ? [item.flavourLabel] : undefined}
                      sizeLabels={item.sizeLabel ? [item.sizeLabel] : undefined}
                      outOfStock={item.product.stockQuantity <= 0}
                      defaultFlavourLabel={item.flavourLabel}
                      defaultSizeLabel={item.sizeLabel}
                      onCardClick={() => router.push(`/shop/${item.product.slug}`)}
                      className="max-w-none"
                      merchBadges={effectiveVariantFlags(
                        item.product,
                        item.flavourLabel,
                        item.sizeLabel,
                      )}
                      dietType={item.product.dietType}
                    />
                  </div>
                ))}
              </div>

              <Pagination
                className="mt-8"
                page={currentPage}
                totalPages={totalPages}
                onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
                onNext={() => setPage((prev) => prev + 1)}
                isPreviousDisabled={!hasPrev}
                isNextDisabled={!hasNext}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-border/30 bg-card/50 p-12 text-center shadow-sm backdrop-blur-sm">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-border/40 bg-muted/30">
                <svg className="size-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75v-.75a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v.75m-4.5 0h4.5m-4.5 0a9.75 9.75 0 00-8.25 9.75v.75c0 .621.504 1.125 1.125 1.125h18.75c.621 0 1.125-.504 1.125-1.125v-.75a9.75 9.75 0 00-8.25-9.75" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">No products found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or resetting the current selection.
              </p>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
