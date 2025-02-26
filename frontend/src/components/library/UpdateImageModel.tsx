"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/nextjs";

interface Image {
  _id: string;
  title: string;
  description: string;
  tags: string[];
}

interface EditImageModalProps {
  image: Image;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditImageModal({ image, isOpen, onClose }: EditImageModalProps) {
  const { getToken } = useAuth();
  const [title, setTitle] = useState(image?.title || "");
  const [description, setDescription] = useState(image?.description || "");
  const [tags, setTags] = useState(image?.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:3000/images/${image._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(",").map(tag => tag.trim()),
        }),
      });

      if (!response.ok) throw new Error("Lỗi cập nhật ảnh!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa ảnh</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề ảnh" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ảnh" />
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (cách nhau bởi dấu phẩy)" />
        </div>
        <Button onClick={handleUpdate} disabled={loading}>
          {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
