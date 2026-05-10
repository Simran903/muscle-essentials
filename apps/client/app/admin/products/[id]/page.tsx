"use client"

import { useParams } from "next/navigation"

import { ProductEditor } from "./ProductEditor"

export default function AdminProductDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? ""

  if (!id) {
    return <p className="text-sm text-muted-foreground">Invalid product.</p>
  }

  return <ProductEditor productId={id} />
}
