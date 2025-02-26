
import { SignUp, useAuth, useUser } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";

export default  async function SignUpPage() {
  const { userId, getToken } = await auth(); // Lấy userId từ Clerk
  const user = await currentUser(); // Lấy thông tin user đầy đủ
  // const { userId, getToken } = await auth();
  if (user) {
    const token = await getToken();
    console.log("Token:", user);
    const userData = {
      clerkId: user.id, // Trùng với trường clerkId trong UserSchema
      email: user.emailAddresses[0]?.emailAddress || '',
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.imageUrl || '',
    };

    console.log("Gửi thông tin user xuống backend:", userData);

    // Gửi dữ liệu user xuống backend (NestJS API)
    try {
      const response = await fetch('http://localhost:3000/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Thêm token vào headers

        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi gửi user: ${response.statusText}`);
      }

      console.log("User đã được lưu thành công!");
    } catch (error) {
      console.error('Lỗi khi gửi user:', error);
    }
  }



  return <SignUp />;
}

// "use client";

// import { SignUp } from "@clerk/nextjs";
// import { useEffect } from "react";
// import { useAuth, useUser } from "@clerk/nextjs";
// import { sendUserDataToBackend } from "@/utils/sendUserDataToBackend";

// export default function SignUpPage() {
//   const { isSignedIn } = useAuth();
//   const { user } = useUser();

//   useEffect(() => {
//     if (isSignedIn && user) {
//       const userData = {
//         clerkId: user.id,
//         email: user.primaryEmailAddress?.emailAddress || "",
//         firstName: user.firstName || "",
//         lastName: user.lastName || "",
//         avatar: user.imageUrl || "",
//       };

//       sendUserDataToBackend("aaaaa",userData).then(() => {
//         window.location.href = "/";
//       });
//     }
//   }, [isSignedIn, user]);

//   return <SignUp />;
// }
