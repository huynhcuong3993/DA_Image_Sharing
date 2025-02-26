
import { loginWithToken, sendUserDataToBackend } from "@/utils/sendUserDataToBackend";
import { SignIn, useAuth } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function SignInPage() {
  const { userId, getToken } = await auth();
  const token = await getToken();
  const user = await currentUser();
  if(user){
    if (token) {
      try {
        await loginWithToken(token);
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
      catch (err) {
        console.error("Send Token fail: " ,err);
      }
    }
    else {
      console.error("Send Token fail: ");
    }
  }
  

  // console.log(token);



  return <SignIn />;
}
