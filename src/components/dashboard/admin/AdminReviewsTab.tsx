"use client";
import { useState, useTransition } from "react";
import { formatRelativeTime } from "@/lib/utils";
import { approveReviewAction, deleteReviewAction } from "@/actions/admin.actions";
import { EmptyState } from "@/components/common/EmptyState";

interface Review {
  id: string; reviewType: string; rating: number; comment: string | null;
  isApproved: boolean; createdAt: Date | string;
  user:    { id: string; name: string | null; email: string };
  store?:  { id: string; name: string; slug: string } | null;
  product?:{ id: string; name: string } | null;
}

interface Props { reviews: Review[] }

export default function AdminReviewsTab({ reviews: initial }: Props) {
  const [reviews, setReviews] = useState(initial);
  const [, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const r = await approveReviewAction(id);
      if (r.success) setReviews((prev) => prev.map((rv) => rv.id === id ? { ...rv, isApproved: true } : rv));
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const r = await deleteReviewAction(id);
      if (r.success) setReviews((prev) => prev.filter((rv) => rv.id !== id));
    });
  };

  const pending = reviews.filter((r) => !r.isApproved);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-black text-white">
          ⭐ التقييمات قيد المراجعة
          {pending.length > 0 && (
            <span className="mr-2 bg-danger text-white text-[12px] font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          )}
        </h2>
      </div>

      {pending.length === 0 ? (
        <EmptyState icon="⭐" title="لا توجد تقييمات قيد المراجعة 🎉" />
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((review) => (
            <div key={review.id} className="bg-white/5 border border-white/10 rounded-[16px] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[11px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full">
                      {review.reviewType === "STORE" ? "🏪 متجر" : "📦 منتج"}
                    </span>
                    <div className="flex gap-0.5">
                      {"★★★★★".split("").map((s, i) => (
                        <span key={i} className={i < review.rating ? "text-accent text-sm" : "text-gray-700 text-sm"}>{s}</span>
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-500">{formatRelativeTime(review.createdAt)}</span>
                  </div>

                  {/* Subject */}
                  {review.store && (
                    <a href={`/store/${review.store.slug}`} target="_blank"
                      className="text-[12px] text-primary hover:underline no-underline">
                      {review.store.name}
                    </a>
                  )}
                  {review.product && (
                    <span className="text-[12px] text-gray-300">{review.product.name}</span>
                  )}

                  {/* Author */}
                  <div className="text-[12px] text-gray-500 mt-0.5">
                    بواسطة: {review.user.name || review.user.email}
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-[13px] text-gray-300 mt-2 leading-relaxed">{review.comment}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleApprove(review.id)}
                    className="text-[12px] bg-success/20 text-green-400 hover:bg-success/30 px-3 py-1.5 rounded-[8px] border-none cursor-pointer">
                    ✅ نشر
                  </button>
                  <button onClick={() => handleDelete(review.id)}
                    className="text-[12px] bg-danger/20 text-red-400 hover:bg-danger/30 px-3 py-1.5 rounded-[8px] border-none cursor-pointer">
                    🗑️ حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
