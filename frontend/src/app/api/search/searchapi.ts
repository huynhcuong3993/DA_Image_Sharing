import axios from 'axios';

const API_URL = 'http://localhost:3000/images';

export const searchImages = async (query: string, token: string) => {
  if (!query || !token) return [];

  try {
    const response = await axios.get(`${API_URL}/search?q=${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi tìm kiếm ảnh:", error);
    return [];
  }
};
