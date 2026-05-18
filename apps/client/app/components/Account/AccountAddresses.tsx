"use client"

import * as React from "react"
import {
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  Truck,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { InputField } from "@/app/components/Common/InputField"
import {
  createAccountAddress,
  deleteAccountAddress,
  updateAccountAddress,
  type AccountAddress,
  type AddressInput,
} from "@/lib/api"
import { cn } from "@/lib/utils"

type AddressType = "SHIPPING" | "BILLING"

type FormState = {
  label: string
  fullName: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  countryCode: string
  phone: string
  type: AddressType | ""
  isDefault: boolean
}

const EMPTY_FORM: FormState = {
  label: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "IN",
  phone: "",
  type: "SHIPPING",
  isDefault: false,
}

function toFormState(a: AccountAddress): FormState {
  return {
    label: a.label ?? "",
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state ?? "",
    postalCode: a.postalCode,
    countryCode: a.countryCode,
    phone: a.phone ?? "",
    type: (a.type ?? "") as AddressType | "",
    isDefault: a.isDefault,
  }
}

/** Server validation expects required fields; trim + reject empties before sending. */
function toPayload(form: FormState): AddressInput | { error: string } {
  const fullName = form.fullName.trim()
  const line1 = form.line1.trim()
  const city = form.city.trim()
  const postalCode = form.postalCode.trim()
  const countryCode = form.countryCode.trim().toUpperCase()

  if (!fullName) return { error: "Full name is required." }
  if (!line1) return { error: "Address line 1 is required." }
  if (!city) return { error: "City is required." }
  if (!postalCode) return { error: "Postal code is required." }
  if (countryCode.length !== 2) {
    return { error: "Country code must be 2 letters (eg. IN, US, GB)." }
  }

  return {
    label: form.label.trim() ? form.label.trim() : null,
    fullName,
    line1,
    line2: form.line2.trim() ? form.line2.trim() : null,
    city,
    state: form.state.trim() ? form.state.trim() : null,
    postalCode,
    countryCode,
    phone: form.phone.trim() ? form.phone.trim() : null,
    type: form.type === "" ? null : form.type,
    isDefault: form.isDefault,
  }
}

function typeIcon(type: AccountAddress["type"]) {
  if (type === "SHIPPING") return Truck
  if (type === "BILLING") return Building2
  return MapPin
}

function typeLabel(type: AccountAddress["type"]): string {
  if (type === "SHIPPING") return "Shipping"
  if (type === "BILLING") return "Billing"
  return "Address"
}

function fieldLabelClass(): string {
  return "text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
}

function AddressCard({
  address,
  busy,
  onEdit,
  onDelete,
  onMakeDefault,
}: {
  address: AccountAddress
  busy: boolean
  onEdit: (a: AccountAddress) => void
  onDelete: (a: AccountAddress) => void
  onMakeDefault: (a: AccountAddress) => void
}) {
  const Icon = typeIcon(address.type)
  return (
    <article className="relative flex flex-col gap-3 rounded-xl border border-border/50 bg-card/70 p-5 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/60 text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {address.label?.trim() || typeLabel(address.type)}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {typeLabel(address.type)}
            </p>
          </div>
        </div>
        {address.isDefault ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Star className="size-3 fill-current" /> Default
          </span>
        ) : null}
      </div>

      <div className="text-sm leading-6 text-foreground">
        <p className="font-medium">{address.fullName}</p>
        <p className="text-muted-foreground">{address.line1}</p>
        {address.line2 ? (
          <p className="text-muted-foreground">{address.line2}</p>
        ) : null}
        <p className="text-muted-foreground">
          {address.city}
          {address.state ? `, ${address.state}` : ""} {address.postalCode}
        </p>
        <p className="text-muted-foreground">{address.countryCode}</p>
        {address.phone ? (
          <p className="text-muted-foreground">{address.phone}</p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-md text-xs"
          onClick={() => onEdit(address)}
          disabled={busy}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
        {!address.isDefault ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-md text-xs"
            onClick={() => onMakeDefault(address)}
            disabled={busy}
          >
            <Star className="size-3.5" />
            Set default
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-md text-xs text-destructive hover:text-destructive"
          onClick={() => onDelete(address)}
          disabled={busy}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </article>
  )
}

function AddressFormDialog({
  open,
  mode,
  initialForm,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: "create" | "edit"
  initialForm: FormState
  onClose: () => void
  onSubmit: (input: AddressInput) => Promise<void>
}) {
  const [form, setForm] = React.useState<FormState>(initialForm)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset form whenever a new edit/create session opens so stale state from
  // a previous open doesn't leak across rows.
  const [trackedKey, setTrackedKey] = React.useState(open ? "open" : "closed")
  if (open && trackedKey === "closed") {
    setTrackedKey("open")
    setForm(initialForm)
    setError(null)
  } else if (!open && trackedKey === "open") {
    setTrackedKey("closed")
  }

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose, submitting])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const payload = toPayload(form)
    if ("error" in payload) {
      setError(payload.error)
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save address.")
    } finally {
      setSubmitting(false)
    }
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close address form"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={() => {
          if (!submitting) onClose()
        }}
      />
      <div className="relative z-10 max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border/60 bg-card/95 p-6 shadow-xl backdrop-blur-sm sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "create" ? "Add a new address" : "Edit address"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Used at checkout so we can ship orders to the right place.
            </p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="addr-label" className={fieldLabelClass()}>
                Label (optional)
              </label>
              <InputField
                id="addr-label"
                placeholder="Home, Office, …"
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                maxLength={100}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-type" className={fieldLabelClass()}>
                Type
              </label>
              <select
                id="addr-type"
                value={form.type}
                onChange={(e) =>
                  set("type", e.target.value as AddressType | "")
                }
                disabled={submitting}
                className={cn(
                  "h-9 w-full rounded-xl border border-input/80 bg-background px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow]",
                  "focus-visible:border-cyan-500/45 focus-visible:ring-2 focus-visible:ring-cyan-500/15",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <option value="SHIPPING">Shipping</option>
                <option value="BILLING">Billing</option>
                <option value="">Unspecified</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="addr-fullName" className={fieldLabelClass()}>
              Full name
            </label>
            <InputField
              id="addr-fullName"
              required
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Jane Doe"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="addr-line1" className={fieldLabelClass()}>
              Address line 1
            </label>
            <InputField
              id="addr-line1"
              required
              value={form.line1}
              onChange={(e) => set("line1", e.target.value)}
              placeholder="Street, building, etc."
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="addr-line2" className={fieldLabelClass()}>
              Address line 2 (optional)
            </label>
            <InputField
              id="addr-line2"
              value={form.line2}
              onChange={(e) => set("line2", e.target.value)}
              placeholder="Apartment, suite, landmark"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="addr-city" className={fieldLabelClass()}>
                City
              </label>
              <InputField
                id="addr-city"
                required
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-state" className={fieldLabelClass()}>
                State
              </label>
              <InputField
                id="addr-state"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-postal" className={fieldLabelClass()}>
                Postal code
              </label>
              <InputField
                id="addr-postal"
                required
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="addr-country" className={fieldLabelClass()}>
                Country (ISO-2)
              </label>
              <InputField
                id="addr-country"
                required
                value={form.countryCode}
                onChange={(e) =>
                  set("countryCode", e.target.value.toUpperCase())
                }
                maxLength={2}
                placeholder="IN"
                disabled={submitting}
                className="uppercase tracking-widest"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-phone" className={fieldLabelClass()}>
                Phone (optional)
              </label>
              <InputField
                id="addr-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                maxLength={32}
                disabled={submitting}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
              checked={form.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              disabled={submitting}
            />
            <span className="leading-snug">
              <span className="block font-medium text-foreground">
                Set as default
              </span>
              <span className="text-xs text-muted-foreground">
                Selected automatically at checkout for this address type.
              </span>
            </span>
          </label>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-md"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="rounded-md px-6 shadow-none"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : mode === "create" ? (
                <>
                  <CheckCircle2 className="size-4" /> Save address
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, busy, onCancel])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={() => {
          if (!busy) onCancel()
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/60 bg-card/95 p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-md"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="lg"
            className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Removing…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

type AccountAddressesProps = {
  addresses: AccountAddress[]
  accessToken: string | null
  onChange: (next: AccountAddress[]) => void
  /** Merges with default `mt-8` so the section can sit flush in custom layouts. */
  className?: string
}

export function AccountAddresses({
  addresses,
  accessToken,
  onChange,
  className,
}: AccountAddressesProps) {
  type DialogState =
    | { kind: "closed" }
    | { kind: "create" }
    | { kind: "edit"; address: AccountAddress }

  const [dialog, setDialog] = React.useState<DialogState>({ kind: "closed" })
  const [pendingDelete, setPendingDelete] =
    React.useState<AccountAddress | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const openCreate = () => setDialog({ kind: "create" })
  const openEdit = (address: AccountAddress) =>
    setDialog({ kind: "edit", address })
  const closeDialog = () => setDialog({ kind: "closed" })

  const handleSave = async (input: AddressInput) => {
    if (!accessToken) {
      toast.error("Please sign in again.")
      return
    }
    if (dialog.kind === "create") {
      const created = await createAccountAddress(accessToken, input)
      // A new default flips every other row's default flag server-side, so
      // optimistically mirror that here for a snappy UI.
      const next = input.isDefault
        ? addresses.map((a) =>
            a.type === created.type ? { ...a, isDefault: false } : a,
          )
        : addresses.slice()
      next.unshift(created)
      onChange(next)
      toast.success("Address added.")
      closeDialog()
      return
    }
    if (dialog.kind === "edit") {
      const updated = await updateAccountAddress(
        accessToken,
        dialog.address.id,
        input,
      )
      const next = addresses.map((a) => {
        if (a.id === updated.id) return updated
        if (input.isDefault && a.type === updated.type) {
          return { ...a, isDefault: false }
        }
        return a
      })
      onChange(next)
      toast.success("Address updated.")
      closeDialog()
    }
  }

  const handleMakeDefault = async (address: AccountAddress) => {
    if (!accessToken) {
      toast.error("Please sign in again.")
      return
    }
    setBusyId(address.id)
    try {
      const updated = await updateAccountAddress(accessToken, address.id, {
        isDefault: true,
      })
      const next = addresses.map((a) => {
        if (a.id === updated.id) return updated
        if (a.type === updated.type) return { ...a, isDefault: false }
        return a
      })
      onChange(next)
      toast.success("Default address updated.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update default.")
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete || !accessToken) return
    setDeleting(true)
    try {
      await deleteAccountAddress(accessToken, pendingDelete.id)
      onChange(addresses.filter((a) => a.id !== pendingDelete.id))
      toast.success("Address removed.")
      setPendingDelete(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete address.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className={cn("mt-8", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Saved addresses
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage where we ship your orders. Set a default per type for a
            faster checkout.
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          size="lg"
          className="rounded-md px-5 shadow-none"
          onClick={openCreate}
          disabled={!accessToken}
        >
          <Plus className="size-4" />
          Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
          <MapPin className="mx-auto size-7 text-muted-foreground" />
          <p className="mt-3 text-base font-semibold text-foreground">
            No addresses saved yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add one and we&apos;ll prefill it during checkout.
          </p>
          <Button
            type="button"
            size="lg"
            className="mt-4 rounded-md px-5"
            onClick={openCreate}
            disabled={!accessToken}
          >
            <Plus className="size-4" /> Add your first address
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              busy={busyId === a.id}
              onEdit={openEdit}
              onDelete={(addr) => setPendingDelete(addr)}
              onMakeDefault={handleMakeDefault}
            />
          ))}
        </div>
      )}

      <AddressFormDialog
        open={dialog.kind !== "closed"}
        mode={dialog.kind === "edit" ? "edit" : "create"}
        initialForm={
          dialog.kind === "edit" ? toFormState(dialog.address) : EMPTY_FORM
        }
        onClose={closeDialog}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove this address?"
        description={
          pendingDelete
            ? `${pendingDelete.fullName} — ${pendingDelete.line1}, ${pendingDelete.city}. This can't be undone.`
            : ""
        }
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  )
}
