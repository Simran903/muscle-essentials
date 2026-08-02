"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { adminListProducts, adminUpdateProduct, toAdminError, type AdminProduct } from "@/lib/admin-api"

import { AdminRowActiveSwitch } from "../AdminRowActiveSwitch"
import { adminCard, adminTable, adminTableWrap, adminTd, adminTh } from "../admin-styles"

export default function AdminProductsPage() {
  const [page, setPage] = React.useState(1)
  const [data, setData] = React.useState<{ items: AdminProduct[]; totalPages: number } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [togglingIds, setTogglingIds] = React.useState(() => new Set<string>())

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminListProducts(page, 20)
      setData({ items: res.items, totalPages: res.pagination.totalPages })
    } catch (e) {
      toast.error(toAdminError(e, "Failed to load products.").message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page])

  React.useEffect(() => {
    void load()
  }, [load])

  const setToggling = React.useCallback((id: string, on: boolean) => {
    setTogglingIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const toggleProductActive = async (p: AdminProduct) => {
    const next = !p.isActive
    setToggling(p.id, true)
    setData((d) =>
      d ? { ...d, items: d.items.map((x) => (x.id === p.id ? { ...x, isActive: next } : x)) } : d,
    )
    try {
      await adminUpdateProduct(p.id, { isActive: next })
      toast.success(next ? "Product is now active." : "Product is now inactive.")
    } catch (e) {
      setData((d) =>
        d ? { ...d, items: d.items.map((x) => (x.id === p.id ? { ...x, isActive: p.isActive } : x)) } : d,
      )
      toast.error(toAdminError(e, "Could not update active state.").message)
    } finally {
      setToggling(p.id, false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit, and deactivate catalog items.</p>
        </div>
        <Button asChild className="rounded-lg shadow-none">
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>

      <div className={adminCard}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data?.items.length ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <>
            <div className={adminTableWrap}>
              <table className={adminTable}>
                <thead>
                  <tr>
                    <th className={adminTh}>Title</th>
                    <th className={adminTh}>SKU</th>
                    <th className={adminTh}>Brand</th>
                    <th className={adminTh}>Stock</th>
                    <th className={adminTh}>Active</th>
                    <th className={adminTh} />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id}>
                      <td className={adminTd}>
                        <span className="font-medium text-foreground">{p.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{p.slug}</span>
                      </td>
                      <td className={adminTd}>{p.sku}</td>
                      <td className={adminTd}>{p.brand?.name ?? "—"}</td>
                      <td className={adminTd}>{p.stockQuantity}</td>
                      <td className={`${adminTd} align-middle`}>
                        <AdminRowActiveSwitch
                          isActive={p.isActive}
                          disabled={togglingIds.has(p.id)}
                          noun="product"
                          onToggle={() => void toggleProductActive(p)}
                        />
                      </td>
                      <td className={adminTd}>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/50 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
