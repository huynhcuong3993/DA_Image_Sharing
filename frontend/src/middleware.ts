import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Kiểm tra nếu đang vào trang /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const { userId } = await auth(); // Thêm await ở đây

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url)); // Chưa đăng nhập thì chuyển hướng
    }

    // Fetch user metadata từ Clerk API
    const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/", request.url)); // Nếu lỗi, đưa về trang chủ
    }

    const user = await userResponse.json();
    const userRole = user.public_metadata?.role; // Lấy role từ metadata

    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url)); // Không phải admin thì về trang chủ
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
