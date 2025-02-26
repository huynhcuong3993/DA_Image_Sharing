// app/Navbar.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const { userId } = await auth();
  const user = await currentUser();

  // Chỉ lấy những thuộc tính cần thiết từ user
  const userProps = user ? { username: user.username } : null;

  return <NavbarClient userId={userId} user={userProps} />;
}