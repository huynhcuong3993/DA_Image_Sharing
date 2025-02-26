import axios from 'axios';

const API_URL = 'http://localhost:3000/admin';

export const getStats = async (token: string) => {
  if (!token) return null;

  try {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu admin:", error);
    return null;
  }
};
