import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/api"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await getProductBySlug(slug).catch(() => null)
  if (!product) {
    notFound()
  }

  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0]

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to shop
      </Link>

      <section className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted/40">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
          {product.shortDesc ? <p className="text-muted-foreground">{product.shortDesc}</p> : null}
          <p className="text-2xl font-semibold text-foreground">
            {product.currency} {Number(product.price).toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Brand: {product.brand?.name ?? "Muscle Essentials"}
          </p>
          <p className="text-sm text-muted-foreground">
            Category: {product.category?.name ?? "Supplements"}
          </p>
          <p className="text-sm text-muted-foreground">
            Stock: {product.stockQuantity > 0 ? `${product.stockQuantity} available` : "Out of stock"}
          </p>
        </div>
      </section>
    </main>
  )
}
