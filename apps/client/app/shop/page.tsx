"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card } from "@/app/components/Common/Card"
import { Pagination } from "@/app/components/Common/Pagination"
import { Skeleton } from "@/app/components/ui/skeleton"
import { getProducts, type ProductListResponse } from "@/lib/api"
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
} from "./ShopSidebar"

const PAGE_SIZE = 12

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
  const [featuredOnly, setFeaturedOnly] = React.useState(false)
  const [bestsellerOnly, setBestsellerOnly] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<ShopSortBy>("default")

  const resetPage = React.useCallback(() => setPage(1), [])

  const resetFilters = React.useCallback(() => {
    setBrandPickerValue(BRAND_PICKER_DEFAULT)
    setCategoryPickerValue(CATEGORY_PICKER_DEFAULT)
    setFlavourPickerValue(FLAVOUR_PICKER_DEFAULT)
    setSelectedBrandSlugs([])
    setSelectedCategorySlugs([])
    setSelectedFlavours([])
    setFeaturedOnly(false)
    setBestsellerOnly(false)
    setSortBy("default")
    setPage(1)
  }, [])

  React.useEffect(() => {
    let cancelled = false

    const loadFilterOptions = async () => {
      try {
        const response = await getProducts({ page: 1, limit: 100 })
        if (cancelled) return

        const brandMap = new Map<string, string>()
        const categoryMap = new Map<string, string>()
        const flavourSet = new Set<string>()

        response.items.forEach((product) => {
          if (product.brand?.slug && product.brand?.name) {
            brandMap.set(product.brand.slug, product.brand.name)
          }
          if (product.category?.slug && product.category?.name) {
            categoryMap.set(product.category.slug, product.category.name)
          }
          const flavour = product.flavour?.trim()
          if (flavour) flavourSet.add(flavour)
        })

        setBrandOptions([
          { value: BRAND_PICKER_DEFAULT, label: BRAND_PICKER_DEFAULT },
          ...Array.from(brandMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([slug, name]) => ({ value: slug, label: name })),
        ])

        setCategoryOptions([
          { value: CATEGORY_PICKER_DEFAULT, label: CATEGORY_PICKER_DEFAULT },
          ...Array.from(categoryMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([slug, name]) => ({ value: slug, label: name })),
        ])

        setFlavourOptions([
          { value: FLAVOUR_PICKER_DEFAULT, label: FLAVOUR_PICKER_DEFAULT },
          ...Array.from(flavourSet)
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

  const visibleItems = React.useMemo(() => {
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
        : categoryFiltered.filter((item) => selectedFlavours.includes(item.flavour))

    const bestsellerFiltered = bestsellerOnly
      ? flavourFiltered.filter((item) => item.isBestseller)
      : flavourFiltered

    const featuredFiltered = featuredOnly
      ? bestsellerFiltered.filter((item) => item.isFeatured)
      : bestsellerFiltered

    const sorted = [...featuredFiltered]

    const createdMs = (p: (typeof sorted)[number]) => new Date(p.createdAt).getTime()

    if (sortBy === "price-asc") {
      sorted.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => Number(b.price) - Number(a.price))
    } else if (sortBy === "title-asc") {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === "title-desc") {
      sorted.sort((a, b) => b.title.localeCompare(a.title))
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
  ])

  const hasClientFilters =
    selectedBrandSlugs.length > 0 ||
    selectedCategorySlugs.length > 0 ||
    selectedFlavours.length > 0 ||
    featuredOnly ||
    bestsellerOnly ||
    sortBy !== "default"
  const hasPrev = hasClientFilters ? false : (data?.pagination.page ?? 1) > 1
  const hasNext = hasClientFilters
    ? false
    : (data?.pagination.page ?? 1) < (data?.pagination.totalPages ?? 1)
  const currentPage = hasClientFilters ? 1 : (data?.pagination.page ?? 1)
  const totalPages = hasClientFilters ? 1 : (data?.pagination.totalPages ?? 1)
  const productCount = hasClientFilters ? visibleItems.length : data?.pagination.total ?? 0

  return (
    <SidebarProvider>
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
        onFeaturedOnlyChange={setFeaturedOnly}
        bestsellerOnly={bestsellerOnly}
        onBestsellerOnlyChange={setBestsellerOnly}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={resetFilters}
        onResetPage={resetPage}
      />

      <SidebarInset>
        <main className="mx-auto w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 md:hidden">
                <SidebarTrigger />
              </div>
              <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                All Products
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Explore all of the tested and vetted supplements sold on Muscle Essentials! Use our
                filter or sort by features to find your stack.
              </p>
            </div>
            {!isLoading && data ? (
              <p className="shrink-0 text-sm font-semibold text-foreground sm:text-base lg:text-lg">
                ({productCount} products)
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-3xl border border-border p-4">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((product) => (
                  <div key={product.id} className="h-full">
                    <Card
                      imageSrc={product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? "/images/placeholder.jpg"}
                      imageAlt={product.images.find((image) => image.isPrimary)?.altText ?? product.title}
                      title={product.title}
                      subtitle={product.brand?.name ?? "Muscle Essentials"}
                      price={Number(product.price)}
                      onCardClick={() => router.push(`/shop/${product.slug}`)}
                      className="max-w-none"
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
            <p className="text-sm text-muted-foreground">No products found.</p>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}