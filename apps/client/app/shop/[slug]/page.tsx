import { notFound } from "next/navigation"

import { getProductBySlug, getProductReviews } from "@/lib/api"

import { ProductShopExperience } from "./ProductShopExperience"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const [product, reviews] = await Promise.all([
    getProductBySlug(slug).catch(() => null),
    getProductReviews(slug),
  ])

  if (!product) {
    notFound()
  }

  return <ProductShopExperience product={product} reviews={reviews} />
}
