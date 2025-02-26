import axios from "axios";

const API_URL = "http://localhost:3000/admin/reports";

export const getReports = async (token: string) => {
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

// API tạo report mới
export const reportImage = async (imageTitle: string, imageUrl: string, reportedUserId: string, reporterUserId: string, reason: string, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}`,
            { imageTitle, imageUrl, reportedUserId, reporterUserId, reason }, // Truyền reason từ UI
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gửi báo cáo:", error);
        throw error;
    }
};

// API xóa report
export const deleteReport = async (id: string, token: string) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Lỗi xóa report:", error);
        throw error;
    }
};

// API cập nhật report
export const updateReport = async (id: string, updateData: any, token: string) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}`, updateData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật report:", error);
        throw error;
    }
};
