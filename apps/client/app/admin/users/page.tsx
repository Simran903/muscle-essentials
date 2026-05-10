"use client"

import * as React from "react"
import { toast } from "sonner"

import { Dropdown } from "@/app/components/Common/Dropdown"
import { adminListUsers, adminPatchUser, toAdminError, type AdminUser } from "@/lib/admin-api"

import { adminCard, adminTable, adminTableWrap, adminTd, adminTh } from "../admin-styles"

export default function AdminUsersPage() {
  const [items, setItems] = React.useState<AdminUser[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminListUsers(1, 100)
      setItems(res.items)
    } catch (e) {
      toast.error(toAdminError(e, "Failed to load users.").message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const patch = async (u: AdminUser, body: { role?: "CUSTOMER" | "ADMIN"; status?: "ACTIVE" | "SUSPENDED" }) => {
    try {
      await adminPatchUser(u.id, body)
      toast.success("User updated.")
      await load()
    } catch (e) {
      toast.error(toAdminError(e, "Update failed.").message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Roles and account status.</p>
      </div>

      <div className={adminCard}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className={adminTableWrap}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th className={adminTh}>Email</th>
                  <th className={adminTh}>Role</th>
                  <th className={adminTh}>Status</th>
                  <th className={adminTh}>Joined</th>
                  <th className={adminTh} />
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id}>
                    <td className={adminTd}>{u.email ?? u.id}</td>
                    <td className={adminTd}>
                      <Dropdown
                        className="min-w-0! max-w-[180px]"
                        value={u.role}
                        onChange={(v) => void patch(u, { role: v as "CUSTOMER" | "ADMIN" })}
                        options={[
                          { value: "CUSTOMER", label: "CUSTOMER" },
                          { value: "ADMIN", label: "ADMIN" },
                        ]}
                      />
                    </td>
                    <td className={adminTd}>
                      <Dropdown
                        className="min-w-0! max-w-[180px]"
                        value={u.status}
                        onChange={(v) => void patch(u, { status: v as "ACTIVE" | "SUSPENDED" })}
                        options={[
                          { value: "ACTIVE", label: "ACTIVE" },
                          { value: "SUSPENDED", label: "SUSPENDED" },
                        ]}
                      />
                    </td>
                    <td className={adminTd}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className={adminTd} />
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
