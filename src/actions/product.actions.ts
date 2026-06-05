"use server";

import { requireStoreOwnership } from "@/lib/auth-helpers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  createProductCategory,
} from "@/services/product.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { toPiastres } from "@/lib/utils";

// ── Validation schemas ────────────────────────────────────────

const baseProductSchema = z.object({
  name: z.string().min(2, "اسم المنتج حرفين على الأقل").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).max(99999.99),
  comparePrice: z.number().min(0).max(99999.99).optional().nullable(),
  sku: z.string().max(100).optional(),
  stock: z.number().int().min(0).optional().nullable(),
  trackStock: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  variants: z.array(
    z.object({
      name: z.string().min(1).max(50),
      options: z.array(z.string()).min(1),
    })
  ).default([]),
  status: z.enum(["ACTIVE", "HIDDEN", "ARCHIVED"]).default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  imageUrls: z.array(z.string().url()).default([]),
  imagePublicIds: z.array(z.string()).default([]),
});

const productSchema = baseProductSchema.refine(
  (d) => !d.comparePrice || d.comparePrice > d.price,
  {
    message: "سعر المقارنة يجب أن يكون أعلى من السعر",
    path: ["comparePrice"],
  }
);

async function getStoreId(userId: string): Promise<string | null> {
  const store = await db.store.findFirst({
    where: { ownerId: userId, deletedAt: null },
    select: { id: true },
  });
  return store?.id ?? null;
}

// ── Actions ───────────────────────────────────────────────────

export async function createProductAction(input: unknown): Promise<{
  success: boolean; productId?: string; error?: string;
}> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const storeId = await getStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر مرتبط بحسابك" };

  const result = await createProduct(storeId, {
    ...parsed.data,
    priceInCents:        toPiastres(parsed.data.price),
    comparePriceInCents: parsed.data.comparePrice ? toPiastres(parsed.data.comparePrice) : null,
  });

  if (!result.success) return result;

  revalidatePath("/dashboard/store-owner/products");
  revalidatePath(`/store`);
  return result;
}

export async function updateProductAction(
  productId: string,
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const parsed = baseProductSchema.partial().safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const storeId = await getStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر" };

  const data: Parameters<typeof updateProduct>[2] = {
    ...parsed.data,
    ...(parsed.data.price       !== undefined ? { priceInCents: toPiastres(parsed.data.price) } : {}),
    ...(parsed.data.comparePrice !== undefined ? {
      comparePriceInCents: parsed.data.comparePrice ? toPiastres(parsed.data.comparePrice) : null
    } : {}),
  };

  const result = await updateProduct(productId, storeId, data);
  if (!result.success) return result;

  revalidatePath("/dashboard/store-owner/products");
  revalidatePath(`/product/${productId}`);
  return { success: true };
}

export async function deleteProductAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const storeId = await getStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر" };

  const result = await deleteProduct(productId, storeId);
  if (!result.success) return result;

  revalidatePath("/dashboard/store-owner/products");
  return { success: true };
}

export async function toggleProductStatusAction(
  productId: string
): Promise<{ success: boolean; newStatus?: string; error?: string }> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const storeId = await getStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر" };

  const result = await toggleProductStatus(productId, storeId);
  if (!result.success) return result;

  revalidatePath("/dashboard/store-owner/products");
  return result;
}

export async function createProductCategoryAction(input: {
  name: string; nameAr: string; emoji?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const storeId = await getStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر" };

  const { name, nameAr, emoji } = input;
  if (!name || !nameAr) return { success: false, error: "اسم التصنيف مطلوب" };

  const cat = await createProductCategory(storeId, name, nameAr, emoji);
  revalidatePath("/dashboard/store-owner/products");
  return { success: true, id: cat.id };
}
