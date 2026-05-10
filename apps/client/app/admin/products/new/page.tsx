"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Dropdown } from "@/app/components/Common/Dropdown"
import { Button } from "@/app/components/ui/button"
import {
  adminCreateProduct,
  adminListBrands,
  adminListCategories,
  toAdminError,
  type AdminBrand,
  type AdminCategory,
} from "@/lib/admin-api"

import { adminCard, adminInput, adminLabel } from "../../admin-styles"

export default function NewProductPage() {
  const router = useRouter()
  const [brands, setBrands] = React.useState<AdminBrand[]>([])
  const [categories, setCategories] = React.useState<AdminCategory[]>([])
  const [saving, setSaving] = React.useState(false)

  const [title, setTitle] = React.useState("")
  const [brandId, setBrandId] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("")
  const [shortDesc, setShortDesc] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [flavoursRaw, setFlavoursRaw] = React.useState("")
  const [sizeRows, setSizeRows] = React.useState([{ label: "500g", price: "999", costPrice: "600" }])
  const [stockQuantity, setStockQuantity] = React.useState(0)
  const [currency, setCurrency] = React.useState("INR")
  const [isActive, setIsActive] = React.useState(true)
  const [isFeatured, setIsFeatured] = React.useState(false)
  const [isBestseller, setIsBestseller] = React.useState(false)
  const [isDealoftheDay, setIsDealoftheDay] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [b, c] = await Promise.all([
          adminListBrands(1, 200),
          adminListCategories(1, 200),
        ])
        if (cancelled) return
        setBrands(b.items)
        setCategories(c.items)
        if (b.items[0]) setBrandId(b.items[0].id)
      } catch (e) {
        if (!cancelled) toast.error(toAdminError(e, "Could not load brands/categories.").message)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
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
      const { product } = await adminCreateProduct({
        title: title.trim(),
        brandId,
        categoryId: categoryId || null,
        shortDesc,
        description,
        flavours: flavours.length ? flavours : undefined,
        sizes,
        stockQuantity: Number(stockQuantity) || 0,
        currency: currency.trim() || "INR",
        isActive,
        isFeatured,
        isBestseller,
        isDealoftheDay,
      })
      toast.success("Product created.")
      router.push(`/admin/products/${product.id}`)
    } catch (err) {
      toast.error(toAdminError(err, "Create failed.").message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm" className="rounded-md">
          <Link href="/admin/products">← Products</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">New product</h1>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className={`${adminCard} space-y-6`}>
        <p className="text-sm text-muted-foreground">
          URL slug and SKU are generated automatically from the title when the product is created.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={adminLabel} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className={adminInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
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
            placeholder="Chocolate, Vanilla"
          />
        </div>

        <div className="space-y-3">
          <p className={adminLabel}>Sizes &amp; prices</p>
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

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isBestseller}
              onChange={(e) => setIsBestseller(e.target.checked)}
            />
            Bestseller
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isDealoftheDay}
              onChange={(e) => setIsDealoftheDay(e.target.checked)}
            />
            Deal of the day
          </label>
        </div>

        <div className="flex gap-3 border-t border-border/50 pt-4">
          <Button type="submit" disabled={saving} className="rounded-md shadow-none">
            {saving ? "Saving…" : "Create product"}
          </Button>
          <Button asChild type="button" variant="outline" className="rounded-md">
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
