import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_STORE_LOGOS_FOLDER,
  CLOUDINARY_STORE_COVERS_FOLDER,
  CLOUDINARY_PRODUCT_IMAGES_FOLDER,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "./constants";

// ── Configure ─────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

// ── Types ─────────────────────────────────────────────────────
export type UploadType = "store-logo" | "store-cover" | "product-image";

interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: string;
  fetch_format?: string;
}

// ── Folder mapping ────────────────────────────────────────────
function getFolderByType(type: UploadType): string {
  const folders: Record<UploadType, string> = {
    "store-logo": CLOUDINARY_STORE_LOGOS_FOLDER,
    "store-cover": CLOUDINARY_STORE_COVERS_FOLDER,
    "product-image": CLOUDINARY_PRODUCT_IMAGES_FOLDER,
  };
  return folders[type];
}

// ── Transformation mapping ────────────────────────────────────
function getTransformationsByType(type: UploadType): CloudinaryTransformation {
  const map: Record<UploadType, CloudinaryTransformation> = {
    "store-logo": {
      width: 400,
      height: 400,
      crop: "fill",
      gravity: "center",
      quality: "auto",
      fetch_format: "webp",
    },
    "store-cover": {
      width: 1200,
      height: 400,
      crop: "fill",
      gravity: "center",
      quality: "auto",
      fetch_format: "webp",
    },
    "product-image": {
      width: 800,
      height: 800,
      crop: "limit",
      quality: "auto",
      fetch_format: "webp",
    },
  };
  return map[type];
}

// ── Server-side upload ────────────────────────────────────────
export async function uploadImageToCloudinary(
  file: File,
  type: UploadType,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  // Validate type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("نوع الملف غير مدعوم. يُسمح بـ JPG, PNG, WebP فقط");
  }
  // Validate size
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("حجم الملف كبير جداً. الحد الأقصى 5MB");
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataURI = `data:${file.type};base64,${base64}`;
  const transformation = getTransformationsByType(type);

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: getFolderByType(type),
    public_id: publicId,
    transformation: [transformation],
    overwrite: !!publicId,
    resource_type: "image",
  });

  return { url: result.secure_url, publicId: result.public_id };
}

// ── Delete ────────────────────────────────────────────────────
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset: ${publicId}`, err);
  }
}

// ── Build URL with transformations ───────────────────────────
export function buildCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: string; format?: string } = {}
): string {
  const { width, height, crop = "fill", quality = "auto", format = "webp" } = options;
  const parts = [
    width ? `w_${width}` : "",
    height ? `h_${height}` : "",
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
  ].filter(Boolean).join(",");

  return cloudinary.url(publicId, {
    transformation: [{ raw_transformation: parts }],
    secure: true,
  });
}

// ── Client-side upload via unsigned preset ────────────────────
export async function clientUploadToCloudinary(
  file: File,
  type: UploadType
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "mtajer-zone-uploads"
  );
  formData.append("folder", getFolderByType(type));

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("فشل رفع الصورة. حاول مرة أخرى");

  const data = await res.json() as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}
