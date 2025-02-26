"use client";

import { useState } from "react";
import { reportImage } from "../app/api/admin/reports/route";
import { useAuth } from "@clerk/nextjs";

interface ReportButtonProps {
  imageId: string;
  reportedUserId: string;
  reporterUserId: string;
  imageTitle: string;
}

export default function ReportButton({imageTitle, imageId, reportedUserId, reporterUserId }: ReportButtonProps) {
  const { getToken } = useAuth();
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const reportReasons = [
    "Nội dung không phù hợp",
    "Spam hoặc lừa đảo",
    "Ảnh có nội dung khiêu dâm",
    "Vi phạm bản quyền",
    "Hình ảnh sai sự thật",
  ];

  const handleReport = async () => {
    if (!reason) {
      alert("Vui lòng chọn lý do báo cáo.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        alert("Bạn cần đăng nhập để báo cáo.");
        return;
      }

      await reportImage(imageTitle, imageId, reportedUserId, reporterUserId, reason, token);

      setReported(true);
      alert("Báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
      alert("Có lỗi xảy ra khi gửi báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <select
        className="px-3 py-1 text-sm border rounded-md"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={reported}
      >
        <option value="">Chọn lý do báo cáo</option>
        {reportReasons.map((r, index) => (
          <option key={index} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        className={`ml-2 px-3 py-1 text-sm font-medium border rounded-md ${
          reported ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"
        }`}
        onClick={handleReport}
        disabled={reported || loading}
      >
        {loading ? "Đang gửi..." : reported ? "Đã báo cáo" : "Báo cáo"}
      </button>
    </div>
  );
}
