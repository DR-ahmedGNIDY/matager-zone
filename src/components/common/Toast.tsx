"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ToastMessage { id: string; icon?: string; title: string; sub?: string; type?: "success"|"error"|"info"; }

export function ToastContainer({ messages, onDismiss }: { messages: ToastMessage[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2.5">
      {messages.map((m) => (
        <div key={m.id}
          className={cn(
            "flex items-center gap-3 bg-white border border-gray-100 rounded-[16px] px-4 py-3.5 shadow-xl max-w-[320px] animate-fade-up",
            m.type === "error" && "border-danger-light"
          )}
        >
          {m.icon && <span className="text-xl flex-shrink-0">{m.icon}</span>}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-secondary">{m.title}</div>
            {m.sub && <div className="text-[11px] text-gray-400 mt-0.5">{m.sub}</div>}
          </div>
          <button onClick={() => onDismiss(m.id)} className="text-gray-400 hover:text-gray-600 text-lg flex-shrink-0 bg-none border-none cursor-pointer">×</button>
        </div>
      ))}
    </div>
  );
}
