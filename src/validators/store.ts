import { z } from "zod";

const dayHoursSchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "توقيت غير صحيح"),
  closeTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "توقيت غير صحيح"),
});

export const businessHoursSchema = z.object({
  saturday:  dayHoursSchema,
  sunday:    dayHoursSchema,
  monday:    dayHoursSchema,
  tuesday:   dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday:  dayHoursSchema,
  friday:    dayHoursSchema,
});

export const createStoreSchema = z.object({
  name: z.string().min(2, "اسم المتجر حرفين على الأقل").max(100, "اسم المتجر طويل جداً"),
  description: z.string().min(10, "الوصف 10 أحرف على الأقل").max(500, "الوصف طويل جداً"),
  categoryId: z.string().min(1, "التصنيف مطلوب"),
  country: z.string().min(1, "الدولة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  address: z.string().max(300).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "لون غير صحيح").default("#4F6BFF"),
  // FIX WA-1: digits only, no + prefix (E.164 local part)
  whatsappNumber: z.string()
    .min(7, "رقم واتساب قصير جداً")
    .max(15, "رقم واتساب طويل جداً")
    .regex(/^[0-9]+$/, "رقم واتساب يجب أن يحتوي على أرقام فقط"),
  countryCode: z.string()
    .regex(/^[0-9]{1,4}$/, "كود الدولة يجب أن يكون أرقاماً فقط بدون +")
    .default("20"),
  welcomeMessage: z.string().max(500).optional(),
  orderButtonText: z.string().min(1).max(50).default("اطلب عبر واتساب"),
  instagramUrl: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
  tiktokUrl: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
  facebookUrl: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
  twitterUrl: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
  businessHours: businessHoursSchema.optional(),
  slug: z.string()
    .min(2, "الرابط حرفين على الأقل")
    .max(100, "الرابط طويل جداً")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  seoTitle: z.string().max(60, "عنوان SEO 60 حرف أو أقل").optional(),
  seoDescription: z.string().max(160, "وصف SEO 160 حرف أو أقل").optional(),
});

export const updateStoreSchema = createStoreSchema.partial().extend({
  id: z.string().min(1),
});

const productBaseSchema = z.object({
  name: z.string().min(2, "اسم المنتج حرفين على الأقل").max(200, "اسم المنتج طويل جداً"),
  description: z.string().max(2000, "الوصف طويل جداً").optional(),
  price: z.number().min(0, "السعر يجب أن يكون 0 أو أكثر").max(99999.99, "السعر كبير جداً"),
  comparePrice: z.number().min(0).max(99999.99).optional().nullable(),
  sku: z.string().max(100).optional(),
  stock: z.number().int().min(0).optional().nullable(),
  trackStock: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  variants: z.array(z.object({
    name: z.string().min(1).max(50),
    options: z.array(z.string().min(1).max(50)).min(1).max(20),
  })).max(5).default([]),
  status: z.enum(["ACTIVE", "HIDDEN", "ARCHIVED"]).default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
});

export const createProductSchema = productBaseSchema.refine(
  (data) => !data.comparePrice || data.comparePrice > data.price,
  { message: "سعر المقارنة يجب أن يكون أعلى من السعر الحالي", path: ["comparePrice"] }
);

export const updateProductSchema = productBaseSchema.partial().extend({
  id: z.string().min(1),
}).refine(
  (data) => !data.comparePrice || !data.price || data.comparePrice > data.price,
  { message: "سعر المقارنة يجب أن يكون أعلى من السعر الحالي", path: ["comparePrice"] }
);

// FIX REL-4: reviewType is required — enforces store OR product
export const reviewSchema = z.discriminatedUnion("reviewType", [
  z.object({
    reviewType: z.literal("STORE"),
    storeId: z.string().min(1, "معرف المتجر مطلوب"),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10, "التعليق 10 أحرف على الأقل").max(1000).optional(),
    productId: z.undefined(),
  }),
  z.object({
    reviewType: z.literal("PRODUCT"),
    productId: z.string().min(1, "معرف المنتج مطلوب"),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10, "التعليق 10 أحرف على الأقل").max(1000).optional(),
    storeId: z.undefined(),
  }),
]);

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
