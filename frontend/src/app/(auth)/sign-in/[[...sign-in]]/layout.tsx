// app/(auth)/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="flex items-center justify-center min-h-screen">
        {children}
      </div>
    </ClerkProvider>
  );
}
