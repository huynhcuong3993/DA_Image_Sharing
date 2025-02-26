"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports, deleteReport, updateReport } from "../../api/admin/reports/route";
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

interface Report {
  _id: string;
  reportedUserId: string;
  imageTitle: string
  reason: string;
  imageUrl: string;
}

export default function ReportsPage() {
  const { getToken, isSignedIn } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReport, setEditingReport] = useState<{ id: string; reason: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("reportedUserId");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage, setReportsPerPage] = useState(5);

  useEffect(() => {
    const fetchReports = async () => {
      if (!isSignedIn) return;

      setLoading(true);
      setError("");

      try {
        const token = await getToken();
        if (!token) throw new Error("Không có token hợp lệ!");

        const data = await getReports(token);
        if (data) {
          setReports(data);
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

    fetchReports();
  }, [isSignedIn]);

  const handleDelete = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await deleteReport(id, token);
      setReports(reports.filter((report) => report._id !== id));
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err);
      alert("Xóa bài viết thất bại!");
    }
  };

  const handleUpdate = async () => {
    if (!editingReport) return;
    const token = await getToken();
    if (!token) return;

    try {
      const updatedReport = await updateReport(editingReport.id, { reason: editingReport.reason }, token);
      setReports(reports.map((report) => (report._id === editingReport.id ? updatedReport : report)));
      setEditingReport(null);
    } catch (err) {
      console.error("Lỗi cập nhật bài viết:", err);
      alert("Cập nhật bài viết thất bại!");
    }
  };

  const filteredReports = reports.filter(report =>
    (report.reportedUserId && report.reportedUserId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (report.reason && report.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedReports = [...filteredReports].sort((a, b) => {
    const valueA = a[sortField as keyof Report]?.toString().toLowerCase() || "";
    const valueB = b[sortField as keyof Report]?.toString().toLowerCase() || "";
    return sortOrder === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });

  const totalPages = Math.ceil(sortedReports.length / reportsPerPage);
  const paginatedReports = sortedReports.slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage);
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
      <h1 className="text-2xl font-bold mb-4">Report Management</h1>

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
            <SelectItem value="reportedUserId">Sắp xếp theo User</SelectItem>
            <SelectItem value="reason">Sắp xếp theo nguyên nhân</SelectItem>
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
        <Select value={reportsPerPage.toString()} onValueChange={(value) => setReportsPerPage(Number(value))}>
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

      {!loading && !error && paginatedReports.length > 0 ? (
        <>
            <Table>
            <TableHead>
                <TableRow className="bg-gray-200">
                <TableCell className="font-bold">ID</TableCell>
                <TableCell className="font-bold">Image</TableCell>
                <TableCell className="font-bold">Reported User</TableCell>
                <TableCell className="font-bold">Title image</TableCell>
                <TableCell className="font-bold">Reason</TableCell>
                <TableCell className="font-bold">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {paginatedReports.map((report, index) => (
                <TableRow key={report._id} className="hover:bg-gray-100">
                    <TableCell>{(currentPage - 1) * reportsPerPage + index + 1}</TableCell>
                    <TableCell>
                         <img src={report.imageUrl} alt="Hình ảnh" className="w-24 h-24 object-cover rounded" />
                    </TableCell>
                    <TableCell>{report.reportedUserId}</TableCell>
                    <TableCell>{report.imageTitle}</TableCell>
                    <TableCell>
                    {editingReport?.id === report._id ? (
                        <Input
                        value={editingReport.reason}
                        onChange={(e) => setEditingReport({ ...editingReport, reason: e.target.value })}
                        />
                    ) : (
                        report.reason
                    )}
                    </TableCell>
                    <TableCell>
                    {editingReport?.id === report._id ? (
                        <Button onClick={handleUpdate} className="mr-2">Lưu</Button>
                    ) : (
                        <Button onClick={() => setEditingReport({ id: report._id, reason: report.reason })} className="mr-2">Sửa</Button>
                    )}
                    <Button variant="destructive" onClick={() => handleDelete(report._id)}>Xóa</Button>
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
