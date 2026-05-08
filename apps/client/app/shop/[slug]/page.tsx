import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ChevronRight,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react"

import { Button } from "@/app/components/ui/button"
import { getProductBySlug } from "@/lib/api"
import { ProductGallery } from "./ProductGallery"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await getProductBySlug(slug).catch(() => null)

  if (!product) {
    notFound()
  }

  const images = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
  const isInStock = product.stockQuantity > 0

  return (
    <main className="relative isolate mx-auto min-h-svh w-full max-w-7xl overflow-hidden px-4 py-6 text-foreground sm:px-6 sm:py-8 lg:px-8 lg:py-10">

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/"
          className="rounded-full px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
        >
          Home
        </Link>

        <ChevronRight className="size-4" />

        <Link
          href="/shop"
          className="rounded-full px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
        >
          Shop
        </Link>

        <ChevronRight className="size-4" />

        <span className="line-clamp-1 rounded-full border border-border bg-card px-2 py-1 text-foreground shadow-sm">
          {product.title}
        </span>
      </nav>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-8">
        <ProductGallery
          images={images}
          productTitle={product.title}
          isDealOfTheDay={product.isDealoftheDay}
        />

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card/90 p-5 text-card-foreground shadow-sm backdrop-blur sm:p-6 lg:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {product.isFeatured && (
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                  Featured
                </span>
              )}

              {product.isBestseller && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Bestseller
                </span>
              )}

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  isInStock
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isInStock ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {isInStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {product.brand?.name ?? "Muscle Essentials"}
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {product.title}
              </h1>

              {product.shortDesc && (
                <p className="text-base leading-7 text-muted-foreground">
                  {product.shortDesc}
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 dark:bg-muted/30">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Price
                  </p>
                  <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Inclusive of taxes
                </span>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/70 p-4 dark:bg-muted/30">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Category
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                  {product.category?.name ?? "Supplements"}
                </dd>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4 dark:bg-muted/30">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Flavour
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                  {product.flavour || "Original"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                size="lg"
                className="h-12 rounded-2xl text-base"
                disabled={!isInStock}
              >
                <ShoppingCart className="size-4" />
                Add to Cart
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 rounded-2xl text-base"
                disabled={!isInStock}
              >
                Buy Now
              </Button>
            </div>

            <div className="mt-6 grid gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-cyan-500" />
                Fast delivery across India
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-cyan-500" />
                Genuine supplements, curated for quality
              </div>

              <div className="flex items-center gap-3">
                <PackageCheck className="size-5 text-cyan-500" />
                Packed and shipped with care
              </div>
            </div>
          </div>
        </aside>
      </section>

      {product.description && (
        <section className="mt-8 rounded-3xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur sm:p-6 lg:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-600 dark:text-cyan-300">
              Details
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Product Description
            </h2>

            <p className="mt-4 whitespace-pre-line text-base leading-8 text-muted-foreground">
              {product.description}
            </p>
          </div>
        </section>
      )}
    </main>
  )
}