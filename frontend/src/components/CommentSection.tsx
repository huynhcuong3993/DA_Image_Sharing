"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { deleteComment } from "@/app/api/detailimages/detailImagesapi";

export default function CommentSection({ imageId }: { imageId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [totalComments, setTotalComments] = useState(0);
  const { getToken, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách comment và tổng số comment
  useEffect(() => {
    const fetchComments = async () => {
      const token = await getToken();
      if (!token) {
        console.error("Người dùng chưa đăng nhập");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:3000/interactions/comments/${imageId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Lỗi khi tải bình luận");

        const data = await res.json();
        if (Array.isArray(data)) {
          setComments(data);
          setTotalComments(data.length);
        } else {
          console.error("Dữ liệu không phải là mảng:", data);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };

    fetchComments();
  }, [imageId]);

  // Thêm bình luận mới
  async function handleAddComment() {
    if (!commentText.trim()) return;
  
    setIsLoading(true);
  
    try {
      const token = await getToken();
      if (!token || !userId) {
        console.error("Người dùng chưa đăng nhập");
        return;
      }
  
      const res = await fetch(`http://localhost:3000/interactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetId: imageId,
          userId,
          targetType: "image",
          type: "comment",
          comment: commentText,
        }),
      });
  
      if (res.ok) {
        setCommentText(""); // Reset input
  
        // Gọi lại API để lấy bình luận mới nhất
        const resComments = await fetch(
          `http://localhost:3000/interactions/comments/${imageId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (resComments.ok) {
          const data = await resComments.json();
          setComments(data); // Cập nhật lại danh sách bình luận
          setTotalComments(data.length); // Cập nhật tổng số bình luận
        }
      } else {
        console.error("Lỗi khi thêm bình luận");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  }
  

  // Xoá bình luận
  async function handleDeleteComment(commentId: string) {
    const token = await getToken();
    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/interactions/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        // Xoá bình luận khỏi state
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentId)
        );
        setTotalComments((prevTotal) => prevTotal - 1);
      } else {
        console.error("Lỗi khi xoá bình luận");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }

  // Cập nhật nội dung bình luận khi chỉnh sửa
  async function handleSaveEdit(commentId: string, updatedText: string) {
    const token = await getToken();
    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }
  
    try {
      const res = await fetch(
        `http://localhost:3000/interactions/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newText: updatedText, userId  }), // Đảm bảo dùng đúng tên trường
        }
      );
  
      if (res.ok) {
        const data = await res.json();
        // Cập nhật bình luận sau khi sửa
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, comment: updatedText, isEditing: false }
              : comment
          )
        );
        setTotalComments(data.length); // Cập nhật số lượng bình luận
      } else {
        console.error("Lỗi khi lưu chỉnh sửa");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }
  

  // Bắt đầu chỉnh sửa bình luận
  function startEditComment(commentId: string, currentComment: string) {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? { ...comment, isEditing: true, editText: currentComment }
          : comment
      )
    );
  }

  return (
    <div className="border-t pt-4">
      <p className="text-gray-700 mb-2">
        Bạn nghĩ gì? ({totalComments} bình luận)
      </p>
      <div className="flex items-center">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full bg-gray-100 p-2 rounded-lg"
          placeholder="Thêm một nhận xét..."
          type="text"
        />
        <button
          onClick={handleAddComment}
          className="ml-2 text-gray-500"
          disabled={isLoading}
        >
          {isLoading ? "Đang gửi..." : "Gửi"}
        </button>
      </div>

      {/* Danh sách bình luận */}
      <div className="mt-4">
        {comments.map((comment) => (
          <div key={comment._id} className="flex items-start mb-3">
            <img
              src={comment.userId?.avatar || "/default-avatar.png"}
              alt="Avatar"
              className="w-8 h-8 rounded-full mr-2"
            />
            <div className="flex-1">
              <p className="text-gray-800 font-semibold">
                {comment.userId?.username || "Ẩn danh"}
              </p>
              {comment.isEditing ? (
                <input
                  value={comment.editText}
                  onChange={(e) =>
                    setComments((prevComments) =>
                      prevComments.map((prevComment) =>
                        prevComment._id === comment._id
                          ? { ...prevComment, editText: e.target.value }
                          : prevComment
                      )
                    )
                  }
                  className="w-full bg-gray-100 p-1 rounded"
                />
              ) : (
                <p className="text-gray-600">{comment.comment}</p>
              )}
            </div>

            {/* Hiển thị các nút Sửa và Xoá chỉ khi người dùng là chủ bình luận */}
            {comment.userId?.clerkId === userId && (
              <div className="ml-2">
                {comment.isEditing ? (
                  <button
                    onClick={() => handleSaveEdit(comment._id, comment.editText)}
                    className="text-blue-500"
                  >
                    💾 Lưu
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        startEditComment(comment._id, comment.comment)
                      }
                      className="text-yellow-500"
                    >
                      ✏ Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500"
                    >
                      🗑 Xoá
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
