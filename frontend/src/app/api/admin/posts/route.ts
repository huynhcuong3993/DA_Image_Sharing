import axios from "axios";

const API_URL = "http://localhost:3000/admin/posts";

export const getPosts = async (token: string) => {
    if (!token) return null;

    try {
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy dữ liệu admin:", error);
        return null;
    }
};

// API xóa post
export const deletePost = async (id: string, token: string) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Lỗi xóa post:", error);
        throw error;
    }
};

// API cập nhật post
export const updatePost = async (id: string, updateData: any, token: string) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}`, updateData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật post:", error);
        throw error;
    }
};
