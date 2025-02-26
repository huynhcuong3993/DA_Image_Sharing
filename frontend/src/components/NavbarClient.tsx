"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import NotificationBell from "@/components/NotificationBell";
import io from "socket.io-client";
import { useAuth, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react"; 

interface NavbarClientProps {
  userId: string | null;
  user: {
    username?: string | null;
  } | null;
}

const suggestions = [
  "Hello kitty backgrounds",
  "Very funny pictures",
  "Barber shop",
  "Graphic design flyer",
  "Kawaii wallpaper",
  "Romantic manga",
  "Cartoon profile pics",
  "Anime drawing",
];

const updateUserInDB = async (userId: string, updateData: any, token: string) => {
  const { email, ...filteredData } = updateData;
  
  try {
    await fetch(`http://localhost:3000/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(filteredData),
    });
  } catch (error) {
    console.error("Lỗi cập nhật user:", error);
  }
};

export default function NavbarClient({ userId, user }: NavbarClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const prevUserRef = useRef<any>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const syncUserWithDB = useCallback(async () => {
    if (!clerkUser || !userId) return;

    const token = await getToken();
    if (!token) return;

    const newUserData = {
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      username: clerkUser.username || "",
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      avatar: clerkUser.imageUrl || "",
    };

    if (JSON.stringify(newUserData) !== JSON.stringify(prevUserRef.current)) {
      await updateUserInDB(userId, newUserData, token);
      prevUserRef.current = newUserData;
    }
  }, [clerkUser, userId, getToken]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(savedHistory);
  }, []);
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSuggestions([]);
      return;
    }
    setFilteredSuggestions(
      suggestions.filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);
  useEffect(() => {
    syncUserWithDB();
  }, [syncUserWithDB]);

  // Xử lý khi nhấn nút tìm kiếm
  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    setSearchTerm(term);
    const updatedHistory = [term, ...searchHistory.filter((h) => h !== term)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    router.push(`/search?q=${term}`);
  };

  const handleClearHistory = (term: string) => {
    const updatedHistory = searchHistory.filter((h) => h !== term);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  return (
    <nav className="bg-blue-700 p-4 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          My Image App
        </Link>
        <div className="flex items-center relative">
          <div className="flex items-center bg-white text-black px-4 py-2 rounded-full w-[700px] shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <Input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent border-none focus:ring-0 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(searchTerm);
                setIsFocused(false); // Ẩn dropdown sau khi tìm kiếm
              }
            }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Ẩn sau 200ms
            />
            {searchTerm && (
              <X className="text-gray-500 w-5 h-5 cursor-pointer" onClick={() => setSearchTerm("")} />
            )}
          </div>
          <Button 
            onClick={() => {
              handleSearch(searchTerm);
              setIsFocused(false); // Ẩn dropdown sau khi nhấn nút Search
            }} 
            className="ml-2 bg-white text-blue-600 px-4 py-2 rounded-md"
          >
            Search
          </Button>
  
          {(isFocused || searchTerm) && (
            <div
              className="absolute top-12 left-0 w-[700px] bg-white text-black shadow-md rounded-md p-4 z-50"
              ref={searchRef}
              onMouseDown={(e) => e.preventDefault()} // Ngăn onBlur khi click vào dropdown
            >
              {searchHistory.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Recent searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-300"
                      >
                        <span onClick={() => handleSearch(term)}>{term}</span>
                        <X
                          className="ml-2 w-4 h-4 cursor-pointer"
                          onClick={() => handleClearHistory(term)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {filteredSuggestions.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Ideas for you</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer rounded-md"
                        onClick={() => handleSearch(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {userId ? (
            <>
              <Button asChild>
                <Link href="/upload">Upload</Link>
              </Button>
              <Button asChild>
                <Link href="/Collections">Gallery</Link>
              </Button>

              {/* 🛎 Nút chuông thông báo */}
              <NotificationBell userId={userId} />

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{user?.username || "Anonymous"}</span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
      </div>
      </div>
    </nav>
  );
}
