"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Dropdown } from "@/app/components/Common/Dropdown"
import { Button } from "@/app/components/ui/button"
import { adminGetOrder, adminPatchOrder, toAdminError } from "@/lib/admin-api"

import { adminCard, adminLabel } from "../../admin-styles"

type OrderDetail = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  currency: string
  subtotalAmount: unknown
  shippingAmount: unknown
  discountAmount: unknown
  taxAmount: unknown
  totalAmount: unknown
  placedAt: string
  user: { id: string; email: string | null; name: string | null } | null
  items: Array<{
    id: string
    productTitle: string
    productSku: string
    quantity: number
    unitPrice: unknown
    lineTotal: unknown
  }>
}

const orderStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const
const paymentStatuses = ["PENDING", "REQUIRES_ACTION", "PAID", "FAILED", "REFUNDED"] as const

export default function AdminOrderDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? ""
  const [order, setOrder] = React.useState<OrderDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<string>("")
  const [paymentStatus, setPaymentStatus] = React.useState<string>("")

  const load = React.useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const raw = (await adminGetOrder(id)) as OrderDetail
      setOrder(raw)
      setStatus(raw.status)
      setPaymentStatus(raw.paymentStatus)
    } catch (e) {
      toast.error(toAdminError(e, "Could not load order.").message)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    if (!id) return
    const body: { status?: string; paymentStatus?: string } = {}
    if (status !== order?.status) body.status = status
    if (paymentStatus !== order?.paymentStatus) body.paymentStatus = paymentStatus
    if (Object.keys(body).length === 0) {
      toast.message("No status changes.")
      return
    }
    setSaving(true)
    try {
      await adminPatchOrder(id, body)
      toast.success("Order updated.")
      await load()
    } catch (e) {
      toast.error(toAdminError(e, "Update failed.").message)
    } finally {
      setSaving(false)
    }
  }

  if (!id) return <p className="text-sm text-muted-foreground">Invalid order.</p>
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (!order) {
    return (
      <p className="text-sm text-muted-foreground">
        Order not found.{" "}
        <Link href="/admin/orders" className="text-primary underline">
          Back
        </Link>
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm" className="rounded-lg">
          <Link href="/admin/orders">← Orders</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Order {order.orderNumber}
        </h1>
      </div>

      <div className={`${adminCard} grid gap-4 sm:grid-cols-2`}>
        <div>
          <p className={adminLabel}>Customer</p>
          <p className="mt-1 text-sm text-foreground">{order.user?.email ?? "—"}</p>
          {order.user?.name ? (
            <p className="text-sm text-muted-foreground">{order.user.name}</p>
          ) : null}
        </div>
        <div>
          <p className={adminLabel}>Placed</p>
          <p className="mt-1 text-sm text-foreground">{new Date(order.placedAt).toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <span className={adminLabel}>Order status</span>
          <Dropdown value={status} onChange={setStatus} options={[...orderStatuses]} />
        </div>
        <div className="space-y-2">
          <span className={adminLabel}>Payment status</span>
          <Dropdown value={paymentStatus} onChange={setPaymentStatus} options={[...paymentStatuses]} />
        </div>
        <div className="sm:col-span-2">
          <Button type="button" disabled={saving} className="rounded-lg shadow-none" onClick={() => void save()}>
            {saving ? "Saving…" : "Save status"}
          </Button>
        </div>
      </div>

      <div className={adminCard}>
        <h2 className="text-lg font-semibold text-foreground">Line items</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((line) => (
            <li
              key={line.id}
              className="flex flex-wrap justify-between gap-2 border-b border-border/40 pb-3 text-sm last:border-0"
            >
              <span className="text-foreground">
                {line.productTitle}{" "}
                <span className="text-muted-foreground">×{line.quantity}</span>
              </span>
              <span className="tabular-nums text-muted-foreground">₹{Number(line.lineTotal).toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-base font-semibold text-foreground">
          Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")} {order.currency}
        </p>
      </div>
    </div>
  )
}
