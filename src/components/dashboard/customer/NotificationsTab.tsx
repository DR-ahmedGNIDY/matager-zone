"use client";

import { useState } from "react";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/customer.actions";
import { EmptyState } from "@/components/common/EmptyState";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: Date | string;
}

const TYPE_ICONS: Record<string, string> = {
  ORDER: "🛒",
  STORE: "🏪",
  REVIEW: "⭐",
  SYSTEM: "🔔",
  PROMOTION: "🎁",
  FOLLOW: "👥",
};

interface Props {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationsTab({
  notifications: initial,
  unreadCount: initialUnread,
}: Props) {
  const [items, setItems] = useState(initial);
  const [unread, setUnread] = useState(initialUnread);

  const markRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              isRead: true,
            }
          : n
      )
    );

    setUnread((prev) => Math.max(0, prev - 1));

    void markNotificationReadAction(id);
  };

  const markAllRead = () => {
    setItems((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
      }))
    );

    setUnread(0);

    void markAllNotificationsReadAction();
  };

  if (items.length === 0) {
    return (
      <div>
        <h2 className="text-[22px] font-black text-secondary mb-5">
          🔔 الإشعارات
        </h2>

        <EmptyState
          icon="🔔"
          title="لا توجد إشعارات"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[22px] font-black text-secondary">
          🔔 الإشعارات

          {unread > 0 && (
            <span className="mr-2 bg-danger text-white text-[12px] font-bold px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </h2>

        {unread > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[13px] text-primary font-semibold hover:underline bg-none border-none cursor-pointer"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              if (!n.isRead) {
                markRead(n.id);
              }
            }}
            className={`bg-white rounded-[16px] border p-4 flex gap-3 transition-all ${
              !n.isRead
                ? "border-primary/20 bg-primary-ultra cursor-pointer hover:bg-primary-50"
                : "border-gray-100"
            }`}
          >
            <span className="text-xl flex-shrink-0">
              {TYPE_ICONS[n.type] ?? "🔔"}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[14px] font-bold text-secondary">
                  {n.title}
                </div>

                <div className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                  {formatRelativeTime(n.createdAt)}
                </div>
              </div>

              <div className="text-[13px] text-gray-500 mt-0.5">
                {n.message}
              </div>

              {n.link && (
                <a
                  href={n.link}
                  className="text-[12px] text-primary hover:underline mt-1 inline-block no-underline"
                >
                  عرض التفاصيل ←
                </a>
              )}
            </div>

            {!n.isRead && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}