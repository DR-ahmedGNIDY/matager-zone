import Link from "next/link";
import StoreCard from "@/components/common/StoreCard";

interface Store {
  id: string;
  name: string;
  slug: string;

  logo?: string | null;
  cover?: string | null;
  description?: string | null;

  primaryColor?: string | null;

  isVerified?: boolean | null;
  isFeatured?: boolean | null;

  whatsappNumber: string;
  countryCode?: string | null;

  city?: string | null;
  country?: string | null;

  averageRating?: number | null;

  category?: {
    nameAr: string;
    emoji: string;
  } | null;

  _count?: {
    products?: number;
    followers?: number;
  } | null;
}

export default function FeaturedStoresSection({ stores }: { stores: Store[] }) {
  return (
    <section className="py-[72px] px-6 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-2">⭐ المتاجر المميزة</div>
            <h2 className="text-[clamp(20px,2.5vw,28px)] font-black text-secondary">اكتشف أفضل المتاجر على متاجر زون</h2>
          </div>
          <Link href="/stores?featured=true" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary no-underline bg-primary-ultra px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all">
            عرض جميع المتاجر ←
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
