export const createCollection = async (token: string, name: string, userId: string, thumbnail?: string) => {
  const response = await fetch('http://localhost:3000/collections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Thêm token vào headers
    },
    body: JSON.stringify({ name, userId, thumbnail }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo bộ sưu tập.');
  }

  return response.json();
};

export const getUserCollections = async (token: string, userId: string) => {
  const response = await fetch(`http://localhost:3000/collections/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`, // Thêm token vào headers
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Có lỗi xảy ra khi lấy bộ sưu tập.');
  }

  return response.json();
};

export const getCollectionImages = async (token: string, collectionId: string) => {
  console.log("Fetching collection images...");
  
  const response = await fetch(`http://localhost:3000/collections/detail/${collectionId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`, // Thêm token vào headers
      "Cache-Control": "no-cache", // Yêu cầu server không cache
      "Pragma": "no-cache",
    },
    cache: "no-store", // Ngăn fetch API sử dụng cache
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Có lỗi xảy ra khi lấy bộ sưu tập.");
  }

  return response.json();
};

export async function updateImageOrder(token: string, collectionId: string, imageOrder: string[]) {
  try {
    console.log("test")
    const res = await fetch(`http://localhost:3000/collections/${collectionId}/update-order`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageOrder }),
    });

    if (!res.ok) throw new Error("Lỗi khi cập nhật thứ tự ảnh");

    return await res.json();
  } catch (error) {
    console.error("Lỗi khi cập nhật thứ tự ảnh:", error);
    return null;
  }
}
export const deleteCollection = async (token: string, collectionId: string) => {
  try {
    const response = await fetch(`http://localhost:3000/collections/${collectionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || "Không thể xóa bộ sưu tập!");
    }

    return response;
  } catch (error) {
    throw error;
  }
};
export const updateCollection = async (
  token: string,
  collectionId: string,
  updatedData: { name?: string; thumbnail?: File | null }
) => {
  try {
    const formData = new FormData();

    if (updatedData.name) {
      formData.append("name", updatedData.name);
    }
    if (updatedData.thumbnail) {
      formData.append("thumbnail", updatedData.thumbnail);
    }

    const response = await fetch(`http://localhost:3000/collections/${collectionId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || "Không thể cập nhật bộ sưu tập!");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

export const removeImageFromCollection = async (token: string, collectionId: string, imageId: string) => {
  const response = await fetch(`http://localhost:3000/collections/${collectionId}/images/${imageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Xóa ảnh khỏi bộ sưu tập thất bại!");
  }

  return response.json();
};



