"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Dropdown } from "@/app/components/Common/Dropdown"
import { Button } from "@/app/components/ui/button"
import {
  adminDeactivateProduct,
  adminGetProduct,
  adminListBrands,
  adminListCategories,
  adminPutVariantSpotlights,
  adminUpdateProduct,
  toAdminError,
  type AdminBrand,
  type AdminCategory,
  type AdminProduct,
  type VariantSpotlightInput,
  type ProductDietType,
} from "@/lib/admin-api"

import { adminCard, adminInput, adminLabel } from "../../admin-styles"
import { ProductImagesSection } from "./ProductImagesSection"

function spotlightKey(fl: string, sz: string) {
  return `${fl}\0${sz}`
}

function buildSpotlightMap(product: AdminProduct): Map<string, VariantSpotlightInput> {
  const flavours = product.flavours.length ? product.flavours.map((f) => f.label) : [""]
  const sizes = product.sizes.map((s) => s.label)
  const fromDb = new Map(
    product.variantSpotlights.map((v) => [
      spotlightKey(v.flavourLabel, v.sizeLabel),
      {
        flavourLabel: v.flavourLabel,
        sizeLabel: v.sizeLabel,
        isFeatured: v.isFeatured,
        isBestseller: v.isBestseller,
        isDealoftheDay: v.isDealoftheDay,
      },
    ]),
  )
  const m = new Map<string, VariantSpotlightInput>()
  for (const fl of flavours) {
    for (const sz of sizes) {
      const k = spotlightKey(fl, sz)
      m.set(k, fromDb.get(k) ?? { flavourLabel: fl, sizeLabel: sz, isFeatured: false, isBestseller: false, isDealoftheDay: false })
    }
  }
  return m
}

export function ProductEditor({ productId }: { productId: string }) {
  const router = useRouter()
  const [product, setProduct] = React.useState<AdminProduct | null>(null)
  const [brands, setBrands] = React.useState<AdminBrand[]>([])
  const [categories, setCategories] = React.useState<AdminCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [savingSpotlights, setSavingSpotlights] = React.useState(false)

  const [title, setTitle] = React.useState("")
  const [brandId, setBrandId] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("")
  const [shortDesc, setShortDesc] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [flavoursRaw, setFlavoursRaw] = React.useState("")
  const [sizeRows, setSizeRows] = React.useState<{ label: string; price: string; costPrice: string }[]>([])
  const [stockQuantity, setStockQuantity] = React.useState(0)
  const [currency, setCurrency] = React.useState("INR")
  const [isActive, setIsActive] = React.useState(true)
  const [isFeatured, setIsFeatured] = React.useState(false)
  const [isBestseller, setIsBestseller] = React.useState(false)
  const [isDealoftheDay, setIsDealoftheDay] = React.useState(false)
  const [dietType, setDietType] = React.useState<ProductDietType>("NON_VEG")

  const [spotlightMap, setSpotlightMap] = React.useState<Map<string, VariantSpotlightInput>>(new Map())

  const loadProduct = React.useCallback(async () => {
    setLoading(true)
    try {
      const [p, b, c] = await Promise.all([
        adminGetProduct(productId),
        adminListBrands(1, 200),
        adminListCategories(1, 200),
      ])
      setProduct(p)
      setBrands(b.items)
      setCategories(c.items)
      setTitle(p.title)
      setBrandId(p.brand?.id ?? "")
      setCategoryId(p.categoryId ?? "")
      setShortDesc(p.shortDesc)
      setDescription(p.description)
      setFlavoursRaw(p.flavours.map((f) => f.label).join(", "))
      setSizeRows(
        p.sizes.map((s) => ({
          label: s.label,
          price: String(s.price),
          costPrice: String(s.costPrice ?? "0"),
        })),
      )
      setStockQuantity(p.stockQuantity)
      setCurrency(p.currency)
      setIsActive(p.isActive)
      setIsFeatured(p.isFeatured)
      setIsBestseller(p.isBestseller)
      setIsDealoftheDay(p.isDealoftheDay)
      setDietType(p.dietType)
      setSpotlightMap(buildSpotlightMap(p))
    } catch (e) {
      toast.error(toAdminError(e, "Could not load product.").message)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [productId])

  React.useEffect(() => {
    void loadProduct()
  }, [loadProduct])

  const updateSpotlight = (key: string, patch: Partial<VariantSpotlightInput>) => {
    setSpotlightMap((prev) => {
      const next = new Map(prev)
      const cur = next.get(key)
      if (!cur) return prev
      next.set(key, { ...cur, ...patch })
      return next
    })
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const flavours = flavoursRaw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
      const sizes = sizeRows
        .filter((r) => r.label.trim() && r.price.trim())
        .map((r) => ({
          label: r.label.trim(),
          price: r.price.trim(),
          costPrice: r.costPrice.trim() || undefined,
        }))
      if (sizes.length === 0) {
        toast.error("Add at least one size with price.")
        setSaving(false)
        return
      }
      if (!brandId.trim()) {
        toast.error("Select a brand.")
        setSaving(false)
        return
      }
      await adminUpdateProduct(productId, {
        title: title.trim(),
        brandId,
        categoryId: categoryId || null,
        shortDesc,
        description,
        flavours,
        sizes,
        stockQuantity: Number(stockQuantity) || 0,
        currency: currency.trim() || "INR",
        isActive,
        isFeatured,
        isBestseller,
        isDealoftheDay,
        dietType,
      })
      toast.success("Product saved.")
      await loadProduct()
    } catch (err) {
      toast.error(toAdminError(err, "Save failed.").message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSpotlights = async () => {
    setSavingSpotlights(true)
    try {
      const spotlights = [...spotlightMap.values()].filter(
        (r) => r.isFeatured || r.isBestseller || r.isDealoftheDay,
      )
      await adminPutVariantSpotlights(productId, spotlights)
      toast.success("Variant spotlights saved.")
      await loadProduct()
    } catch (err) {
      toast.error(toAdminError(err, "Spotlights save failed.").message)
    } finally {
      setSavingSpotlights(false)
    }
  }

  const handleDeactivate = async () => {
    if (!confirm("Deactivate this product? It will be hidden from the catalog.")) return
    try {
      await adminDeactivateProduct(productId)
      toast.success("Product deactivated.")
      router.push("/admin/products")
    } catch (e) {
      toast.error(toAdminError(e, "Could not deactivate.").message)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading product…</p>
  }
  if (!product) {
    return (
      <p className="text-sm text-muted-foreground">
        Product not found.{" "}
        <Link href="/admin/products" className="text-primary underline">
          Back to list
        </Link>
      </p>
    )
  }

  const spotlightRows = [...spotlightMap.entries()]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-md">
            <Link href="/admin/products">← Products</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit product</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-md border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => void handleDeactivate()}
        >
          Deactivate
        </Button>
      </div>

      <form onSubmit={(e) => void handleSaveProduct(e)} className={`${adminCard} space-y-6`}>
        <h2 className="text-lg font-semibold text-foreground">Details</h2>
        <div className="rounded-lg border border-border/50 bg-muted/15 px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Slug</span> and{" "}
            <span className="font-medium text-foreground">SKU</span> are set at creation and cannot be edited here.
          </p>
          <dl className="mt-2 grid gap-1 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Slug</dt>
              <dd className="font-mono text-foreground">{product.slug}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">SKU</dt>
              <dd className="font-mono text-foreground">{product.sku}</dd>
            </div>
          </dl>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={adminLabel} htmlFor="title">
              Title
            </label>
            <input id="title" className={adminInput} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className={adminLabel} htmlFor="currency">
              Currency
            </label>
            <input
              id="currency"
              className={adminInput}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className={adminLabel}>Brand</span>
            <Dropdown
              value={brandId}
              onChange={setBrandId}
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
              searchable={brands.length > 8}
              searchPlaceholder="Search brands…"
            />
          </div>
          <div className="space-y-2">
            <span className={adminLabel}>Category</span>
            <Dropdown
              value={categoryId}
              onChange={setCategoryId}
              options={[
                { value: "", label: "— None —" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              searchable={categories.length > 8}
              searchPlaceholder="Search categories…"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={adminLabel} htmlFor="shortDesc">
            Short description
          </label>
          <textarea
            id="shortDesc"
            className={`${adminInput} min-h-[80px] py-2`}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <label className={adminLabel} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className={`${adminInput} min-h-[120px] py-2`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <label className={adminLabel} htmlFor="flavours">
            Flavours (comma or newline separated)
          </label>
          <textarea
            id="flavours"
            className={`${adminInput} min-h-[72px] py-2`}
            value={flavoursRaw}
            onChange={(e) => setFlavoursRaw(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <p className={adminLabel}>Sizes &amp; prices</p>
          <p className="text-xs text-muted-foreground">
            Saving sizes or flavours clears variant spotlight rows until you save spotlights again.
          </p>
          {sizeRows.map((row, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                className={`${adminInput} max-w-[140px]`}
                placeholder="Label"
                value={row.label}
                onChange={(e) => {
                  const next = [...sizeRows]
                  next[i] = { ...next[i]!, label: e.target.value }
                  setSizeRows(next)
                }}
              />
              <input
                className={`${adminInput} max-w-[120px]`}
                placeholder="Price"
                value={row.price}
                onChange={(e) => {
                  const next = [...sizeRows]
                  next[i] = { ...next[i]!, price: e.target.value }
                  setSizeRows(next)
                }}
              />
              <input
                className={`${adminInput} max-w-[120px]`}
                placeholder="Cost"
                value={row.costPrice}
                onChange={(e) => {
                  const next = [...sizeRows]
                  next[i] = { ...next[i]!, costPrice: e.target.value }
                  setSizeRows(next)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={() => setSizeRows(sizeRows.filter((_, j) => j !== i))}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md"
            onClick={() => setSizeRows([...sizeRows, { label: "", price: "", costPrice: "" }])}
          >
            Add size
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={adminLabel} htmlFor="stock">
              Stock quantity
            </label>
            <input
              id="stock"
              type="number"
              min={0}
              className={adminInput}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={adminLabel} htmlFor="diet-type">
            Diet type
          </label>
          <select
            id="diet-type"
            className={adminInput}
            value={dietType}
            onChange={(e) => setDietType(e.target.value as ProductDietType)}
          >
            <option value="VEG">Vegetarian</option>
            <option value="NON_VEG">Non-vegetarian</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured (product-wide)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} />
            Bestseller (product-wide)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isDealoftheDay}
              onChange={(e) => setIsDealoftheDay(e.target.checked)}
            />
            Deal of the day (product-wide)
          </label>
        </div>

        <Button type="submit" disabled={saving} className="rounded-md shadow-none">
          {saving ? "Saving…" : "Save product"}
        </Button>
      </form>

      <div className={`${adminCard} space-y-4`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Variant spotlights</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Per flavour × size flags (featured, bestseller, deal). Only checked combinations are stored.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-md"
            disabled={savingSpotlights}
            onClick={() => void handleSaveSpotlights()}
          >
            {savingSpotlights ? "Saving…" : "Save spotlights"}
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/25">
                <th className="px-3 py-2 font-semibold">Flavour</th>
                <th className="px-3 py-2 font-semibold">Size</th>
                <th className="px-3 py-2 font-semibold">Featured</th>
                <th className="px-3 py-2 font-semibold">Bestseller</th>
                <th className="px-3 py-2 font-semibold">Deal</th>
              </tr>
            </thead>
            <tbody>
              {spotlightRows.map(([key, row]) => (
                <tr key={key} className="border-b border-border/40">
                  <td className="px-3 py-2 text-muted-foreground">{row.flavourLabel || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.sizeLabel}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={row.isFeatured}
                      onChange={(e) => updateSpotlight(key, { isFeatured: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={row.isBestseller}
                      onChange={(e) => updateSpotlight(key, { isBestseller: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={row.isDealoftheDay}
                      onChange={(e) => updateSpotlight(key, { isDealoftheDay: e.target.checked })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={adminCard}>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Images</h2>
        <ProductImagesSection productId={productId} />
      </div>

      <p className="text-sm text-muted-foreground">
        Storefront:{" "}
        <Link
          href={`/shop/${product.slug}`}
          className="font-medium text-primary hover:underline"
          target="_blank"
        >
          /shop/{product.slug}
        </Link>
      </p>
    </div>
  )
}
