export interface Image {
  title: string;
  url: string;
  link: string;
  likes: number;
  description: string;
  userId: {
    avatar: string;
    username: string;
  };
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
}

// Fetch thông tin ảnh
export async function fetchImage(id: string, token: string): Promise<Image | null> {
  try {
    const res = await fetch(`http://localhost:3000/images/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Lỗi tải ảnh:", error);
    return null;
  }
}

// Fetch danh sách comment
export async function fetchComments(id: string, token: string): Promise<Comment[]> {
  try {
    const res = await fetch(`http://localhost:3000/interactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Lỗi tải bình luận:", error);
    return [];
  }
}

// Like ảnh
export async function likeImage(id: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:3000/interactions/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageId: id }),
    });

    return res.ok;
  } catch (error) {
    console.error("Lỗi khi like ảnh:", error);
    return false;
  }
}

// Thêm comment
export async function addComment(id: string, content: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:3000/interactions/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageId: id, content }),
    });

    return res.ok;
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    return false;
  }
}
export async function getLikeStatus(imageId: string, token: string) {
  const res = await fetch(`http://localhost:3000/interactions/like-status/${imageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function toggleLike(imageId: string, token: string) {
  const res = await fetch(`http://localhost:3000/interactions/toggle-like/${imageId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return await res.json();
}

// export async function getLikeCount(imageId: string) {
//   const res = await fetch(`http://localhost:3000/interactions/count-likes/${imageId}`);
//   if (!res.ok) return null;
//   return await res.json();
// }
// 🗑️ Xóa bình luận
export async function deleteComment(commentId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:3000/interactions/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.ok;
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    return false;
  }
}
// Chỉnh sửa bình luận
export async function editComment(commentId: string, newText: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:3000/interactions/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newText }),
    });

    return res.ok;
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa bình luận:", error);
    return false;
  }
}
// Lấy lịch sử chỉnh sửa bình luận
export async function getEditHistory(commentId: string, token: string): Promise<any | null> {
  try {
    const res = await fetch(`http://localhost:3000/interactions/edit-history/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử chỉnh sửa bình luận:", error);
    return null;
  }
}


