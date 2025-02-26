import axios from "axios";

const API_URL = "http://localhost:3000/admin/users";

export const getUsers = async (token: string) => {
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

// API xóa user
export const deleteUser = async (id: string, token: string) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Lỗi xóa user:", error);
        throw error;
    }
};

// API cập nhật user
export const updateUser = async (id: string, updateData: any, token: string) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}`, updateData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật user:", error);
        throw error;
    }
};
