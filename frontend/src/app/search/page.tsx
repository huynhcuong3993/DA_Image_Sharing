"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { searchImages } from "../api/search/searchapi";
import { useAuth } from "@clerk/nextjs";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const { getToken, isSignedIn } = useAuth(); // Lấy token và trạng thái đăng nhập
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!query || !isSignedIn) return;

      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error("Không có token hợp lệ!");

        const data = await searchImages(query, token); // Gửi token trong API call
        setResults(data);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, isSignedIn]);

  if (!isSignedIn) {
    return <p className="text-center text-red-500">Vui lòng đăng nhập để tìm kiếm ảnh.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>

      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {results.map((image) => (
            <Link key={image._id} href={`/detailImages/image/${image._id}`}>
              <div className="border rounded-lg overflow-hidden hover:shadow-lg">
                <Image
                  src={image.url}
                  alt={image.title}
                  width={300}
                  height={200}
                  className="object-cover w-full h-48"
                />
                <div className="p-2">
                  <h2 className="font-semibold">{image.title}</h2>
                  <p className="text-sm text-gray-500">{image.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
