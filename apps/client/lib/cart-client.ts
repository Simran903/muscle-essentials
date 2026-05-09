import { addToCart } from "./api"
import { getAccessToken } from "./auth-storage"

export type AddToCartResult =
  | { ok: true }
  | { ok: false; reason: "auth" | "error"; message?: string }

export async function addProductToCart(
  productId: string,
  quantity = 1,
  variants: {
    selectedFlavourLabel: string
    selectedSizeLabel: string
  },
): Promise<AddToCartResult> {
  const token = getAccessToken()
  if (!token) {
    return { ok: false, reason: "auth" }
  }
  try {
    await addToCart(token, {
      productId,
      quantity,
      selectedFlavourLabel: variants.selectedFlavourLabel,
      selectedSizeLabel: variants.selectedSizeLabel,
    })
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart:updated"))
    }
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : undefined
    return { ok: false, reason: "error", message }
  }
}
