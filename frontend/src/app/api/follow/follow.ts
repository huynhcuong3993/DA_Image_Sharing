import axios from "axios";

const API_URL = "http://localhost:3000/users"; // API endpoint từ NestJS

export const getUserByUsername = async (username: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/${username}`, {
            headers: { Authorization: `Bearer ${token}` }, // Gửi token lên server
        });
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error("Lỗi lấy user:", error);
        throw error;
    }
};

// API Theo dõi User
export const followUser = async (userId: string, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/${userId}/follow`, 
            {}, 
            {
                headers: { Authorization: `Bearer ${token}` }, // Gửi token lên server
            }
        );
        return response.data;
    } catch (error) {
        console.error("Lỗi theo dõi user:", error);
        throw error;
    }
};

// API Bỏ theo dõi User
export const unfollowUser = async (userId: string, token: string) => {
    try {
        const response = await axios.delete(
            `${API_URL}/${userId}/unfollow`, 
            {
                headers: { Authorization: `Bearer ${token}` }, 
            }
        );
        return response.data;
    } catch (error) {
        console.error("Lỗi bỏ theo dõi user:", error);
        throw error;
    }
};

// API Kiểm tra trạng thái Follow
export const checkFollowStatus = async (userId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/following-status/${userId}`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        return response.data; // { isFollowing: true/false }
    } catch (error) {
        console.error("Lỗi kiểm tra trạng thái follow:", error);
        return { isFollowing: false }; // Mặc định chưa follow nếu lỗi
    }
};
