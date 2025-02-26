"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { getPosts, deletePost, updatePost } from "../../api/admin/posts/route";
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

interface Post {
  _id: string;
  title: string;
  description: string;
  url: string;
}

export default function PostsPage() {
  const { getToken, isSignedIn } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState<{ id: string; title: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(5);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!isSignedIn) return;

      setLoading(true);
      setError("");

      try {
        const token = await getToken();
        if (!token) throw new Error("Không có token hợp lệ!");

        const data = await getPosts(token);
        if (data) {
          setPosts(data);
        } else {
          throw new Error("Không có dữ liệu bài viết!");
        }
      } catch (err) {
        setError("Lỗi tải dữ liệu bài viết! Hãy thử lại.");
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isSignedIn]);

  const handleDelete = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await deletePost(id, token);
      setPosts(posts.filter((post) => post._id !== id));
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err);
      alert("Xóa bài viết thất bại!");
    }
  };

  const handleUpdate = async () => {
    if (!editingPost) return;
    const token = await getToken();
    if (!token) return;

    try {
      const updatedPost = await updatePost(editingPost.id, { title: editingPost.title }, token);
      setPosts(posts.map((post) => (post._id === editingPost.id ? updatedPost : post)));
      setEditingPost(null);
    } catch (err) {
      console.error("Lỗi cập nhật bài viết:", err);
      alert("Cập nhật bài viết thất bại!");
    }
  };

  const filteredPosts = posts.filter(post =>
    (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const valueA = a[sortField as keyof Post]?.toString().toLowerCase() || "";
    const valueB = b[sortField as keyof Post]?.toString().toLowerCase() || "";
    return sortOrder === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });

  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const paginatedPosts = sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
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
      <h1 className="text-2xl font-bold mb-4">Post Management</h1>

      <Input
        placeholder="Tìm kiếm bài viết..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      <div className="mb-4 flex gap-4">
        <Select value={sortField} onValueChange={setSortField}>
          <SelectTrigger>
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Sắp xếp theo Tiêu đề</SelectItem>
            <SelectItem value="description">Sắp xếp theo Mô tả</SelectItem>
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
        <Select value={postsPerPage.toString()} onValueChange={(value) => setPostsPerPage(Number(value))}>
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

      {!loading && !error && paginatedPosts.length > 0 ? (
        <>
            <Table>
            <TableHead>
                <TableRow className="bg-gray-200">
                <TableCell className="font-bold">ID</TableCell>
                <TableCell className="font-bold">Image</TableCell>
                <TableCell className="font-bold">Title</TableCell>
                <TableCell className="font-bold">Description</TableCell>
                <TableCell className="font-bold">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {paginatedPosts.map((post, index) => (
                <TableRow key={post._id} className="hover:bg-gray-100">
                    <TableCell>{(currentPage - 1) * postsPerPage + index + 1}</TableCell>
                    <TableCell>
                         <img src={post.url} alt="Hình ảnh" className="w-24 h-24 object-cover rounded" />
                    </TableCell>

                    <TableCell>
                    {editingPost?.id === post._id ? (
                        <Input
                        value={editingPost.title}
                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                        />
                    ) : (
                        post.title
                    )}
                    </TableCell>
                    <TableCell>{post.description}</TableCell>
                    <TableCell>
                    {editingPost?.id === post._id ? (
                        <Button onClick={handleUpdate} className="mr-2">Lưu</Button>
                    ) : (
                        <Button onClick={() => setEditingPost({ id: post._id, title: post.title })} className="mr-2">Sửa</Button>
                    )}
                    <Button variant="destructive" onClick={() => handleDelete(post._id)}>Xóa</Button>
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
        !loading && <p>Không có bài viết nào.</p>
      )}
    </div>
  );
}
