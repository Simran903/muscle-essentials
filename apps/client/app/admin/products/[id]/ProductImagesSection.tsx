"use client"

import Image from "next/image"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import {
  adminAddProductImages,
  adminDeleteProductImage,
  adminListProductImages,
  adminPatchProductImage,
  adminSignUpload,
  toAdminError,
  type AdminProductImage,
} from "@/lib/admin-api"

import { adminLabel } from "../../admin-styles"

async function uploadProductImageToCloudinary(file: File, productId: string) {
  const signed = await adminSignUpload(productId)
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  if (!apiKey) {
    throw new Error("Set NEXT_PUBLIC_CLOUDINARY_API_KEY for uploads.")
  }
  const form = new FormData()
  form.append("file", file)
  form.append("api_key", apiKey)
  form.append("timestamp", String(signed.timestamp))
  form.append("signature", signed.signature)
  form.append("folder", signed.folder)
  const res = await fetch(signed.uploadUrl, { method: "POST", body: form })
  const json = (await res.json()) as {
    secure_url?: string
    public_id?: string
    width?: number
    height?: number
    bytes?: number
    format?: string
    error?: { message?: string }
  }
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Cloudinary upload failed.")
  }
  if (!json.secure_url || !json.public_id) {
    throw new Error("Invalid upload response.")
  }
  return {
    publicId: json.public_id,
    url: json.secure_url,
    width: json.width,
    height: json.height,
    bytes: json.bytes,
    format: json.format,
  }
}

export function ProductImagesSection({ productId }: { productId: string }) {
  const [images, setImages] = React.useState<AdminProductImage[]>([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const list = await adminListProductImages(productId)
      setImages([...list].sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (e) {
      toast.error(toAdminError(e, "Could not load images.").message)
    } finally {
      setLoading(false)
    }
  }, [productId])

  React.useEffect(() => {
    void load()
  }, [load])

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    try {
      const asset = await uploadProductImageToCloudinary(file, productId)
      await adminAddProductImages(productId, [
        {
          publicId: asset.publicId,
          url: asset.url,
          width: asset.width,
          height: asset.height,
          bytes: asset.bytes,
          format: asset.format,
        },
      ])
      toast.success("Image uploaded.")
      await load()
    } catch (err) {
      toast.error(toAdminError(err, "Upload failed.").message)
    } finally {
      setUploading(false)
    }
  }

  const setPrimary = async (imageId: string) => {
    try {
      await adminPatchProductImage(productId, imageId, { isPrimary: true })
      toast.success("Primary image updated.")
      await load()
    } catch (e) {
      toast.error(toAdminError(e, "Update failed.").message)
    }
  }

  const remove = async (imageId: string) => {
    if (!confirm("Remove this image from the product?")) return
    try {
      await adminDeleteProductImage(productId, imageId)
      toast.success("Image removed.")
      await load()
    } catch (e) {
      toast.error(toAdminError(e, "Remove failed.").message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={adminLabel}>Gallery</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(ev) => void onFile(ev)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-md"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading images…</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images yet. Upload a file to Cloudinary.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-lg border border-border/60 bg-muted/10 p-3"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted/30">
                <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" sizes="200px" />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {img.isPrimary ? (
                  <span className="text-xs font-medium text-primary">Primary</span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-md text-xs"
                    onClick={() => void setPrimary(img.id)}
                  >
                    Set primary
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-md text-xs text-destructive"
                  onClick={() => void remove(img.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
