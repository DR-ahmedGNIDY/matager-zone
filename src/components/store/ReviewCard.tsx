import StarRating from "@/components/common/StarRating";
import { formatRelativeTime, getInitials } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: Date | string;
    user: { id: string; name?: string | null; image?: string | null };
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-b-0">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {review.user.image
          ? <img src={review.user.image} alt={review.user.name || ""} className="w-full h-full rounded-full object-cover" />
          : getInitials(review.user.name)
        }
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-[14px] text-secondary">{review.user.name || "مجهول"}</span>
          <span className="text-[11px] text-gray-400">{formatRelativeTime(review.createdAt)}</span>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
        {review.comment && (
          <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  );
}
