"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const ImageCard: React.FC<{ id: string; src: string; alt: string; token: string }> = ({ id, src, alt, token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [boards, setBoards] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch("http://localhost:3000/images", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Không thể lấy danh sách bảng!");

        const data = await response.json();
        console.log(data);
        setBoards(data); // Cập nhật danh sách bảng
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bảng:", error);
      }
    };

    fetchBoards();
  }, [token]);

  const handleSave = async () => {
    if (!selectedBoard) return;

    try {
      const response = await fetch(`http://localhost:3000/collections/${selectedBoard}/add-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageId: id }), // Sửa lại request body
      });

      if (!response.ok) throw new Error("Lỗi khi lưu ảnh!");

      setIsOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu ảnh:", error);
    }
  };

  return (
    <>
      <Card className="relative cursor-pointer">
        <Link href={`/detailImages/image/${id}`}>
          <img alt={alt} className="rounded-lg w-full h-48 object-cover" src={src} />
        </Link>

        <div className="absolute top-2 right-2">
          <Button size="sm" onClick={() => setIsOpen(true)}>
            Lưu
          </Button>
        </div>
      </Card>

      {/* Dialog chọn bảng */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {boards.length > 0 ? (
              boards.map((board) => (
                <button
                  key={board._id}
                  className={`w-full p-2 rounded-md ${selectedBoard === board._id ? "bg-blue-500 text-white" : "bg-gray-100"}`}
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
    </>
  );
};

export default ImageCard;
