import { requireStoreOwner } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getProductForEdit, getProductCategories } from "@/services/product.service";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ProductForm from "@/components/dashboard/store-owner/ProductForm";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "تعديل المنتج | متاجر زون" };

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const [user, { id: productId }] = await Promise.all([requireStoreOwner(), params]);

  const store = await db.store.findFirst({
    where: { ownerId: user.id, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!store) redirect("/dashboard/store-owner/create");

  const [product, categories] = await Promise.all([
    getProductForEdit(productId, store.id),
    getProductCategories(store.id),
  ]);
  if (!product) notFound();

  const userForSidebar = { name: user.name, email: user.email ?? "", image: user.image, role: user.role };

  return (
    <div className="flex min-h-screen">
      <div className="w-[240px] flex-shrink-0 hidden md:block">
        <DashboardSidebar
          links={[
            { href: "/dashboard/store-owner",           icon: "📊", label: "لوحة التحكم" },
            { href: "/dashboard/store-owner/products",   icon: "📦", label: "المنتجات" },
            { href: "/dashboard/store-owner/orders",     icon: "🛒", label: "الطلبات" },
            { href: "/dashboard/store-owner/settings",   icon: "⚙️", label: "إعدادات المتجر" },
          ]}
          user={userForSidebar}
          storeName={store.name}
          variant="store"
        />
      </div>
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-[860px] mx-auto px-6 py-8">
          <Breadcrumb items={[
            { label: "لوحة التحكم", href: "/dashboard/store-owner" },
            { label: "المنتجات", href: "/dashboard/store-owner/products" },
            { label: "تعديل المنتج" },
          ]} />
          <h1 className="text-[22px] font-black text-secondary mb-6 mt-2">✏️ تعديل المنتج</h1>
          <div className="bg-white rounded-[24px] border border-gray-100 p-6">
            <ProductForm
              mode="edit"
              productId={product.id}
              categories={categories}
              initialData={{
                name:               product.name,
                description:        product.description ?? undefined,
                priceInCents:       product.priceInCents,
                comparePriceInCents:product.comparePriceInCents,
                sku:                product.sku ?? undefined,
                stock:              product.stock,
                trackStock:         product.trackStock,
                categoryId:         product.categoryId,
                tags:               product.tags,
                status:             product.status,
                isFeatured:         product.isFeatured,
                images:             product.images,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
