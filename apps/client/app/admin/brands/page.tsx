"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import {
  adminCreateBrand,
  adminDeactivateBrand,
  adminListBrands,
  adminUpdateBrand,
  toAdminError,
  type AdminBrand,
} from "@/lib/admin-api"

import { AdminRowActiveSwitch } from "../AdminRowActiveSwitch"
import { adminCard, adminInput, adminLabel, adminTable, adminTableWrap, adminTd, adminTh } from "../admin-styles"

export default function AdminBrandsPage() {
  const [items, setItems] = React.useState<AdminBrand[]>([])
  const [loading, setLoading] = React.useState(true)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [togglingIds, setTogglingIds] = React.useState(() => new Set<string>())

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminListBrands(1, 200)
      setItems(res.items)
    } catch (e) {
      toast.error(toAdminError(e, "Failed to load brands.").message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await adminCreateBrand({
        name: name.trim(),
        description: description.trim() || null,
        isActive: true,
      })
      toast.success("Brand created.")
      setName("")
      setDescription("")
      await load()
    } catch (err) {
      toast.error(toAdminError(err, "Create failed.").message)
    } finally {
      setCreating(false)
    }
  }

  const setToggling = React.useCallback((id: string, on: boolean) => {
    setTogglingIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const toggleBrandActive = async (b: AdminBrand) => {
    const next = !b.isActive
    setToggling(b.id, true)
    setItems((rows) => rows.map((x) => (x.id === b.id ? { ...x, isActive: next } : x)))
    try {
      await adminUpdateBrand(b.id, { isActive: next })
      toast.success(next ? "Brand is now active." : "Brand is now inactive.")
    } catch (e) {
      setItems((rows) => rows.map((x) => (x.id === b.id ? { ...x, isActive: b.isActive } : x)))
      toast.error(toAdminError(e, "Could not update active state.").message)
    } finally {
      setToggling(b.id, false)
    }
  }

  const deactivate = async (b: AdminBrand) => {
    if (!confirm(`Deactivate brand “${b.name}”?`)) return
    try {
      await adminDeactivateBrand(b.id)
      toast.success("Brand deactivated.")
      await load()
    } catch (e) {
      toast.error(toAdminError(e, "Failed.").message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Brands</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage supplier and house brands. URL slugs are generated from the name when a brand is created.
        </p>
      </div>

      <form onSubmit={(e) => void create(e)} className={`${adminCard} grid gap-4 sm:grid-cols-3`}>
        <div className="space-y-2 sm:col-span-1">
          <label className={adminLabel} htmlFor="b-name">
            Name
          </label>
          <input id="b-name" className={adminInput} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2 sm:col-span-3">
          <label className={adminLabel} htmlFor="b-desc">
            Description (optional)
          </label>
          <input
            id="b-desc"
            className={adminInput}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="sm:col-span-3">
          <Button type="submit" disabled={creating} className="rounded-lg shadow-none">
            {creating ? "Creating…" : "Create brand"}
          </Button>
        </div>
      </form>

      <div className={adminCard}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className={adminTableWrap}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th className={adminTh}>Name</th>
                  <th className={adminTh}>Slug</th>
                  <th className={adminTh}>Products</th>
                  <th className={adminTh}>Active</th>
                  <th className={adminTh} />
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id}>
                    <td className={adminTd}>
                      <span className="font-medium text-foreground">{b.name}</span>
                    </td>
                    <td className={adminTd}>{b.slug}</td>
                    <td className={adminTd}>{b.productCount ?? "—"}</td>
                    <td className={`${adminTd} align-middle`}>
                      <AdminRowActiveSwitch
                        isActive={b.isActive}
                        disabled={togglingIds.has(b.id)}
                        noun="brand"
                        onToggle={() => void toggleBrandActive(b)}
                      />
                    </td>
                    <td className={adminTd}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs text-destructive"
                        onClick={() => void deactivate(b)}
                      >
                        Deactivate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
