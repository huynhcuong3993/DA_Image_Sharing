"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

interface LikeButtonProps {
  imageId: string;
}

export default function LikeButton({ imageId }: LikeButtonProps) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { getToken, userId } = useAuth();


  useEffect(() => {
    async function fetchLikeStatus() {
      try {
        const token = await getToken();
        if (!token || !userId) return;


        const likeRes = await fetch(`http://localhost:3000/interactions/like-status/${imageId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ targetId: imageId, userId,targetType: "image", type: "like" }),
        });
        if (likeRes.ok) {
          const likeData = await likeRes.json();
          setIsLiked(likeData.liked);
        }

        // Lấy tổng số like
        console.log(token)
        const countRes = await fetch(`http://localhost:3000/interactions/count/${imageId}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (countRes.ok) {
          const countData = await countRes.json();
          setLikes(countData.likes);
        }
      } catch (error) {
        console.error("Lỗi khi tải trạng thái like:", error);
      }
    }

    fetchLikeStatus();
  }, [imageId, getToken, userId]);

  // Xử lý like/unlike
  async function handleLike() {
    try {
      const token = await getToken();
      if (!token) {
        console.error("Người dùng chưa đăng nhập");
        return;
      }

      const res = await fetch(`http://localhost:3000/interactions/toggle-like/${imageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetId: imageId, userId,targetType: "image", type: "like" }),
      });

      if (res.ok) {
        setLikes((prev) => prev + (isLiked ? -1 : 1));
        setIsLiked(!isLiked);
      } else {
        console.error("Lỗi khi like ảnh");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }

  return (
    <button onClick={handleLike} className={`text-lg flex items-center space-x-2`}>
      <FontAwesomeIcon icon={faHeart} className={`h-6 w-6 ${isLiked ? "text-red-600" : "text-gray-600"}`} />
      <span>{likes} lượt thích</span>
    </button>
  );
}
