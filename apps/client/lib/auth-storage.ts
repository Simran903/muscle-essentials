export const ACCESS_TOKEN_STORAGE_KEY = "muscle-essentials-access-token"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

export function clearAccessToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}
