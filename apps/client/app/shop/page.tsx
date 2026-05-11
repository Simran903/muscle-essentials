"use client"

import React from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
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
  const [queryFlags, setQueryFlags] = React.useState({
    featured: false,
    bestseller: false,
    deal: false,
    combo: false,
  })
  const [sortBy, setSortBy] = React.useState<ShopSortBy>("default")

  React.useEffect(() => {
    const readQueryFlags = () => {
      const params = new URLSearchParams(window.location.search)
      setQueryFlags({
        featured: isQueryFlagEnabled(params.get("featured")),
        bestseller: isQueryFlagEnabled(params.get("bestseller")),
        deal: isQueryFlagEnabled(params.get("deal")),
        combo: isQueryFlagEnabled(params.get("combo")),
      })
    }

    readQueryFlags()
    window.addEventListener("popstate", readQueryFlags)

    return () => {
      window.removeEventListener("popstate", readQueryFlags)
    }
  }, [])

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
        // Filter options are non-critical; avoid interrupting product list rendering.
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

    const comboFiltered = comboOnly
      ? flavourFiltered.filter((item) =>
          `${item.title} ${item.shortDesc ?? ""} ${item.flavours?.map((f) => f.label).join(" ")}`.toLowerCase().includes("combo")
        )
      : flavourFiltered

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
  ])

  const hasClientFilters =
    selectedBrandSlugs.length > 0 ||
    selectedCategorySlugs.length > 0 ||
    selectedFlavours.length > 0 ||
    featuredOnly ||
    bestsellerOnly ||
    dealOfTheDayOnly ||
    comboOnly ||
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
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={resetFilters}
        onResetPage={resetPage}
      />

      <SidebarInset className="overflow-hidden bg-transparent">
        <main className="relative isolate mx-auto min-h-svh w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10">

          <div className="mb-8 rounded-xl border border-border/60 bg-card/80 p-6 text-card-foreground shadow-none backdrop-blur-sm sm:mb-10 sm:flex sm:items-end sm:justify-between sm:p-8">
            <div className="min-w-0">
              <div className="mb-2 md:hidden">
                <SidebarTrigger className="bg-background/80 shadow-sm dark:bg-muted/60" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
                All Products
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Explore all of the tested and vetted supplements sold on Muscle Essentials! Use our
                filter or sort by features to find your stack.
              </p>
            </div>
            {!isLoading && data ? (
              <p className="mt-4 inline-flex shrink-0 rounded-md border border-border/60 bg-muted/20 px-4 py-1.5 text-sm font-medium text-muted-foreground sm:mt-0">
                {productCount} products
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-xl border border-border/80 bg-card/80 p-4 shadow-none"
                >
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-9 w-full rounded-xl" />
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
                      subtitle={item.product.brand?.name ?? "Muscle Essentials"}
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
            <div className="rounded-2xl border border-border/50 bg-card/70 p-10 text-center shadow-none">
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