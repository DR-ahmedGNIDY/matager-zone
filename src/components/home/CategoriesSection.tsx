import Link from "next/link";

interface Category {
  id: string;
  nameAr: string;
  emoji: string;
  slug: string;
  _count?: { stores: number };
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-[72px] px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3.5">🏷️ التصنيفات</div>
          <h2 className="text-[clamp(22px,3vw,34px)] font-black text-secondary mb-2.5">تصفح المتاجر والمنتجات حسب التصنيف</h2>
          <p className="text-[15px] text-gray-500 max-w-[500px] mx-auto">اكتشف آلاف المنتجات عبر تصنيفات متنوعة تناسب جميع احتياجاتك</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/stores?category=${cat.slug}`}
              className="bg-white border border-gray-100 rounded-[16px] py-5 px-3 text-center cursor-pointer transition-all hover:border-primary hover:-translate-y-1 hover:shadow-primary no-underline group"
            >
              <span className="text-[32px] mb-2.5 block">{cat.emoji}</span>
              <div className="text-[13px] font-bold text-secondary group-hover:text-primary transition-colors">{cat.nameAr}</div>
              {cat._count?.stores ? (
                <div className="text-[11px] text-gray-400 mt-0.5">{cat._count.stores} متجر</div>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
