"use client";

import { cn, buildWhatsAppUrl } from "@/lib/utils";

interface WaButtonProps {
  phone: string;
  message: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
}

export default function WaButton({
  phone,
  message,
  label = "اطلب عبر واتساب",
  size = "md",
  variant = "full",
  className,
}: WaButtonProps) {
  const handleClick = () => {
    const url = buildWhatsAppUrl(phone, message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const sizeClasses = {
    sm:  "text-xs py-1.5 px-3 rounded-[8px]",
    md:  "text-sm py-2.5 px-4 rounded-[10px]",
    lg:  "text-base py-4 px-6 rounded-[16px]",
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 bg-wa hover:bg-wa-dark text-white font-bold transition-all",
          sizeClasses[size],
          className
        )}
      >
        <WaIcon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center justify-center gap-2 bg-wa hover:bg-wa-dark text-white font-bold transition-all",
        size === "lg" && "shadow-wa",
        sizeClasses[size],
        className
      )}
    >
      <WaIcon size={size === "sm" ? 14 : size === "lg" ? 22 : 16} />
      {label}
    </button>
  );
}

function WaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.554 4.105 1.523 5.83L.057 23.286c-.09.376.235.7.612.61l5.568-1.459C7.9 23.452 9.902 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.87 0-3.632-.503-5.15-1.38l-.37-.218-3.824 1.002 1.022-3.724-.24-.386C2.503 15.634 2 13.87 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}
