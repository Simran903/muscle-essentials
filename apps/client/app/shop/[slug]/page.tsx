import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, PackageCheck, ShieldCheck, Truck } from "lucide-react"

import { getProductBySlug } from "@/lib/api"
import { ProductGallery } from "../../components/Shop/ProductGallery"
import { ProductPurchasePanel } from "../../components/Shop/ProductPurchasePanel"

type ProductPageProps = {
  params: Promise<{ slug: string }>
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
    <main className="relative isolate mx-auto min-h-svh w-full max-w-7xl overflow-hidden px-4 py-6 text-foreground sm:px-6 sm:py-8 lg:px-10 lg:py-12">

      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/"
          className="rounded-md px-2.5 py-1 transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          Home
        </Link>

        <ChevronRight className="size-4 opacity-50" />

        <Link
          href="/shop"
          className="rounded-md px-2.5 py-1 transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          Shop
        </Link>

        <ChevronRight className="size-4 opacity-50" />

        <span className="line-clamp-1 max-w-[min(100%,28rem)] rounded-md border border-border/60 bg-card/80 px-3 py-1 text-foreground shadow-none">
          {product.title}
        </span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-10">
        <ProductGallery
          images={images}
          productTitle={product.title}
          isDealOfTheDay={product.isDealoftheDay}
        />

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border/60 bg-card/85 p-5 text-card-foreground shadow-none backdrop-blur-sm sm:p-6 lg:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {product.isFeatured && (
                <span className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground dark:border-primary/35 dark:bg-primary/15">
                  Featured
                </span>
              )}

              {product.isBestseller && (
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Bestseller
                </span>
              )}

              <span
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold ${
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

              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.8rem] lg:leading-tight">
                {product.title}
              </h1>

              {product.shortDesc && (
                <p className="text-base leading-7 text-muted-foreground">
                  {product.shortDesc}
                </p>
              )}
            </div>

            <dl className="mt-6">
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 dark:bg-muted/25">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Category
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                  {product.category?.name ?? "Supplements"}
                </dd>
              </div>
            </dl>

            <ProductPurchasePanel
              productId={product.id}
              productTitle={product.title}
              flavours={product.flavours}
              sizes={product.sizes}
              isInStock={isInStock}
              stockQuantity={product.stockQuantity}
            />

            <div className="mt-6 grid gap-3 border-t border-border/50 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-muted-foreground" />
                Fast delivery across India
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-muted-foreground" />
                Genuine supplements, curated for quality
              </div>

              <div className="flex items-center gap-3">
                <PackageCheck className="size-5 text-muted-foreground" />
                Packed and shipped with care
              </div>
            </div>
          </div>
        </aside>
      </section>

      {product.description && (
        <section className="mt-10 rounded-2xl border border-border/50 bg-card/80 p-6 shadow-none backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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