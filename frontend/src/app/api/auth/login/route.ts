import { cookies } from "next/headers";
import { currentUser, auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const user = await currentUser();
    console.log("aaaaa")
    if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 });

    // Gửi user info đến backend
    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/jwt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: (await auth()).sessionClaims?.jwt }),
    });

    if (!backendRes.ok) {
      throw new Error("Lỗi xác thực Backend");
    }

    const data = await backendRes.json();

    // Set JWT app vào cookie (bảo mật HttpOnly)
    (await
          // Set JWT app vào cookie (bảo mật HttpOnly)
          cookies()).set("app_jwt", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return Response.json({ message: "Login success" });
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 500 });
  }
}
