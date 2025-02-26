export const sendUserDataToBackend = async (token: string, user: any) => {
  try {
    console.log(user)
    const response = await fetch("http://localhost:3000/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi gửi user: ${response.statusText}`);
    }

    console.log("User đã được lưu vào DB thành công!");
  } catch (error) {
    console.error("Lỗi khi gửi user:", error);
  }
};


export async function loginWithToken(token: string) {
  console.log('Sending token to backend:', token);
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) throw new Error('Login failed');

  return await res.json();
}
