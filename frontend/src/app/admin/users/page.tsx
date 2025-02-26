"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { getUsers, deleteUser, updateUser } from "../../api/admin/users/route";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface User {
  _id: string;
  username: string;
  email: string;
}

export default function UsersPage() {
  const { getToken, isSignedIn } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<{ id: string; username: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isSignedIn) return;

      setLoading(true);
      setError("");

      try {
        const token = await getToken();
        if (!token) throw new Error("Không có token hợp lệ!");

        const data = await getUsers(token);
        if (data) {
          setUsers(data);
        } else {
          throw new Error("Không có dữ liệu người dùng!");
        }
      } catch (err) {
        setError("Lỗi tải dữ liệu người dùng! Hãy thử lại.");
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isSignedIn]);

  // Xóa user
  const handleDelete = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    if (!confirm("Bạn có chắc muốn xóa user này?")) return;

    try {
      await deleteUser(id, token);
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      alert("Xóa user thất bại!");
    }
  };

  // Cập nhật user
  const handleUpdate = async () => {
    if (!editingUser) return;
    const token = await getToken();
    if (!token) return;

    try {
      const updatedUser = await updateUser(editingUser.id, { username: editingUser.username }, token);
      setUsers(users.map((user) => (user._id === editingUser.id ? updatedUser : user)));
      setEditingUser(null);
    } catch (err) {
      console.error("Lỗi cập nhật user:", err);
      alert("Cập nhật user thất bại!");
    }
  };

  // Lọc user theo từ khóa tìm kiếm
  const filteredUsers = users.filter(user =>
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user._id && user._id.toLowerCase().includes(searchQuery.toLowerCase()))
);

  // Sắp xếp user
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valueA = a[sortField as keyof User] ? a[sortField as keyof User]!.toString().toLowerCase() : "";
    const valueB = b[sortField as keyof User] ? b[sortField as keyof User]!.toString().toLowerCase() : "";
    return sortOrder === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
});

  // Phân trang
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const getPaginationNumbers = () => {
    const pages = [];
    const range = 2;
    for (let i = Math.max(2, currentPage - range); i <= Math.min(totalPages - 1, currentPage + range); i++) {
      pages.push(i);
    }
    return pages;
  };


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Thanh tìm kiếm */}
      <Input
        placeholder="Tìm kiếm theo username hoặc email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {/* Sắp xếp */}
      <div className="mb-4 flex gap-4">
        <Select value={sortField} onValueChange={setSortField}>
          <SelectTrigger>
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="username">Sắp xếp theo Username</SelectItem>
            <SelectItem value="email">Sắp xếp theo Email</SelectItem>
            <SelectItem value="_id">Sắp xếp theo ID</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn thứ tự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Tăng dần</SelectItem>
            <SelectItem value="desc">Giảm dần</SelectItem>
          </SelectContent>
        </Select>
      </div>

            {/* Chọn số dòng hiển thị mỗi trang */}
            <div className="mb-4">
        <label className="mr-2">Hiển thị:</label>
        <Select value={usersPerPage.toString()} onValueChange={(value) => setUsersPerPage(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Số dòng hiển thị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 dòng</SelectItem>
            <SelectItem value="10">10 dòng</SelectItem>
            <SelectItem value="25">25 dòng</SelectItem>
            <SelectItem value="50">50 dòng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && paginatedUsers.length > 0 ? (
        <>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-200">
                <TableCell className="font-bold">ID</TableCell>
                <TableCell className="font-bold">ID User</TableCell>
                <TableCell className="font-bold">Username</TableCell>
                <TableCell className="font-bold">Email</TableCell>
                <TableCell className="font-bold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {paginatedUsers.map((user, index) => (
                <TableRow key={user._id} className="hover:bg-gray-100">
                  <TableCell>{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>
                    {editingUser?.id === user._id ? (
                      <Input
                        value={editingUser.username}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                      />
                    ) : (
                      user.username
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {editingUser?.id === user._id ? (
                      <Button onClick={handleUpdate} className="mr-2">
                        Lưu
                      </Button>
                    ) : (
                      <Button onClick={() => setEditingUser({ id: user._id, username: user.username })} className="mr-2">
                        Sửa
                      </Button>
                    )}
                    <Button variant="destructive" onClick={() => handleDelete(user._id)}>
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center mt-4 gap-2">
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>Trang đầu</Button>
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Trước</Button>
            {currentPage > 3 && <span>...</span>}

            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Sau</Button>
            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>Trang cuối</Button>
          </div>
        </>
      ) : (
        !loading && <p>Không có dữ liệu.</p>
      )}
    </div>
  );
}
