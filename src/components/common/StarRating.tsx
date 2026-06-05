"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}

export default function StarRating({
  value = 0, onChange, readonly = false,
  size = "md", showValue = false, count,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" };
  const active = hover || value;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((star) => (
          <span
            key={star}
            className={cn(
              sizes[size], "transition-colors select-none",
              active >= star ? "text-accent" : "text-gray-200",
              !readonly && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
          >★</span>
        ))}
      </div>
      {showValue && value > 0 && (
        <span className={cn("font-bold text-secondary", sizes[size])}>{value.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className={cn("text-gray-400", size === "sm" ? "text-[10px]" : "text-xs")}>({count})</span>
      )}
    </div>
  );
}
