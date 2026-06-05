"use client";
import { useState, useTransition } from "react";
import { addToCartAction } from "@/actions/cart.actions";
import { placeDirectOrderAction } from "@/actions/order.actions";
import Link from "next/link";
import { formatPrice, calculateDiscountPct, calculateSavingsInCents, buildWhatsAppUrl, buildSingleProductWhatsAppMessage } from "@/lib/utils";
import { VariantSelector, QuantityControl } from "./VariantSelector";
import StarRating from "@/components/common/StarRating";
import { Badge } from "@/components/common/Badge";
import { APP_URL } from "@/lib/constants";

interface ProductInfoProps {
  product: {
    id: string; name: string; priceInCents: number; comparePriceInCents?: number | null;
    description?: string | null; sku?: string | null; stock?: number | null; trackStock: boolean;
    tags: string[]; variants: Array<{ name: string; options: string[] }>;
    store: { id: string; name: string; slug: string; whatsappNumber: string; countryCode?: string; logo?: string | null; isVerified?: boolean; };
    averageRating?: number; _count?: { reviews: number };
  };
  onAddToCart?: (quantity: number, variants: Record<string, string>) => void;
}

export default function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const discount = product.comparePriceInCents
    ? calculateDiscountPct(product.priceInCents, product.comparePriceInCents) : 0;
  const savings = product.comparePriceInCents
    ? calculateSavingsInCents(product.priceInCents, product.comparePriceInCents) : 0;
  const phone = (product.store.countryCode || "20") + product.store.whatsappNumber;
  const productUrl = `${APP_URL}/product/${product.id}`;

  const handleWaOrder = () => {
    startTransition(async () => {
      // Save order to DB, then open WhatsApp
      const result = await placeDirectOrderAction({
        productId:        product.id,
        quantity,
        selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : {},
      });

      if (!result.success) {
        setCartError(result.error ?? "فشل إنشاء الطلب");
        setTimeout(() => setCartError(""), 3000);
        return;
      }

      setOrderSent(true);
      setTimeout(() => setOrderSent(false), 4000);

      // Open WhatsApp URL (returned from server with saved order)
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    });
  };

  const [isPending, startTransition] = useTransition();
  const [cartError, setCartError] = useState("");

  const [orderSent, setOrderSent] = useState(false);

  const handleAddToCart = () => {
    setCartError("");
    startTransition(async () => {
      const result = await addToCartAction({
        productId: product.id,
        quantity,
        selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : {},
      });
      if (result.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
        // Also call optional prop callback (for parent state sync)
        onAddToCart?.(quantity, selectedVariants);
      } else {
        setCartError(result.error ?? "فشل إضافة المنتج للسلة");
        setTimeout(() => setCartError(""), 3000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Store link */}
      <Link href={`/store/${product.store.slug}`}
        className="flex items-center gap-2.5 no-underline group w-fit">
        <div className="w-9 h-9 bg-primary-ultra rounded-[10px] flex items-center justify-center text-base">
          {product.store.logo ? <img src={product.store.logo} alt="" className="w-full h-full object-contain rounded-[8px]" /> : "🏪"}
        </div>
        <div>
          <div className="text-[14px] font-bold text-secondary group-hover:text-primary transition-colors">{product.store.name}</div>
          {product.store.isVerified && <div className="text-[11px] text-green-600 font-semibold">✓ متجر موثق</div>}
        </div>
      </Link>

      {/* Title */}
      <h1 className="text-[clamp(20px,2.5vw,28px)] font-black text-secondary leading-snug">{product.name}</h1>

      {/* Rating */}
      {product.averageRating ? (
        <div className="flex items-center gap-2">
          <StarRating value={Math.round(product.averageRating)} readonly size="sm" />
          <span className="text-[13px] text-gray-500">{product.averageRating.toFixed(1)} ({product._count?.reviews || 0} تقييم)</span>
          <a href="#reviews" className="text-[13px] text-primary hover:underline">عرض التقييمات</a>
        </div>
      ) : null}

      {/* Price */}
      <div className="flex items-end gap-3">
        <span className="text-[36px] font-black text-secondary leading-none">{formatPrice(product.priceInCents)}</span>
        {product.comparePriceInCents && (
          <div className="flex flex-col pb-1">
            <span className="text-[16px] text-gray-400 line-through">{formatPrice(product.comparePriceInCents)}</span>
            <span className="text-[12px] text-success font-bold">وفّر {formatPrice(savings)}</span>
          </div>
        )}
        {discount > 0 && <Badge variant="danger">-{discount}%</Badge>}
      </div>

      {/* Stock */}
      {product.trackStock && product.stock != null && (
  <div
    className={`text-[13px] font-semibold ${
      product.stock > 0 ? "text-success" : "text-danger"
    }`}
  >
    {product.stock > 0
      ? `✓ متوفر (${product.stock} قطعة)`
      : "✗ نفد المخزون"}
  </div>
)}

      {/* Variants */}
      <VariantSelector
        variants={product.variants}
        selected={selectedVariants}
        onChange={(name, val) => setSelectedVariants((prev) => ({ ...prev, [name]: val }))}
      />

      {/* Quantity */}
      <div>
        <div className="text-[13px] font-bold text-secondary mb-2">الكمية</div>
        <QuantityControl value={quantity} onChange={setQuantity} />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleWaOrder}
          disabled={isPending}
          className={`w-full flex items-center justify-center gap-2.5 text-white font-black text-[17px] py-4 rounded-[16px] transition-all border-none cursor-pointer disabled:opacity-70 ${orderSent ? "bg-success" : "bg-wa hover:bg-wa-dark"}`}
          style={{ boxShadow: "0 8px 24px rgba(37,211,102,.30)" }}
        >
          {isPending ? "جاري الإرسال..." : orderSent ? "✅ تم إرسال الطلب!" : "💬 اطلب عبر واتساب"}
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 rounded-[16px] border-2 transition-all cursor-pointer disabled:opacity-60 ${
            added
              ? "bg-success-light border-success text-green-700"
              : cartError
              ? "bg-danger-light border-danger text-danger"
              : "bg-white border-gray-200 hover:border-primary hover:text-primary text-secondary"
          }`}
        >
          {isPending ? "جاري الإضافة..." : added ? "✓ تمت الإضافة للسلة!" : cartError || "🛒 أضف إلى السلة"}
        </button>
      </div>

      {/* Guarantees */}
      <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-[16px] p-4">
        {[
          { icon: "🚚", title: "توصيل سريع", sub: "خلال 2-5 أيام" },
          { icon: "✅", title: "ضمان الجودة", sub: "منتجات أصلية" },
          { icon: "🔄", title: "إرجاع مجاني", sub: "خلال 7 أيام" },
        ].map((g) => (
          <div key={g.title} className="text-center">
            <div className="text-xl mb-1">{g.icon}</div>
            <div className="text-[11px] font-bold text-secondary">{g.title}</div>
            <div className="text-[10px] text-gray-400">{g.sub}</div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {product.tags.map((tag) => (
            <span key={tag} className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
