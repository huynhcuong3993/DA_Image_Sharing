"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faEdit,
  faTrash,
  faBookmark,
  faEye, faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import ShareButton from "@/components/ShareButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Đảm bảo đúng tên file
import EditImageModal from "./UpdateImageModel";

interface Image {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
  isPrivate: boolean;
}
import { toast } from "react-toastify";
export default function ImageCard({
  image,
  openMenuId,
  setOpenMenuId,
  removeImage,
}: {
  image: Image;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  removeImage: (imageId: string) => void;
}) {
  const { getToken } = useAuth();
  const [boards, setBoards] = useState<{ _id: string; name: string }[]>([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(image.isPrivate);
  const isOpen = openMenuId === image._id;
  

  useEffect(() => {
    async function fetchBoards() {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch("http://localhost:3000/images", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Không thể lấy danh sách bảng!");

        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bảng:", error);
      }
    }

    fetchBoards();
  }, [getToken]);

  async function handleSave() {
    if (!selectedBoard) return;
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `http://localhost:3000/collections/${selectedBoard}/add-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageId: image._id }),
        }
      );

      if (!response.ok) throw new Error("Lỗi khi lưu ảnh!");
      setIsOpenDialog(false);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Lỗi khi lưu ảnh:", error);
    }
  }

  // 🟢 Fetch trạng thái `isPrivate` khi component load
  useEffect(() => {
    const fetchPrivacyStatus = async () => {
      try {
        const token = await getToken(); // Lấy token
        if (!token) return;
  
        const res = await fetch(`http://localhost:3000/images/${image._id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
            "Content-Type": "application/json",
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          setIsPrivate(data.isPrivate); // 🟢 Cập nhật trạng thái từ API
        } else {
          console.error("Lỗi lấy trạng thái ảnh:", await res.text());
        }
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái ảnh:", error);
      }
    };
  
    fetchPrivacyStatus();
  }, [image._id, getToken]); // Chạy lại khi `image._id` hoặc `getToken` thay đổi

  const togglePrivacy = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`http://localhost:3000/images/${image._id}/privacy`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: !isPrivate }),
      });
  
      if (res.ok) {
        setIsPrivate(!isPrivate);
      } else {
        console.error("Lỗi cập nhật trạng thái ảnh");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
    }
  };
  async function handleDelete() {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa ảnh này?");
    if (!confirmDelete) return;

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `http://localhost:3000/images/${image._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Lỗi khi xóa ảnh!");

      // Xóa ảnh khỏi danh sách (nếu có state chứa danh sách ảnh)
      removeImage(image._id); 
      setOpenMenuId(null); // Đóng menu sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      toast.error("Không thể xóa ảnh, vui lòng thử lại sau.");
    }
  }

  return (
    <div key={image._id} className="relative bg-gray-50 rounded-lg shadow p-2">
      {/* Ảnh */}
      <Link href={`/detailImages/image/${image._id}`}>
        <img
          alt={image.title}
          className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-80 transition"
          src={image.url}
        />
      </Link>

      {/* Icon menu */}
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition text-2xl p-2 bg-white rounded-full shadow"
        onClick={() => setOpenMenuId(isOpen ? null : image._id)}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>

      {/* Menu tùy chọn */}
      {isOpen && (
        <div className="absolute top-12 right-2 bg-white shadow-lg rounded-md py-2 w-36 z-10">
          <button
            className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
            onClick={() => {
              setIsEditModalOpen(true);
              setOpenMenuId(null); // Đóng menu khi mở modal
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Chỉnh sửa
          </button>
          <button
            className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-sm text-red-600"
            onClick={handleDelete}
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Xóa ảnh
          </button>

          <button
            className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
            onClick={() => setIsOpenDialog(true)}
          >
            <FontAwesomeIcon icon={faBookmark} className="mr-2" />
            Lưu ảnh
          </button>

          {/* Thêm nút bật/tắt private */}
          <button
            className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
            onClick={togglePrivacy}
          >
            <FontAwesomeIcon icon={isPrivate ? faEyeSlash : faEye} className="mr-2" />
            {isPrivate ? "Hiện ảnh" : "Ẩn ảnh"}
          </button>

        </div>
      )}

      {/* Modal chỉnh sửa ảnh */}
      <EditImageModal
        image={image}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Dialog lưu ảnh */}
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn bảng để lưu ảnh</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {boards.length > 0 ? (
              boards.map((board) => (
                <button
                  key={board._id}
                  className={`w-full p-2 rounded-md ${
                    selectedBoard === board._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setSelectedBoard(board._id)}
                >
                  {board.name}
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500">Không có bảng nào</p>
            )}
          </div>
          <Button onClick={handleSave} disabled={!selectedBoard}>
            Xác nhận
          </Button>
        </DialogContent>
      </Dialog>

      {/* Like và Share */}
      <div className="flex items-center justify-between mt-2">
        <LikeButton imageId={image._id} />
        <ShareButton imageUrl={image.url} />
      </div>
    </div>
  );
}
