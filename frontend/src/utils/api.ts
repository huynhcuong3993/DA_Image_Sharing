// /frontend/utils/api.ts
import axios from 'axios';

export async function getJwtFromBackend(clerkToken: string) {
  try {
    console.log("vcl");
    const response = await axios.post('/api/auth/clerk-login', {}, {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching JWT:', error);
    throw error;
  }
}
