"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaPen, FaUpload } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@clerk/nextjs";

export default function yncUploadPin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [tags, setTags] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [url, setUrl] = useState(""); // State for URL input
  interface Collection {
    _id: string;
    name: string;
  }

  const [collections, setCollections] = useState<Collection[]>([]);
  const { getToken } = useAuth();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setImageFile(file);
    setImageSrc(URL.createObjectURL(file));
    setUrl(""); // Clear URL input if an image file is uploaded
  };

  const handleUrlUpload = async () => {
    if (!url) {
      toast.error("Vui lòng nhập một liên kết hợp lệ!");
      return;
    }
  
    // Proxy URL của backend NestJS
    const proxyUrl = "http://localhost:3000/images/proxy/url?url=";
    const proxiedUrl = proxyUrl + encodeURIComponent(url);
  
    try {
      const token = await getToken();
      const response = await fetch(proxiedUrl,{
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Không thể tải hình ảnh từ URL!");
  
      const blob = await response.blob();
      const file = new File([blob], "image-from-url.jpg", { type: blob.type });
  
      setImageFile(file);
      setImageSrc(URL.createObjectURL(file));
      setUrl(""); // Xóa input sau khi tải lên thành công
  
      toast.success("Tải ảnh thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải hình ảnh từ URL!");
    }
  };
  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!imageFile) {
      toast.error("Vui lòng chọn ảnh để tải lên!");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("link", link);
    formData.append("tags", JSON.stringify(tags.split(",")));
    formData.append("isPrivate", isPrivate.toString());

    if (selectedBoard && selectedBoard !== "default") {
      formData.append("board", selectedBoard);
      console.log("Selected board:", selectedBoard);
    }

    setIsUploading(true);

    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3000/images/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error("Tải lên thất bại!");

      toast.success("Tải lên thành công!");
      setTitle("");
      setDescription("");
      setLink("");
      setSelectedBoard(""); // Reset selectedBoard
      setTags("");
      setIsPrivate(false);
      setImageSrc(null);
      setImageFile(null);
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = await getToken();
        const response = await fetch("http://localhost:3000/images", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Không thể lấy danh sách bảng!");

        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bảng:", error);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 p-4 gap-4">
      {/* Upload Image Card */}
      <Card className="flex-1 p-4">
        <CardContent>
          <div
            className="relative border-dashed border-2 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {imageSrc ? (
              <>
                <Image
                  src={imageSrc}
                  alt="Upload Preview"
                  width={600}
                  height={800}
                  className="w-full rounded-lg"
                />
                <Button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                  <FaPen />
                </Button>
              </>
            ) : (
              <>
                <FaUpload className="text-3xl mb-2" />
                <p>Chọn một tệp hoặc kéo và thả tệp ở đây</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Information Input Card */}
      <Card className="flex-1 p-4">
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button
              className="bg-red-500 text-white"
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? "Đang tải lên..." : "Đăng"}
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Tiêu đề</label>
              <Input
                placeholder="Thêm tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700">Mô tả</label>
              <Textarea
                placeholder="Thêm mô tả chi tiết"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700">Liên kết (URL hình ảnh)</label>
              <Input
                placeholder="Nhập liên kết hình ảnh"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button
                onClick={handleUrlUpload}
                className="mt-2 bg-blue-600 text-white"
              >
                Tải hình từ URL
              </Button>
            </div>
            <div>
              <label className="block text-gray-700">Bảng</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedBoard || "default"}
                onChange={(e) =>
                  setSelectedBoard(
                    e.target.value === "default" ? "" : e.target.value
                  )
                }
              >
                <option value="default">Chọn bảng</option>
                {collections.length > 0 ? (
                  collections.map((collection) => (
                    <option key={collection._id} value={collection._id}>
                      {collection.name}
                    </option>
                  ))
                ) : (
                  <option value="none" disabled>
                    Bạn chưa có bảng nào
                  </option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Chủ đề được gắn thẻ</label>
              <Input
                placeholder="Tìm kiếm thẻ"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                checked={isPrivate}
                onCheckedChange={() => setIsPrivate(!isPrivate)}
              />
              <label className="ml-2 text-gray-700">
                Đừng lo, mọi người sẽ không nhìn thấy thẻ của bạn
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <ToastContainer />
    </div>
  );
}