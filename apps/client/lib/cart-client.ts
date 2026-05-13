import { addToCart } from "./api"
import { getAccessToken } from "./auth-storage"

export type AddToCartResult =
  | { ok: true }
  | { ok: false; reason: "auth" | "error"; message?: string }

export async function addProductToCart(
  productId: string,
  quantity = 1,
  variant: {
    /** Preferred: resolved variant id from the PDP variant picker. */
    variantId?: string
    /** Legacy: variant labels; server resolves them to a variantId. */
    selectedFlavourLabel?: string
    selectedSizeLabel?: string
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
      variantId: variant.variantId,
      selectedFlavourLabel: variant.selectedFlavourLabel,
      selectedSizeLabel: variant.selectedSizeLabel,
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
