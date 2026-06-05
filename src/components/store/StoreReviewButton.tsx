"use client";
import { useState } from "react";
import ReviewForm from "./ReviewForm";

interface StoreReviewButtonProps {
  storeId:    string;
  canReview:  boolean;
  reason?:    string;
  requiresAuth?: boolean;
}

const REASON_MSGS: Record<string, string> = {
  ALREADY_REVIEWED: "لقد أضفت تقييماً من قبل",
  NOT_PURCHASED:    "يجب إتمام طلب من المتجر أولاً",
  STORE_INACTIVE:   "المتجر غير متاح",
};

export default function StoreReviewButton({
  storeId, canReview, reason, requiresAuth,
}: StoreReviewButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (requiresAuth) {
      window.location.href = "/login?callbackUrl=" + window.location.pathname;
      return;
    }
    if (!canReview) return;
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!canReview && !requiresAuth}
        title={!canReview && reason ? REASON_MSGS[reason] : undefined}
        className={`btn btn-primary btn-sm text-sm ${!canReview && !requiresAuth ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {requiresAuth
          ? "+ سجّل دخول للتقييم"
          : !canReview && reason
          ? REASON_MSGS[reason]
          : "+ أضف تقييمك"}
      </button>

      {open && (
        <ReviewForm
          storeId={storeId}
          onClose={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      )}
    </>
  );
}
