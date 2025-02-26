const API_URL = "http://localhost:3000";

export async function fetchUserImages(token: string, search?: string) {
    const res = await fetch(`${API_URL}/user/images?search=${search || ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok ? res.json() : [];
  }
  
  export async function updateImage(token: string, id: string, data: any) {
    const res = await fetch(`${API_URL}/user/images/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.ok ? res.json() : null;
  }
  
  export async function deleteImage(token: string, id: string) {
    await fetch(`${API_URL}/user/images/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  