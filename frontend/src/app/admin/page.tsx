"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs"; 
import { getStats } from "../api/admin/stats/route"; 
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { User, FileText, Flag, Menu, X } from "lucide-react";

const AdminDashboard = () => {
  const { getToken, isSignedIn } = useAuth(); 
  const [stats, setStats] = useState({ users: 0, posts: 0, reports: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true); 

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSignedIn) return; 

      try {
        const token = await getToken();
        if (!token) throw new Error("Không có token hợp lệ!");

        const data = await getStats(token); 
        if (data) setStats(data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      }
    };

    fetchStats();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return <p className="text-center text-red-500">Vui lòng đăng nhập để truy cập Admin Panel.</p>;
  }

  return (
    <div>
      {/* Sidebar */}

      {/* Nội dung chính */}
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center">
              <User className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-lg font-semibold">Users</p>
                <p className="text-xl font-bold">{stats.users}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <FileText className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-lg font-semibold">Posts</p>
                <p className="text-xl font-bold">{stats.posts}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <Flag className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-lg font-semibold">Reports</p>
                <p className="text-xl font-bold">{stats.reports}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
