import { apiRequest, type ApiResult } from "@/lib/api";

export type SignedUploadPayload = {
  signature: string;
  timestamp: number;
  cloudName: string;
  folder: string;
  uploadUrl: string;
};

/** Must match server `CLOUDINARY_API_KEY` (public; not the secret). */
function getCloudinaryApiKeyForUpload(): string {
  const k = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY?.trim();
  if (!k) {
    throw new Error(
      "Set NEXT_PUBLIC_CLOUDINARY_API_KEY in apps/client/.env (same value as server CLOUDINARY_API_KEY)",
    );
  }
  return k;
}

/** Response shape from Cloudinary direct upload endpoint. */
export type CloudinaryDirectUploadResult = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

function getSuccessData<T>(json: unknown): T | null {
  if (!json || typeof json !== "object") return null;
  const o = json as { success?: boolean; data?: T };
  if (!o.success || o.data === undefined) return null;
  return o.data;
}

export async function fetchSignedProductImageUpload(
  productId: string,
): Promise<SignedUploadPayload> {
  const res = await apiRequest("/api/admin/uploads/sign", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
  const data = getSuccessData<{ signed: SignedUploadPayload }>(res.json);
  if (!res.ok || !data?.signed) {
    throw new Error(
      data ? "Invalid sign response" : `Sign failed (${res.status}): ${res.text}`,
    );
  }
  return data.signed;
}

export async function uploadFileToCloudinary(
  file: File,
  signed: SignedUploadPayload,
): Promise<CloudinaryDirectUploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", getCloudinaryApiKeyForUpload());
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  form.append("folder", signed.folder);
  const r = await fetch(signed.uploadUrl, { method: "POST", body: form });
  const text = await r.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { _raw: text };
  }
  if (!r.ok) {
    throw new Error(`Cloudinary upload failed (${r.status}): ${text}`);
  }
  if (json && typeof json === "object") {
    delete (json as Record<string, unknown>).api_key;
  }
  return json as CloudinaryDirectUploadResult;
}

export type PersistedProductImage = {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  format: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
};

export type ProductImageUploadItem = {
  file: File;
  altText: string;
  /** Sort order among this batch (0 = first in gallery after existing images). */
  displayOrder: number;
  isPrimary: boolean;
};

function mapCloudinaryToAsset(
  meta: CloudinaryDirectUploadResult,
  fields: { altText?: string; displayOrder: number; isPrimary: boolean },
) {
  return {
    publicId: meta.public_id,
    url: meta.secure_url,
    width: meta.width,
    height: meta.height,
    bytes: meta.bytes,
    format: meta.format,
    ...(fields.altText?.trim() ? { altText: fields.altText.trim() } : {}),
    displayOrder: fields.displayOrder,
    isPrimary: fields.isPrimary,
  };
}

/**
 * Sign once, upload each file to Cloudinary, then persist metadata in one API call.
 * At most one item should have `isPrimary: true` (enforced in UI; server also validates).
 */
export async function uploadProductImagesAndSave(
  productId: string,
  items: ProductImageUploadItem[],
): Promise<{ save: ApiResult; images: PersistedProductImage[] }> {
  if (items.length === 0) {
    throw new Error("At least one file is required");
  }
  const primaryCount = items.filter((x) => x.isPrimary).length;
  if (primaryCount > 1) {
    throw new Error("Mark at most one image as primary");
  }
  const signed = await fetchSignedProductImageUpload(productId);
  const imagesPayload = [];
  for (const item of items) {
    const meta = await uploadFileToCloudinary(item.file, signed);
    imagesPayload.push(
      mapCloudinaryToAsset(meta, {
        altText: item.altText,
        displayOrder: item.displayOrder,
        isPrimary: item.isPrimary,
      }),
    );
  }
  const save = await apiRequest(`/api/admin/products/${productId}/images`, {
    method: "POST",
    body: JSON.stringify({ images: imagesPayload }),
  });
  const data = getSuccessData<{ images: PersistedProductImage[] }>(save.json);
  return {
    save,
    images: data?.images ?? [],
  };
}
