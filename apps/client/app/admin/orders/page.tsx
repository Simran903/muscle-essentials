"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"

import { adminListOrders, toAdminError, type AdminOrderListItem } from "@/lib/admin-api"

import { adminCard, adminTable, adminTableWrap, adminTd, adminTh } from "../admin-styles"

export default function AdminOrdersPage() {
  const [items, setItems] = React.useState<AdminOrderListItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminListOrders(page, 25)
      setItems(res.items)
      setTotalPages(res.pagination.totalPages)
    } catch (e) {
      toast.error(toAdminError(e, "Failed to load orders.").message)
    } finally {
      setLoading(false)
    }
  }, [page])

  React.useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fulfillment and payment status.</p>
      </div>

      <div className={adminCard}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className={adminTableWrap}>
              <table className={adminTable}>
                <thead>
                  <tr>
                    <th className={adminTh}>Order</th>
                    <th className={adminTh}>Customer</th>
                    <th className={adminTh}>Status</th>
                    <th className={adminTh}>Payment</th>
                    <th className={adminTh}>Total</th>
                    <th className={adminTh}>Placed</th>
                    <th className={adminTh} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((o) => (
                    <tr key={o.id}>
                      <td className={adminTd}>
                        <span className="font-mono text-foreground">{o.orderNumber}</span>
                      </td>
                      <td className={adminTd}>{o.user?.email ?? "—"}</td>
                      <td className={adminTd}>{o.status}</td>
                      <td className={adminTd}>{o.paymentStatus}</td>
                      <td className={adminTd}>₹{Number(o.totalAmount).toLocaleString("en-IN")}</td>
                      <td className={adminTd}>{new Date(o.placedAt).toLocaleString()}</td>
                      <td className={adminTd}>
                        <Link href={`/admin/orders/${o.id}`} className="text-sm font-medium text-primary hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <button
                  type="button"
                  className="text-sm font-medium text-foreground disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="text-sm font-medium text-foreground disabled:opacity-40"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
