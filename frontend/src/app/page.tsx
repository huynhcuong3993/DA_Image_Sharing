// app/page.tsx
// 'use client'
import { auth } from "@clerk/nextjs/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { useState } from "react";
import ImageCard from "@/components/ImageCard";

// Server component
export default async function HomePage() {
  const { getToken } = await auth();
  const token = await getToken();

  // Kiểm tra token
  if (!token) {
    return <div>Đang tải...</div>; // Hoặc thông báo lỗi khi không có token
  }

  // Fetch images từ API
  const res = await fetch("http://localhost:3000/images", {
    headers: {
      Authorization: `Bearer ${token}`, // Gửi token trong header
    },
  });

  if (!res.ok) {
    console.error("Lỗi fetch images");
    return <div>Không thể tải hình ảnh</div>; // Xử lý khi có lỗi
  }

  const images = await res.json();
  const publicImages = images.filter((image: { isPrivate: boolean }) => !image.isPrivate);

  return (
    <div>
      <main className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {publicImages.map((image: { _id: string; url: string; title: string }) => (
          <ImageCard
            key={image._id}
            id={image._id}
            src={image.url}
            alt={image.title}
            token = {token}
          />
        ))}
      </main>
    </div>
  );
}


