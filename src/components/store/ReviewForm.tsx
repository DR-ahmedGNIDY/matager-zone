"use client";
import { useState, useTransition } from "react";
import StarRating from "@/components/common/StarRating";
import { submitStoreReviewAction, submitProductReviewAction } from "@/actions/review.actions";

interface ReviewFormProps {
  // Exactly one of storeId or productId must be provided
  storeId?:   string;
  productId?: string;
  onClose:    () => void;
  onSuccess?: () => void;
}

export default function ReviewForm({ storeId, productId, onClose, onSuccess }: ReviewFormProps) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating)              { setError("يرجى اختيار تقييم"); return; }
    if (comment.length < 10)  { setError("التعليق يجب أن يكون 10 أحرف على الأقل"); return; }
    setError("");

    startTransition(async () => {
      const input = { rating, comment };
      const result = storeId
        ? await submitStoreReviewAction(storeId, input)
        : await submitProductReviewAction(productId!, input);

      if (!result.success) {
        if (result.requiresAuth) {
          window.location.href = "/login?callbackUrl=" + window.location.pathname;
          return;
        }
        setError(result.error ?? "حدث خطأ");
        return;
      }
      setSuccess(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9000] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[24px] w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[16px] font-black text-secondary">⭐ أضف تقييمك</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl bg-none border-none cursor-pointer">×</button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-[15px] font-bold text-secondary">شكراً على تقييمك!</p>
            <p className="text-[13px] text-gray-400 mt-1">سيظهر تقييمك بعد المراجعة.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className="form-label mb-2 block">تقييمك *</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <label className="form-label mb-1.5 block">تعليقك *</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-input"
                style={{ minHeight: "90px" }}
                placeholder="شارك تجربتك..."
                rows={4}
              />
              <div className="text-[11px] text-gray-400 text-left mt-1">{comment.length} / 1000</div>
            </div>
            {error && <p className="text-danger text-[13px]">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={isPending} className="btn btn-primary flex-1">
                {isPending ? "جاري الإرسال..." : "إرسال التقييم"}
              </button>
              <button type="button" onClick={onClose} className="btn btn-outline">إلغاء</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
