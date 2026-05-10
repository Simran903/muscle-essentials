"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import {
  adminCreateCategory,
  adminDeactivateCategory,
  adminListCategories,
  adminUpdateCategory,
  toAdminError,
  type AdminCategory,
} from "@/lib/admin-api"

import { AdminRowActiveSwitch } from "../AdminRowActiveSwitch"
import { adminCard, adminInput, adminLabel, adminTable, adminTableWrap, adminTd, adminTh } from "../admin-styles"

export default function AdminCategoriesPage() {
  const [items, setItems] = React.useState<AdminCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [name, setName] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [togglingIds, setTogglingIds] = React.useState(() => new Set<string>())

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminListCategories(1, 200)
      setItems(res.items)
    } catch (e) {
      toast.error(toAdminError(e, "Failed to load categories.").message)
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
      await adminCreateCategory({ name: name.trim(), isActive: true })
      toast.success("Category created.")
      setName("")
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

  const toggleCategoryActive = async (c: AdminCategory) => {
    const next = !c.isActive
    setToggling(c.id, true)
    setItems((rows) => rows.map((x) => (x.id === c.id ? { ...x, isActive: next } : x)))
    try {
      await adminUpdateCategory(c.id, { isActive: next })
      toast.success(next ? "Category is now active." : "Category is now inactive.")
    } catch (e) {
      setItems((rows) => rows.map((x) => (x.id === c.id ? { ...x, isActive: c.isActive } : x)))
      toast.error(toAdminError(e, "Could not update active state.").message)
    } finally {
      setToggling(c.id, false)
    }
  }

  const deactivate = async (c: AdminCategory) => {
    if (!confirm(`Deactivate category “${c.name}”?`)) return
    try {
      await adminDeactivateCategory(c.id)
      toast.success("Category deactivated.")
      await load()
    } catch (e) {
      toast.error(toAdminError(e, "Failed.").message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Primary product categories.</p>
      </div>

      <form onSubmit={(e) => void create(e)} className={`${adminCard} flex flex-wrap items-end gap-4`}>
        <div className="space-y-2">
          <label className={adminLabel} htmlFor="c-name">
            Name
          </label>
          <input id="c-name" className={adminInput} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <Button type="submit" disabled={creating} className="rounded-md shadow-none">
          {creating ? "Creating…" : "Create"}
        </Button>
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
                {items.map((c) => (
                  <tr key={c.id}>
                    <td className={adminTd}>
                      <span className="font-medium text-foreground">{c.name}</span>
                    </td>
                    <td className={adminTd}>{c.slug}</td>
                    <td className={adminTd}>{c.productCount}</td>
                    <td className={`${adminTd} align-middle`}>
                      <AdminRowActiveSwitch
                        isActive={c.isActive}
                        disabled={togglingIds.has(c.id)}
                        noun="category"
                        onToggle={() => void toggleCategoryActive(c)}
                      />
                    </td>
                    <td className={adminTd}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-md text-xs text-destructive"
                        onClick={() => void deactivate(c)}
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
