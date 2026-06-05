import Link from "next/link";
import ProductCard from "@/components/common/ProductCard";

interface Product {
  id: string; name: string; priceInCents: number; comparePriceInCents?: number | null;
  images?: { url: string; alt?: string | null }[];
  store: { id: string; name: string; slug: string; whatsappNumber: string; countryCode?: string; };
}

export default function LatestProductsSection({ products }: { products: Product[] }) {
  return (
    <section className="py-[72px] px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-2">🆕 أحدث المنتجات</div>
            <h2 className="text-[clamp(20px,2.5vw,28px)] font-black text-secondary">تسوق أحدث المنتجات</h2>
          </div>
          <Link href="/stores" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary no-underline bg-primary-ultra px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all">
            عرض جميع المنتجات ←
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
