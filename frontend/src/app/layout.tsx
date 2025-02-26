// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>Main Application</title>
        </head>
        <body className="bg-gray-50 text-gray-900">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
      {/* <ToastContainer /> */}
    </ClerkProvider>
  );
}
