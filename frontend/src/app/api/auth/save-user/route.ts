import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

  const backendResponse = await fetch("http://localhost:3000/auth/jwt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  const data = await backendResponse.json();
  return NextResponse.json(data);
}
