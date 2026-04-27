import { cloudinary } from "../config/cloudinary.js";
import { getEnv } from "../config/env.js";
import { AppError } from "../utils/appError.js";

export type SignedUploadPayload = {
  signature: string;
  timestamp: number;
  cloudName: string;
  folder: string;
  uploadUrl: string;
};

/**
 * Params returned here must match what the browser sends to Cloudinary
 * (same keys/values), except `file` and `api_key` (client uses NEXT_PUBLIC_CLOUDINARY_API_KEY).
 */
export function signProductImageUpload(productId: string): SignedUploadPayload {
  const env = getEnv();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${env.CLOUDINARY_UPLOAD_FOLDER.replace(/\/$/, "")}/${productId}`;
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET,
  );
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  return {
    signature,
    timestamp,
    cloudName,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

export async function destroyAsset(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
  const r = (result as { result?: string }).result;
  if (r === "ok" || r === "not found") {
    return;
  }
  throw new AppError(
    `Failed to remove image from storage: ${JSON.stringify(result)}`,
    502,
  );
}
