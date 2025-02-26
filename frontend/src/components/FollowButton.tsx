"use client";
import { useState, useEffect } from "react";
import { followUser, unfollowUser, checkFollowStatus  } from "../app/api/follow/follow";
import { useAuth } from "@clerk/nextjs";

interface FollowButtonProps {
  userId: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId }) => {
  const { getToken } = useAuth();
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("  FollowButton nhận userId:", userId);
    // Kiểm tra trạng thái theo dõi khi component mount
    const checkStatus = async () => {
      const token = await getToken();
      if (!token) return;
      
      // Gọi API kiểm tra trạng thái follow (nếu cần)
      const status = await checkFollowStatus(userId, token);
      setIsFollowing(status);
      console.log(`Check follow status: ${userId}`);
    };
    checkStatus();
  }, [userId, getToken]);

  const handleFollowToggle = async () => {
    setLoading(true);
    const token = await getToken();
    if (!token) {
      console.error("Người dùng chưa đăng nhập!");
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(userId, token);
      } else {
        await followUser(userId, token);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Lỗi khi cập nhật theo dõi:", error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleFollowToggle}
      className={`px-4 py-2 text-white rounded ${isFollowing ? "bg-red-500" : "bg-blue-500"}`}
      disabled={loading}
    >
      {loading ? "Đang xử lý..." : isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
    </button>
  );
};

export default FollowButton;
