import { notFound } from "next/navigation"

import { getProductBySlug } from "@/lib/api"

import { ProductShopExperience } from "./ProductShopExperience"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await getProductBySlug(slug).catch(() => null)

  if (!product) {
    notFound()
  }

  return <ProductShopExperience product={product} />
}
