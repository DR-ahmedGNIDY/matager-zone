import { db } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
  name:  z.string().min(2, "الاسم حرفين على الأقل").max(100, "الاسم طويل جداً"),
  phone: z.string().regex(/^[0-9]{7,15}$/, "رقم هاتف غير صحيح").optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateCustomerProfile(
  userId: string,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name:  parsed.data.name.trim(),
      phone: parsed.data.phone?.trim() || null,
    },
  });

  return { success: true };
}

export async function getCustomerProfile(userId: string) {
  return db.user.findUnique({
    where:  { id: userId },
    select: {
      id: true, name: true, email: true, phone: true,
      image: true, role: true, isOwner: true,
      emailVerified: true, createdAt: true,
      _count: {
        select: {
          orders:  true,
          reviews: true,
          stores:  true,
        },
      },
    },
  });
}
