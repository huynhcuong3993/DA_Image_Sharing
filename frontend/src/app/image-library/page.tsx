"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ImageCard from "@/components/library/ImageCard";
import { toast } from "react-toastify";

interface Image {
  _id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
}

async function fetchImages(userId: string, token: string): Promise<Image[]> {
  try {
    const res = await fetch(`http://localhost:3000/images/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.map((img: any) => ({
      _id: img._id,
      title: img.title,
      url: img.url,
      description: img.description ?? "", 
      tags: img.tags ?? [],
    }));
  } catch (error) {
    console.error("Lỗi tải ảnh:", error);
    return [];
  }
}

export default function ImageLibraryPage() {
  const { userId, getToken } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      if (!userId) return;
      const token = await getToken();
      if (!token) return;

      setLoading(true);
      const fetchedImages = await fetchImages(userId, token);
      setImages(fetchedImages);
      setLoading(false);
    }

    loadImages();
  }, [userId, getToken]);

  function removeImage(imageId: string) {
    setImages((prev) => prev.filter((img) => img._id !== imageId));
    toast.success("Ảnh đã được xóa thành công!");
  }

  if (!userId) return <p>Vui lòng đăng nhập để xem thư viện ảnh.</p>;
  if (loading) return <p>Đang tải ảnh...</p>;
  if (!images.length) return <p>Không có ảnh nào trong thư viện.</p>;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center p-4">
      <div className="bg-white max-w-5xl w-full rounded-lg shadow-lg overflow-hidden p-6">
        <div className="flex items-center mb-4">
          <Link href="/">
            <button className="text-2xl text-gray-600 hover:text-gray-800 transition">
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold ml-4">Thư viện ảnh của bạn</h1>
        </div>

        {/* Grid hiển thị danh sách ảnh */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <ImageCard 
              key={image._id} 
              image={{ ...image, description: image.description ?? "", tags: image.tags ?? [] }} 
              openMenuId={openMenuId} 
              setOpenMenuId={setOpenMenuId} 
              removeImage={removeImage} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
