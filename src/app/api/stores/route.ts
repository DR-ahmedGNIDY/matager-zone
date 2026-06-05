import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createStoreSchema } from "@/validators/store";
import { generateSlug } from "@/lib/utils";
import { createNotification } from "@/services/notification.service";
import { ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const userId = session.user.id;

    // ── Allow all authenticated users (CUSTOMER gets promoted to STORE_OWNER) ──

    // ── Check user doesn't already have a store ──────────────
    const existingStore = await db.store.findFirst({
      where: { ownerId: userId, deletedAt: null },
      select: { id: true, status: true },
    });

    if (existingStore) {
      if (existingStore.status === "ACTIVE") {
        return NextResponse.json(
          { success: false, error: "لديك متجر نشط بالفعل. تواصل مع الإدارة لإنشاء متجر إضافي." },
          { status: 409 }
        );
      }
      if (existingStore.status === "PENDING") {
        return NextResponse.json(
          { success: false, error: "لديك طلب متجر قيد المراجعة بالفعل." },
          { status: 409 }
        );
      }
    }

    // ── Validate input ───────────────────────────────────────
    const body = await req.json();
    const parsed = createStoreSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, error: firstError.message },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // ── Check slug uniqueness ────────────────────────────────
    const slugTaken = await db.store.findUnique({
      where:  { slug: data.slug },
      select: { id: true },
    });

    if (slugTaken) {
      return NextResponse.json(
        { success: false, error: "هذا الرابط مستخدم بالفعل. اختر رابطاً آخر." },
        { status: 409 }
      );
    }

    // ── Resolve category ─────────────────────────────────────
    const category = await db.storeCategory.findFirst({
      where: {
        OR: [{ id: data.categoryId }, { slug: data.categoryId }],
        isActive: true,
      },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "التصنيف المختار غير موجود" },
        { status: 422 }
      );
    }

    // ── Create the store (status: PENDING) ───────────────────
    const store = await db.store.create({
      data: {
        ownerId:         userId,
        categoryId:      category.id,
        name:            data.name.trim(),
        slug:            data.slug.toLowerCase().trim(),
        description:     data.description.trim(),
        country:         data.country,
        city:            data.city.trim(),
        address:         data.address?.trim() || null,
        whatsappNumber:  data.whatsappNumber.replace(/\D/g, ""),
        countryCode:     data.countryCode,
        primaryColor:    data.primaryColor,
        welcomeMessage:  data.welcomeMessage?.trim() || null,
        orderButtonText: data.orderButtonText,
        instagramUrl:    data.instagramUrl?.trim() || null,
        tiktokUrl:       data.tiktokUrl?.trim() || null,
        facebookUrl:     data.facebookUrl?.trim() || null,
        twitterUrl:      data.twitterUrl?.trim() || null,
        businessHours:   data.businessHours ?? null,
        seoTitle:        data.seoTitle?.trim() || null,
        seoDescription:  data.seoDescription?.trim() || null,
        status:          "PENDING",
      },
      select: { id: true, name: true, slug: true },
    });

    // ── Promote user to STORE_OWNER if needed ────────────────
    if (session.user.role === "CUSTOMER") {
      await db.user.update({
        where: { id: userId },
        data:  { role: "STORE_OWNER", isOwner: true },
      });
    }

    // ── Notify the store owner ───────────────────────────────
    await createNotification({
      userId,
      title:   "تم استلام طلب متجرك ⏳",
      message: `تم استلام طلب إنشاء متجر "${store.name}". سيتم مراجعته والتواصل معك قريباً.`,
      type:    "STORE",
      link:    "/dashboard/store-owner",
    }).catch(() => {});

    // ── Write audit log ──────────────────────────────────────
    await db.auditLog.create({
      data: {
        action:   "STORE_CREATED",
        entity:   "Store",
        entityId: store.id,
        userId,
        metadata: { storeName: store.name, slug: store.slug },
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, storeId: store.id, slug: store.slug });
  } catch (err) {
    console.error("POST /api/stores:", err);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
