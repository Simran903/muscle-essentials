"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { adminListReviews, adminPatchReview, toAdminError, type AdminReview } from "@/lib/admin-api"

import { adminCard, adminTable, adminTableWrap, adminTd, adminTh } from "../admin-styles"

const filters = [undefined, "PENDING", "APPROVED", "REJECTED"] as const

export default function AdminReviewsPage() {
  const [filter, setFilter] = React.useState<(typeof filters)[number]>(undefined)
  const [items, setItems] = React.useState<AdminReview[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminListReviews(1, 100, filter)
      setItems(res.items)
    } catch (e) {
      toast.error(toAdminError(e, "Failed to load reviews.").message)
    } finally {
      setLoading(false)
    }
  }, [filter])

  React.useEffect(() => {
    void load()
  }, [load])

  const moderate = async (r: AdminReview, status: "APPROVED" | "REJECTED") => {
    try {
      await adminPatchReview(r.id, { status })
      toast.success("Review updated.")
      await load()
    } catch (e) {
      toast.error(toAdminError(e, "Moderation failed.").message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">Approve or reject customer reviews.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f ?? "all"}
              type="button"
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className="rounded-md"
              onClick={() => setFilter(f)}
            >
              {f ?? "All"}
            </Button>
          ))}
        </div>
      </div>

      <div className={adminCard}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews in this filter.</p>
        ) : (
          <div className={adminTableWrap}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th className={adminTh}>Product</th>
                  <th className={adminTh}>User</th>
                  <th className={adminTh}>Rating</th>
                  <th className={adminTh}>Status</th>
                  <th className={adminTh}>Review</th>
                  <th className={adminTh} />
                </tr>
              </thead>
              <tbody>
                {items.map((r) => {
                  const variantBits = [r.flavourLabel, r.sizeLabel].filter(Boolean)
                  return (
                  <tr key={r.id}>
                    <td className={`${adminTd} align-top`}>
                      <span className="font-medium text-foreground">{r.product.title}</span>
                      {variantBits.length > 0 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {variantBits.join(" · ")}
                        </p>
                      ) : null}
                    </td>
                    <td className={`${adminTd} align-top`}>{r.user.email ?? r.user.id}</td>
                    <td className={`${adminTd} align-top tabular-nums`}>{r.rating}</td>
                    <td className={`${adminTd} align-top`}>{r.status}</td>
                    <td className={`${adminTd} min-w-[24rem] max-w-160 align-top`}>
                      {r.title || r.body ? (
                        <div className="space-y-1">
                          {r.title ? (
                            <p className="font-medium text-foreground">{r.title}</p>
                          ) : null}
                          {r.body ? (
                            <p className="whitespace-pre-line wrap-break-word text-sm leading-6 text-muted-foreground">
                              {r.body}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${adminTd} align-top`}>
                      {r.status === "PENDING" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-md text-xs"
                            onClick={() => void moderate(r, "APPROVED")}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-md text-xs text-destructive"
                            onClick={() => void moderate(r, "REJECTED")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
