"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiRequest,
  getApiOrigin,
  getStoredToken,
  setApiOrigin,
  setStoredToken,
  type ApiResult,
} from "@/lib/api";

const LABEL_CLS =
  "mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

function tryCaptureAccessToken(json: unknown): void {
  if (!json || typeof json !== "object") return;
  const o = json as Record<string, unknown>;
  const data = o.data;
  if (!data || typeof data !== "object") return;
  const token = (data as Record<string, unknown>).accessToken;
  if (typeof token === "string" && token.length > 0) {
    setStoredToken(token);
  }
}

function JsonView({ value }: { value: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto rounded-lg border border-zinc-200 bg-zinc-950 p-3 text-xs text-zinc-100 dark:border-zinc-800">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles =
    variant === "primary"
      ? "bg-emerald-700 text-white hover:bg-emerald-800"
      : variant === "danger"
        ? "bg-red-700 text-white hover:bg-red-800"
        : "border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

export default function Playground() {
  const [originInput, setOriginInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [last, setLast] = useState<ApiResult | null>(null);
  const [busy, setBusy] = useState(false);

  const syncFromStorage = useCallback(() => {
    setOriginInput(getApiOrigin());
    setTokenInput(getStoredToken());
  }, []);

  useEffect(() => {
    setOriginInput(getApiOrigin());
    setTokenInput(getStoredToken());
  }, []);

  const run = useCallback(
    async (path: string, init: RequestInit & { skipAuth?: boolean } = {}) => {
      setBusy(true);
      setLast(null);
      try {
        const result = await apiRequest(path, init);
        tryCaptureAccessToken(result.json);
        setLast(result);
        setTokenInput(getStoredToken());
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const saveOrigin = () => {
    setApiOrigin(originInput.trim() || getApiOrigin());
    setOriginInput(getApiOrigin());
  };

  const saveToken = () => {
    setStoredToken(tokenInput.trim());
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          API route tester
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Calls the muscle-essentials server. Set CORS to include this origin
          (e.g. <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">http://localhost:3000</code>
          ). Use JSON bodies and{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">Authorization: Bearer</code>{" "}
          from verify-did or refresh.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Connection &amp; auth
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLS} htmlFor="origin">
              API origin (no trailing slash)
            </label>
            <div className="flex gap-2">
              <input
                id="origin"
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={originInput || getApiOrigin()}
                onChange={(e) => setOriginInput(e.target.value)}
                placeholder="http://127.0.0.1:5000"
              />
              <Btn onClick={saveOrigin}>Save</Btn>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLS} htmlFor="token">
              Access token (JWT)
            </label>
            <textarea
              id="token"
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste after verify-did or refresh"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Btn onClick={saveToken}>Save token</Btn>
              <Btn variant="secondary" onClick={() => run("/api/auth/refresh", { method: "POST" })}>
                POST /api/auth/refresh
              </Btn>
              <Btn
                variant="secondary"
                onClick={() => run("/api/auth/logout", { method: "POST" })}
              >
                POST /api/auth/logout
              </Btn>
              <Btn variant="secondary" onClick={syncFromStorage}>
                Reload from storage
              </Btn>
              <Btn variant="danger" onClick={() => { setStoredToken(""); setTokenInput(""); }}>
                Clear token
              </Btn>
            </div>
          </div>
        </div>
      </section>

      {last && (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Last response
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span className={last.ok ? "text-emerald-600" : "text-red-600"}>
              HTTP {last.status}
            </span>
            {" · "}
            {last.ms} ms
          </p>
          <div className="mt-2">
            <JsonView value={last.json} />
          </div>
        </section>
      )}

      <details open className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="cursor-pointer select-none px-4 py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Health
        </summary>
        <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <Btn disabled={busy} onClick={() => run("/health", { skipAuth: true })}>
            GET /health
          </Btn>
        </div>
      </details>

      <details open className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="cursor-pointer select-none px-4 py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Auth
        </summary>
        <div className="space-y-4 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <DidVerifyForm busy={busy} run={run} />
          <div className="flex flex-wrap gap-2">
            <Btn disabled={busy} onClick={() => run("/api/auth/me")}>
              GET /api/auth/me
            </Btn>
          </div>
        </div>
      </details>

      <details className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="cursor-pointer select-none px-4 py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Catalog (public)
        </summary>
        <div className="space-y-4 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <CatalogForms busy={busy} run={run} />
        </div>
      </details>

      <details className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="cursor-pointer select-none px-4 py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Cart · Checkout · Orders · Account
        </summary>
        <div className="space-y-4 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <CartCheckoutForms busy={busy} run={run} />
        </div>
      </details>

      <details className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="cursor-pointer select-none px-4 py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Admin (ADMIN role + Bearer)
        </summary>
        <div className="space-y-4 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <AdminForms busy={busy} run={run} />
        </div>
      </details>
    </div>
  );
}

function DidVerifyForm({
  busy,
  run,
}: {
  busy: boolean;
  run: (path: string, init?: RequestInit & { skipAuth?: boolean }) => Promise<void>;
}) {
  const [publishableKey, setPublishableKey] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [didToken, setDidToken] = useState("");
  const [magicBusy, setMagicBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("muscle_magic_pk");
    setPublishableKey(saved || process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "");
  }, []);

  const savePublishableKey = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem("muscle_magic_pk", publishableKey.trim());
  };

  const loginWithMagic = async () => {
    if (!email.trim()) return;
    const pk = publishableKey.trim();
    if (!pk) return;

    setMagicBusy(true);
    try {
      const { Magic } = await import("magic-sdk");
      const magic = new Magic(pk);
      await magic.auth.loginWithEmailOTP({
        email: email.trim(),
        showUI: true,
      });
      const token = await magic.user.getIdToken();
      setDidToken(token);
      await run("/api/auth/verify-did", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          didToken: token,
          email: email.trim(),
          phone: phone.trim(),
        }),
      });
    } finally {
      setMagicBusy(false);
    }
  };

  return (
    <div>
      <label className={LABEL_CLS}>Magic email OTP login (client SDK + verify-did)</label>
      <input
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        value={publishableKey}
        onChange={(e) => setPublishableKey(e.target.value)}
        placeholder="Magic publishable key (pk_live... / pk_test...)"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn variant="secondary" disabled={busy || magicBusy || !publishableKey.trim()} onClick={savePublishableKey}>
          Save publishable key
        </Btn>
      </div>
      <input
        className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email for Magic OTP"
      />
      <input
        className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (required for placing orders)"
      />
      <div className="mt-2">
        <Btn
          disabled={
            busy ||
            magicBusy ||
            !publishableKey.trim() ||
            !email.trim() ||
            phone.trim().length < 6
          }
          onClick={loginWithMagic}
        >
          {magicBusy ? "Signing in..." : "Login with Magic OTP"}
        </Btn>
      </div>
      <label className={`${LABEL_CLS} mt-4`}>Manual fallback: POST /api/auth/verify-did</label>
      <textarea
        className="mt-1 w-full rounded-md border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
        rows={3}
        value={didToken}
        onChange={(e) => setDidToken(e.target.value)}
        placeholder="Paste Magic DID token from client SDK login flow"
      />
      <input
        className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Optional email to enforce DID/email match"
      />
      <input
        className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (required for placing orders)"
      />
      <div className="mt-2">
        <Btn
          disabled={busy || magicBusy || !didToken}
          onClick={() =>
            run("/api/auth/verify-did", {
              method: "POST",
              skipAuth: true,
              body: JSON.stringify(
                email || phone
                  ? {
                      didToken,
                      ...(email ? { email } : {}),
                      ...(phone ? { phone } : {}),
                    }
                  : { didToken },
              ),
            })
          }
        >
          Verify DID token
        </Btn>
      </div>
    </div>
  );
}

function CatalogForms({
  busy,
  run,
}: {
  busy: boolean;
  run: (path: string, init?: RequestInit & { skipAuth?: boolean }) => Promise<void>;
}) {
  const [slug, setSlug] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [q, setQ] = useState("protein");
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("20");
  const listQs = new URLSearchParams();
  if (page) listQs.set("page", page);
  if (limit) listQs.set("limit", limit);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Btn disabled={busy} onClick={() => run(`/api/products?${listQs}`)}>
          GET /api/products
        </Btn>
        <label className="flex items-center gap-1 text-xs text-zinc-500">
          page
          <input className="w-12 rounded border px-1 dark:border-zinc-700 dark:bg-zinc-900" value={page} onChange={(e) => setPage(e.target.value)} />
        </label>
        <label className="flex items-center gap-1 text-xs text-zinc-500">
          limit
          <input className="w-12 rounded border px-1 dark:border-zinc-700 dark:bg-zinc-900" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className={LABEL_CLS}>Product slug</label>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug"
          />
        </div>
        <Btn disabled={busy || !slug} onClick={() => run(`/api/products/${encodeURIComponent(slug)}`)}>
          GET /api/products/:slug
        </Btn>
        <Btn disabled={busy || !slug} onClick={() => run(`/api/products/${encodeURIComponent(slug)}/reviews`)}>
          GET reviews
        </Btn>
      </div>
      <ReviewPostForm busy={busy} run={run} slug={slug} />
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className={LABEL_CLS}>Category slug</label>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
          />
        </div>
        <Btn disabled={busy || !catSlug} onClick={() => run(`/api/category/${encodeURIComponent(catSlug)}`)}>
          GET /api/category/:slug
        </Btn>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className={LABEL_CLS}>Brand slug</label>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={brandSlug}
            onChange={(e) => setBrandSlug(e.target.value)}
          />
        </div>
        <Btn disabled={busy || !brandSlug} onClick={() => run(`/api/brand/${encodeURIComponent(brandSlug)}`)}>
          GET /api/brand/:slug
        </Btn>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search q"
        />
        <Btn disabled={busy || !q} onClick={() => run(`/api/search?q=${encodeURIComponent(q)}&${listQs}`)}>
          GET /api/search
        </Btn>
      </div>
    </div>
  );
}

function ReviewPostForm({
  busy,
  run,
  slug,
}: {
  busy: boolean;
  run: (path: string, init?: RequestInit & { skipAuth?: boolean }) => Promise<void>;
  slug: string;
}) {
  const [body, setBody] = useState(
    JSON.stringify({ rating: 5, title: "Great", body: "Nice product" }, null, 2),
  );
  return (
    <div>
      <label className={LABEL_CLS}>POST /api/products/:slug/reviews (auth)</label>
      <textarea
        className="mt-1 w-full rounded-md border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Btn
        disabled={busy || !slug}
        onClick={() =>
          run(`/api/products/${encodeURIComponent(slug)}/reviews`, {
            method: "POST",
            body,
          })
        }
      >
        Submit review
      </Btn>
    </div>
  );
}

function CartCheckoutForms({
  busy,
  run,
}: {
  busy: boolean;
  run: (path: string, init?: RequestInit & { skipAuth?: boolean }) => Promise<void>;
}) {
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [cartItemId, setCartItemId] = useState("");
  const [shipAddr, setShipAddr] = useState("");
  const [billAddr, setBillAddr] = useState("");
  const [orderId, setOrderId] = useState("");
  const [addressId, setAddressId] = useState("");
  const [addressBody, setAddressBody] = useState(
    JSON.stringify(
      {
        label: "Home",
        fullName: "Test User",
        line1: "123 Demo Street",
        city: "London",
        postalCode: "EC1A1BB",
        countryCode: "GB",
        type: "SHIPPING",
        isDefault: true,
      },
      null,
      2,
    ),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Btn disabled={busy} onClick={() => run("/api/cart")}>
          GET /api/cart
        </Btn>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="productId"
        />
        <input
          className="w-16 rounded-md border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="qty"
        />
        <Btn
          disabled={busy || !productId}
          onClick={() =>
            run("/api/cart/add", {
              method: "POST",
              body: JSON.stringify({ productId, quantity: Number(qty) || 1 }),
            })
          }
        >
          POST /api/cart/add
        </Btn>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={cartItemId}
          onChange={(e) => setCartItemId(e.target.value)}
          placeholder="cart item id"
        />
        <Btn
          disabled={busy || !cartItemId}
          onClick={() =>
            run(`/api/cart/item/${encodeURIComponent(cartItemId)}`, {
              method: "PATCH",
              body: JSON.stringify({ quantity: Number(qty) || 1 }),
            })
          }
        >
          PATCH cart item
        </Btn>
        <Btn
          disabled={busy || !cartItemId}
          variant="danger"
          onClick={() =>
            run(`/api/cart/item/${encodeURIComponent(cartItemId)}`, { method: "DELETE" })
          }
        >
          DELETE cart item
        </Btn>
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn disabled={busy} onClick={() => run("/api/checkout", { method: "POST", body: "{}" })}>
          POST /api/checkout
        </Btn>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <input
          className="min-w-[220px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={shipAddr}
          onChange={(e) => setShipAddr(e.target.value)}
          placeholder="shippingAddressId"
        />
        <input
          className="min-w-[220px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={billAddr}
          onChange={(e) => setBillAddr(e.target.value)}
          placeholder="billingAddressId (optional)"
        />
        <Btn
          disabled={busy || !shipAddr}
          onClick={() =>
            run("/api/order", {
              method: "POST",
              body: JSON.stringify({
                shippingAddressId: shipAddr,
                ...(billAddr ? { billingAddressId: billAddr } : {}),
              }),
            })
          }
        >
          POST /api/order
        </Btn>
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn disabled={busy} onClick={() => run("/api/orders")}>
          GET /api/orders
        </Btn>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="order id"
        />
        <Btn disabled={busy || !orderId} onClick={() => run(`/api/orders/${encodeURIComponent(orderId)}`)}>
          GET /api/orders/:id
        </Btn>
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn disabled={busy} onClick={() => run("/api/account")}>
          GET /api/account
        </Btn>
        <Btn disabled={busy} onClick={() => run("/api/account/orders")}>
          GET /api/account/orders
        </Btn>
        <Btn disabled={busy} onClick={() => run("/api/account/addresses")}>
          GET /api/account/addresses
        </Btn>
      </div>
      <div>
        <label className={LABEL_CLS}>Address JSON (create/update)</label>
        <textarea
          className="mt-1 w-full rounded-md border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          rows={8}
          value={addressBody}
          onChange={(e) => setAddressBody(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Btn
            disabled={busy}
            onClick={() =>
              run("/api/account/addresses", {
                method: "POST",
                body: addressBody,
              })
            }
          >
            POST /api/account/addresses
          </Btn>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            placeholder="address id"
          />
          <Btn
            disabled={busy || !addressId}
            onClick={() =>
              run(`/api/account/addresses/${encodeURIComponent(addressId)}`, {
                method: "PATCH",
                body: addressBody,
              })
            }
          >
            PATCH address
          </Btn>
          <Btn
            disabled={busy || !addressId}
            variant="danger"
            onClick={() =>
              run(`/api/account/addresses/${encodeURIComponent(addressId)}`, {
                method: "DELETE",
              })
            }
          >
            DELETE address
          </Btn>
        </div>
      </div>
    </div>
  );
}

const defaultProductJson = `{
  "title": "Test Whey",
  "slug": "test-whey",
  "sku": "TEST-WHEY-1",
  "price": "49.99",
  "brandId": "REPLACE_BRAND_ID",
  "categoryId": null,
  "shortDesc": "Short",
  "description": "Full description",
  "flavour": "Vanilla",
  "costPrice": "25.00",
  "stockQuantity": 10,
  "currency": "GBP",
  "isActive": true,
  "isFeatured": false
}`;

function AdminForms({
  busy,
  run,
}: {
  busy: boolean;
  run: (path: string, init?: RequestInit & { skipAuth?: boolean }) => Promise<void>;
}) {
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [userId, setUserId] = useState("");
  const [reviewId, setReviewId] = useState("");
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("20");
  const [productBody, setProductBody] = useState(defaultProductJson);
  const [patchProductBody, setPatchProductBody] = useState('{\n  "isActive": true\n}');
  const [brandBody, setBrandBody] = useState(
    JSON.stringify({ name: "Acme", slug: "acme", isActive: true }, null, 2),
  );
  const [catBody, setCatBody] = useState(
    JSON.stringify({ name: "Protein", slug: "protein", isActive: true }, null, 2),
  );
  const [orderPatch, setOrderPatch] = useState(
    JSON.stringify({ status: "CONFIRMED", paymentStatus: "PAID" }, null, 2),
  );
  const [userPatch, setUserPatch] = useState(JSON.stringify({ status: "ACTIVE" }, null, 2));
  const [reviewPatch, setReviewPatch] = useState(
    JSON.stringify({ status: "APPROVED", note: "ok" }, null, 2),
  );
  const listQs = new URLSearchParams();
  if (page) listQs.set("page", page);
  if (limit) listQs.set("limit", limit);

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-wrap items-center gap-3 text-zinc-600 dark:text-zinc-400">
        <span>
          Admin list query: <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">page</code>
        </span>
        <input
          className="w-14 rounded border px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          value={page}
          onChange={(e) => setPage(e.target.value)}
        />
        <span>
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">limit</code>
        </span>
        <input
          className="w-14 rounded border px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
      </div>

      <AdminBlock title="Brands">
        <div className="mb-2 flex flex-wrap gap-2">
          <Btn disabled={busy} onClick={() => run(`/api/admin/brands?${listQs}`)}>
            GET list
          </Btn>
        </div>
        <textarea
          className="mb-2 w-full rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          rows={4}
          value={brandBody}
          onChange={(e) => setBrandBody(e.target.value)}
        />
        <Btn disabled={busy} onClick={() => run("/api/admin/brands", { method: "POST", body: brandBody })}>
          POST create
        </Btn>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            className="rounded border px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="brand id"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          />
          <Btn
            disabled={busy || !brandId}
            onClick={() =>
              run(`/api/admin/brands/${encodeURIComponent(brandId)}`, { method: "PATCH", body: brandBody })
            }
          >
            PATCH
          </Btn>
          <Btn
            disabled={busy || !brandId}
            variant="danger"
            onClick={() => run(`/api/admin/brands/${encodeURIComponent(brandId)}`, { method: "DELETE" })}
          >
            DELETE
          </Btn>
        </div>
      </AdminBlock>

      <AdminBlock title="Categories">
        <div className="mb-2 flex flex-wrap gap-2">
          <Btn disabled={busy} onClick={() => run(`/api/admin/categories?${listQs}`)}>
            GET list
          </Btn>
        </div>
        <textarea
          className="mb-2 w-full rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          rows={3}
          value={catBody}
          onChange={(e) => setCatBody(e.target.value)}
        />
        <Btn disabled={busy} onClick={() => run("/api/admin/categories", { method: "POST", body: catBody })}>
          POST create
        </Btn>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            className="rounded border px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="category id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
          <Btn
            disabled={busy || !categoryId}
            onClick={() =>
              run(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
                method: "PATCH",
                body: catBody,
              })
            }
          >
            PATCH
          </Btn>
          <Btn
            disabled={busy || !categoryId}
            variant="danger"
            onClick={() =>
              run(`/api/admin/categories/${encodeURIComponent(categoryId)}`, { method: "DELETE" })
            }
          >
            DELETE
          </Btn>
        </div>
      </AdminBlock>

      <AdminBlock title="Products">
        <div className="mb-2 flex flex-wrap gap-2">
          <Btn disabled={busy} onClick={() => run(`/api/admin/products?${listQs}`)}>
            GET list
          </Btn>
        </div>
        <label className="text-xs font-medium text-zinc-500">POST /api/admin/products</label>
        <textarea
          className="mb-2 w-full rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          rows={12}
          value={productBody}
          onChange={(e) => setProductBody(e.target.value)}
        />
        <Btn disabled={busy} onClick={() => run("/api/admin/products", { method: "POST", body: productBody })}>
          POST create
        </Btn>
        <label className="mt-3 block text-xs font-medium text-zinc-500">PATCH /api/admin/products/:id</label>
        <textarea
          className="mb-2 w-full rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          rows={4}
          value={patchProductBody}
          onChange={(e) => setPatchProductBody(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <input
            className="rounded border px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="product id"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
          <Btn
            disabled={busy || !productId}
            onClick={() =>
              run(`/api/admin/products/${encodeURIComponent(productId)}`, {
                method: "PATCH",
                body: patchProductBody,
              })
            }
          >
            PATCH
          </Btn>
          <Btn
            disabled={busy || !productId}
            variant="danger"
            onClick={() =>
              run(`/api/admin/products/${encodeURIComponent(productId)}`, { method: "DELETE" })
            }
          >
            DELETE (deactivate)
          </Btn>
        </div>
      </AdminBlock>

      <AdminBlock title="Orders">
        <div className="flex flex-wrap gap-2">
          <Btn disabled={busy} onClick={() => run(`/api/admin/orders?${listQs}`)}>
            GET list
          </Btn>
          <input
            className="rounded border px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="order id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <Btn
            disabled={busy || !orderId}
            onClick={() => run(`/api/admin/orders/${encodeURIComponent(orderId)}`)}
          >
            GET by id
          </Btn>
        </div>
        <textarea
          className="mt-2 w-full rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          rows={3}
          value={orderPatch}
          onChange={(e) => setOrderPatch(e.target.value)}
        />
        <Btn
          disabled={busy || !orderId}
          onClick={() =>
            run(`/api/admin/orders/${encodeURIComponent(orderId)}`, { method: "PATCH", body: orderPatch })
          }
        >
          PATCH order
        </Btn>
      </AdminBlock>

      <AdminBlock title="Users">
        <Btn disabled={busy} onClick={() => run(`/api/admin/users?${listQs}`)}>
          GET list
        </Btn>
        <textarea
          className="mt-2 w-full rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          rows={2}
          value={userPatch}
          onChange={(e) => setUserPatch(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            className="rounded border px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="user id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Btn
            disabled={busy || !userId}
            onClick={() =>
              run(`/api/admin/users/${encodeURIComponent(userId)}`, { method: "PATCH", body: userPatch })
            }
          >
            PATCH user
          </Btn>
        </div>
      </AdminBlock>

      <AdminBlock title="Reviews">
        <div className="mb-2 flex flex-wrap gap-2">
          <Btn disabled={busy} onClick={() => run(`/api/admin/reviews?${listQs}`)}>
            GET list
          </Btn>
          <Btn disabled={busy} onClick={() => run(`/api/admin/reviews?${listQs}&status=PENDING`)}>
            GET pending
          </Btn>
        </div>
        <textarea
          className="w-full rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          rows={3}
          value={reviewPatch}
          onChange={(e) => setReviewPatch(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            className="rounded border px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="review id"
            value={reviewId}
            onChange={(e) => setReviewId(e.target.value)}
          />
          <Btn
            disabled={busy || !reviewId}
            onClick={() =>
              run(`/api/admin/reviews/${encodeURIComponent(reviewId)}`, { method: "PATCH", body: reviewPatch })
            }
          >
            PATCH review
          </Btn>
        </div>
      </AdminBlock>
    </div>
  );
}

function AdminBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h3 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      {children}
    </div>
  );
}
