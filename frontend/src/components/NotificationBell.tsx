"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Định dạng thời gian gửi (ví dụ: "2 phút trước", "1 giờ trước")
const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const createdAt = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
};

interface Notification {
  _id: string;
  message: string;
  image: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  userId: string;
}

const NotificationBell = ({ userId }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter(); // Dùng để chuyển trang
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch("http://localhost:3000/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);

          // Đếm số thông báo chưa đọc
          const unread = data.filter((notif: Notification) => !notif.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    fetchNotifications();
  }, [userId, getToken]);

  // Đánh dấu tất cả thông báo đã đọc
  const markAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch("http://localhost:3000/notifications/read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đọc:", error);
    }
  };

  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //Khi click vào thông báo -> Chuyển hướng đến bài viết + Ẩn dropdown
  const handleNotificationClick = (notification: Notification) => {
    window.open(notification.link, "_blank"); // Mở link trong tab mới
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🛎 Nút chuông */}
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          markAsRead();
        }}
        className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-black text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown danh sách thông báo */}
      {showDropdown && (
        <div
            className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md p-2 max-h-80 overflow-y-auto z-50"
        >
            <h3 className="text-sm font-semibold border-b pb-2 text-black">Thông báo</h3>
            {notifications.length > 0 ? (
            <div className="space-y-2">
                {notifications.map((notification) => (
                <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className="flex p-2 hover:bg-gray-100 cursor-pointer text-black"
                >
                    <Image
                    src={notification.image}
                    alt="Ảnh bài viết"
                    width={50}
                    height={50}
                    className="rounded-md"
                    />
                    <div className="ml-3">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</p>
                    </div>
                </div>
                ))}
            </div>
            ) : (
            <p className="text-gray-800 text-sm p-2">Không có thông báo mới</p>
            )}
        </div>
        )}
    </div>
  );
};

export default NotificationBell;
