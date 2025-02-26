"use client";
import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  createCollection,
  deleteCollection,
  getUserCollections,
  updateCollection,
  // Giả sử bạn đã có hàm này trong api
} from "../api/collections/collectionService";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaPen, FaUpload, FaEllipsisV } from "react-icons/fa";

export default function SavedIdeas() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id || "";

  const [collections, setCollections] = useState<any[]>([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null); // Để quản lý menu mở
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingCollection, setEditingCollection] = useState<{
    id: string;
    name: string;
    thumbnail: File | null;
  } | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setImageFile(file);
    setImageSrc(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!imageFile) {
      toast.error("Vui lòng chọn ảnh để tải lên!");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("collectionName", collectionName);

    setIsUploading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Không tìm thấy token!");

      const response = await fetch("http://localhost:3000/collections", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data?._id || !data?.name) {
        throw new Error("Dữ liệu không hợp lệ!");
      }

      const updatedCollections = await getUserCollections(token, userId || "");
      setCollections(updatedCollections);

      toast.success("Tạo bảng thành công!");
      setFormVisible(false);
      setCollectionName("");
      setImageSrc(null);
      setImageFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại!"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (collectionId: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await deleteCollection(token, collectionId);
      if (response.ok) {
        setCollections((prev) =>
          prev.filter((col) => col._id !== collectionId)
        );
        toast.success("Đã xóa bộ sưu tập!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại!"
      );
    }
  };
  const handleEdit = async (
    collectionId: string,
    newName: string,
    newThumbnail: File | null
  ) => {
    const token = await getToken();
    if (!token) return;

    try {
      const updatedCollection = await updateCollection(token, collectionId, {
        name: newName,
        thumbnail: newThumbnail,
      });

      setCollections((prev) =>
        prev.map((col) => (col._id === collectionId ? updatedCollection : col))
      );

      toast.success("Cập nhật bộ sưu tập thành công!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại!"
      );
    }
  };

  useEffect(() => {
    const fetchCollections = async () => {
      if (userId) {
        try {
          const token = await getToken();
          if (token) {
            const data = await getUserCollections(token, userId || "");
            setCollections(data);
          }
        } catch (error) {
          console.error("Error fetching collections:", error);
        }
      }
    };
    fetchCollections();
  }, [userId, getToken]);
  const openEditModal = (collection: { _id: string; name: string }) => {
    setEditingCollection({
      id: collection._id,
      name: collection.name,
      thumbnail: null,
    });
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingCollection(null);
  };

  return (
    <div className="container mx-auto p-4 bg-white text-gray-900">
      <h1 className="text-3xl font-bold">Ý tưởng bạn đã lưu</h1>
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full"
          onClick={() => setFormVisible(true)}
        >
          + Tạo bảng
        </button>
        <Link href="/image-library">
          <button className="bg-green-500 text-white px-4 py-2 rounded-full">
            Thư viện ảnh
          </button>
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {collections.map((collection, index) => (
          <div
            key={collection._id || index}
            className="p-4 border rounded-lg relative"
          >
            <Link href={`/Collections/${collection._id}`}>
              <img
                src={collection.thumbnail || "/default-thumbnail.jpg"}
                alt={collection.name}
                className="w-full h-32 object-cover rounded"
              />
              <p className="mt-2 font-semibold">{collection.name}</p>
            </Link>
            <button
              className="absolute top-2 right-2 focus:outline-none text-2xl"
              onClick={() =>
                setMenuOpen(menuOpen === collection._id ? null : collection._id)
              }
            >
              <FaEllipsisV />
            </button>
            {menuOpen === collection._id && (
              <div className="absolute top-10 right-0 bg-white border rounded shadow-lg p-2">
                <button
                  className="block text-left w-full text-gray-700 hover:bg-gray-200"
                  onClick={() => openEditModal(collection)}
                >
                  Chỉnh sửa
                </button>
                <button
                  className="block text-left w-full text-red-600 hover:bg-red-100"
                  onClick={() => handleDelete(collection._id)}
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {isEditModalVisible && editingCollection && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa bộ sưu tập</h2>

            {/* Nhập tên bộ sưu tập */}
            <input
              type="text"
              className="border p-2 rounded w-full mb-4"
              value={editingCollection.name}
              onChange={(e) =>
                setEditingCollection(
                  (prev) => prev && { ...prev, name: e.target.value }
                )
              }
            />

            {/* Upload ảnh thumbnail */}
            <div
              className="relative border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onClick={() => document.getElementById("editFileInput")?.click()}
            >
              <input
                id="editFileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setEditingCollection(
                    (prev) => prev && { ...prev, thumbnail: file }
                  );
                }}
              />
              {editingCollection.thumbnail ? (
                <Image
                  src={URL.createObjectURL(editingCollection.thumbnail)}
                  alt="New Thumbnail"
                  width={200}
                  height={200}
                  className="w-full rounded-lg"
                />
              ) : (
                <p>Chọn ảnh mới</p>
              )}
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={closeEditModal}
              >
                Hủy
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (editingCollection) {
                    handleEdit(
                      editingCollection.id,
                      editingCollection.name,
                      editingCollection.thumbnail
                    );
                    closeEditModal();
                  }
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <input
              type="text"
              placeholder="Tên bảng"
              className="border p-2 rounded w-full mb-4"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />
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
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
            >
              Tạo
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
