"use client";

import { useState } from "react";
import Link from "next/link";
import { User, FileText, Flag, Menu } from "lucide-react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white p-4 min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mb-4 p-2 bg-gray-800 hover:bg-gray-700 rounded"
        >
          <Menu className="w-6 h-6" />
        </button>

        {isSidebarOpen && <h2 className="text-xl font-bold mb-6">Admin Panel</h2>}

        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/admin/users" className="flex items-center p-2 rounded hover:bg-gray-700">
                <User className="w-5 h-5 mr-2" /> {isSidebarOpen && "Users"}
              </Link>
            </li>
            <li>
              <Link href="/admin/posts" className="flex items-center p-2 rounded hover:bg-gray-700">
                <FileText className="w-5 h-5 mr-2" /> {isSidebarOpen && "Posts"}
              </Link>
            </li>
            <li>
              <Link href="/admin/reports" className="flex items-center p-2 rounded hover:bg-gray-700">
                <Flag className="w-5 h-5 mr-2" /> {isSidebarOpen && "Reports"}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default AdminLayout;
