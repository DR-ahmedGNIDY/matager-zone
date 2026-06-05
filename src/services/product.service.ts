import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { cloudinary } from "@/lib/cloudinary";
import type { Prisma } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────

export interface ProductListItem {
  id: string;
  name: string;
  priceInCents: number;
  comparePriceInCents: number | null;
  status: string;
  isFeatured: boolean;
  totalOrders: number;
  stock: number | null;
  trackStock: boolean;
  createdAt: Date;
  images: { url: string; alt: string | null }[];
  category: { id: string; name: string; nameAr: string | null } | null;
}

export interface ProductFormData {
  name: string;
  description?: string;
  priceInCents: number;          // already converted from EGP input
  comparePriceInCents?: number | null;
  sku?: string;
  stock?: number | null;
  trackStock: boolean;
  categoryId?: string | null;
  tags: string[];
  variants: Array<{ name: string; options: string[] }>;
  status: "ACTIVE" | "HIDDEN" | "ARCHIVED";
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  imageUrls?: string[];           // already-uploaded Cloudinary URLs
  imagePublicIds?: string[];      // for deletion later
}

// ── List ──────────────────────────────────────────────────────

export async function listStoreProducts(
  storeId: string,
  opts?: { search?: string; status?: string; categoryId?: string; page?: number }
): Promise<{ products: ProductListItem[]; total: number }> {
  const page  = opts?.page ?? 1;
  const take  = 20;
  const skip  = (page - 1) * take;

  const where: Prisma.ProductWhereInput = {
    storeId,
    deletedAt: null,
    ...(opts?.status     ? { status: opts.status as "ACTIVE" | "HIDDEN" | "ARCHIVED" } : {}),
    ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
    ...(opts?.search     ? { name: { contains: opts.search, mode: "insensitive" } } : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take,
      select: {
        id: true, name: true, priceInCents: true, comparePriceInCents: true,
        status: true, isFeatured: true, totalOrders: true,
        stock: true, trackStock: true, createdAt: true,
        images: { take: 1, orderBy: { order: "asc" }, select: { url: true, alt: true } },
        category: { select: { id: true, name: true, nameAr: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  return { products: products as unknown as ProductListItem[], total };
}

// ── Get single (for edit form) ────────────────────────────────

export async function getProductForEdit(productId: string, storeId: string) {
  return db.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
    include: {
      images: { orderBy: { order: "asc" } },
      category: { select: { id: true, name: true, nameAr: true } },
    },
  });
}

// ── Create ────────────────────────────────────────────────────

export async function createProduct(
  storeId: string,
  data: ProductFormData
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const product = await db.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          storeId,
          name:               data.name.trim(),
          description:        data.description?.trim() || null,
          priceInCents:       data.priceInCents,
          comparePriceInCents:data.comparePriceInCents ?? null,
          sku:                data.sku?.trim() || null,
          stock:              data.stock ?? null,
          trackStock:         data.trackStock,
          categoryId:         data.categoryId ?? null,
          tags:               data.tags,
          variants:           (data.variants as unknown as Prisma.InputJsonValue),
          status:             data.status,
          isFeatured:         data.isFeatured,
          seoTitle:           data.seoTitle?.trim() || null,
          seoDescription:     data.seoDescription?.trim() || null,
        },
        select: { id: true },
      });

      // Create product images
      if (data.imageUrls && data.imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: data.imageUrls.map((url, i) => ({
            productId:  p.id,
            url,
            publicId:   data.imagePublicIds?.[i] ?? null,
            order:      i,
          })),
        });
      }

      // Increment totalProducts on store atomically
      await tx.store.update({ where: { id: storeId }, data: { totalProducts: { increment: 1 } } });

      return p;
    });

    return { success: true, productId: product.id };
  } catch (err) {
    console.error("createProduct:", err);
    return { success: false, error: "فشل إنشاء المنتج" };
  }
}

// ── Update ────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  storeId: string,
  data: Partial<ProductFormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId, storeId },
        data: {
          ...(data.name             !== undefined ? { name: data.name.trim() }                     : {}),
          ...(data.description      !== undefined ? { description: data.description?.trim() || null }: {}),
          ...(data.priceInCents     !== undefined ? { priceInCents: data.priceInCents }            : {}),
          ...(data.comparePriceInCents !== undefined ? { comparePriceInCents: data.comparePriceInCents ?? null } : {}),
          ...(data.sku              !== undefined ? { sku: data.sku?.trim() || null }              : {}),
          ...(data.stock            !== undefined ? { stock: data.stock ?? null }                  : {}),
          ...(data.trackStock       !== undefined ? { trackStock: data.trackStock }                : {}),
          ...(data.categoryId       !== undefined ? { categoryId: data.categoryId ?? null }        : {}),
          ...(data.tags             !== undefined ? { tags: data.tags }                            : {}),
          ...(data.variants         !== undefined ? { variants: data.variants as unknown as Prisma.InputJsonValue } : {}),
          ...(data.status           !== undefined ? { status: data.status }                        : {}),
          ...(data.isFeatured       !== undefined ? { isFeatured: data.isFeatured }                : {}),
          ...(data.seoTitle         !== undefined ? { seoTitle: data.seoTitle?.trim() || null }    : {}),
          ...(data.seoDescription   !== undefined ? { seoDescription: data.seoDescription?.trim() || null } : {}),
        },
      });

      // Replace images if new ones provided
      if (data.imageUrls && data.imageUrls.length > 0) {
        // Delete old images from Cloudinary
        const oldImages = await tx.productImage.findMany({
          where: { productId },
          select: { publicId: true },
        });
        for (const img of oldImages) {
          if (img.publicId) {
            await cloudinary.uploader.destroy(img.publicId).catch(() => {});
          }
        }
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.productImage.createMany({
          data: data.imageUrls.map((url, i) => ({
            productId,
            url,
            publicId: data.imagePublicIds?.[i] ?? null,
            order:    i,
          })),
        });
      }
    });

    return { success: true };
  } catch (err) {
    console.error("updateProduct:", err);
    return { success: false, error: "فشل تحديث المنتج" };
  }
}

// ── Soft delete ───────────────────────────────────────────────

export async function deleteProduct(
  productId: string,
  storeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId, storeId },
        data: { deletedAt: new Date(), status: "ARCHIVED" },
      });
      await tx.store.update({ where: { id: storeId }, data: { totalProducts: { decrement: 1 } } });
    });
    return { success: true };
  } catch (err) {
    console.error("deleteProduct:", err);
    return { success: false, error: "فشل حذف المنتج" };
  }
}

// ── Toggle status ─────────────────────────────────────────────

export async function toggleProductStatus(
  productId: string,
  storeId: string
): Promise<{ success: boolean; newStatus?: string; error?: string }> {
  const product = await db.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
    select: { status: true },
  });
  if (!product) return { success: false, error: "المنتج غير موجود" };

  const newStatus = product.status === "ACTIVE" ? "HIDDEN" : "ACTIVE";
  await db.product.update({ where: { id: productId }, data: { status: newStatus } });
  return { success: true, newStatus };
}

// ── Product categories ────────────────────────────────────────

export async function getProductCategories(storeId: string) {
  return db.productCategory.findMany({
    where: { storeId, isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, nameAr: true, emoji: true, sortOrder: true },
  });
}

export async function createProductCategory(
  storeId: string,
  name: string,
  nameAr: string,
  emoji?: string
) {
  return db.productCategory.create({
    data: { storeId, name: name.trim(), nameAr: nameAr.trim(), emoji: emoji ?? null },
    select: { id: true, name: true, nameAr: true, emoji: true },
  });
}
