const TOKEN_KEY = "muscle_api_access_token";

export function getApiOrigin(): string {
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem("muscle_api_origin");
    if (saved) return saved.replace(/\/$/, "");
  }
  return (
    process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/$/, "") ??
    "http://127.0.0.1:5000"
  );
}

export function setApiOrigin(origin: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("muscle_api_origin", origin.replace(/\/$/, ""));
}

export function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type ApiResult = {
  ok: boolean;
  status: number;
  ms: number;
  json: unknown;
  text: string;
};

export async function apiRequest(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {},
): Promise<ApiResult> {
  const origin = getApiOrigin();
  const url = path.startsWith("http") ? path : `${origin}${path}`;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!init.skipAuth) {
    const t = getStoredToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  const started = performance.now();
  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
  const ms = Math.round(performance.now() - started);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { _raw: text };
  }
  return { ok: res.ok, status: res.status, ms, json, text };
}
