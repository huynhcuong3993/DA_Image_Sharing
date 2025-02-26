"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const sendUserToBackend = async () => {
      if (!isSignedIn) return;
      
      const token = await getToken();
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("User authenticated successfully!");
        router.push("/"); // Điều hướng về trang chính
      } else {
        console.error("Authentication failed!");
      }
    };

    sendUserToBackend();
  }, [isSignedIn, getToken, router]);

  return <p>Processing authentication...</p>;
}
