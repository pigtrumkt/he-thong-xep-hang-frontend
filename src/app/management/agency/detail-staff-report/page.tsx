"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePopup } from "@/components/popup/PopupContext";
import { apiGet } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export default function EmployeeReportPage() {
  const router = useRouter();
  const { popupMessage } = usePopup();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState(formatDateLocal(firstDayOfMonth));
  const [toDate, setToDate] = useState(formatDateLocal(today));
  const [username, setUsername] = useState("");

  // popup state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);

    let url = `/tickets/employeesReport?from=${fromDate}&to=${toDate}`;
    if (username.trim()) {
      url += `&username=${encodeURIComponent(username.trim())}`;
    }

    const res = await apiGet(url);

    setLoading(false);

    if (res.status !== 200) {
      handleApiError(res, popupMessage, router);
      return;
    }
    setData(res.data || []);
  }

  async function openComments(emp: any) {
    setSelectedEmp(emp);
    setComments([]);
    setShowComments(true);

    const res = await apiGet(
      `/tickets/employeeComments?accountId=${emp.id}&from=${fromDate}&to=${toDate}`
    );

    if (res.status === 200) {
      setComments(res.data || []);
    } else if (res.status === 400 && typeof res.data === "object") {
      popupMessage({
        description: res.data.message,
      });
    } else {
      handleApiError(res, popupMessage, router);
    }
  }

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      {/* Header + Filter */}
      <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
        <div className="flex items-center gap-3">
          {/* Search username */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tìm kiếm..."
            className="px-3 py-2 mr-4 text-sm border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-gray-500">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={fetchReport}
            className="px-5 py-2 font-semibold text-white transition bg-blue-700 shadow rounded-xl hover:bg-blue-900"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full overflow-hidden rounded-xl">
        <thead>
          <tr className="text-left text-blue-900 bg-blue-100">
            <th className="px-4 py-3 font-semibold rounded-tl-xl">#</th>
            <th className="px-4 py-3 font-semibold">Tài khoản</th>
            <th className="px-4 py-3 font-semibold">Tên nhân viên</th>
            <th className="px-4 py-3 font-semibold text-center">Đã phục vụ</th>
            <th className="px-4 py-3 font-semibold text-center">Đánh giá</th>
            <th className="px-4 py-3 font-semibold text-center rounded-tr-xl">
              Số lần góp ý
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-500">
                Đang tải...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((emp, idx) => (
              <tr
                key={idx}
                className="transition border-b border-slate-300 last:border-none hover:bg-blue-50 group"
              >
                <td className="px-4 py-3 font-semibold text-blue-800">
                  {idx + 1}
                </td>
                <td className="px-4 py-3">{emp.username}</td>
                <td className="px-4 py-3">{emp.full_name}</td>
                <td className="px-4 py-3 text-center text-green-600">
                  {emp.doneTickets}
                </td>
                <td className="flex items-center justify-center gap-1 px-4 py-3 text-center">
                  {emp.avgRating ?? "-"}
                  {emp.avgRating && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-yellow-400"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {emp.commentCount ?? 0}
                    <button
                      onClick={() => openComments(emp)}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:hover:text-blue-600"
                      title="Xem góp ý"
                      disabled={
                        !emp.commentCount || emp.commentCount.length === 0
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Popup hiển thị góp ý */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-[650px] max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-3xl">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                📝 Góp ý
                <span className="font-medium text-blue-100">
                  ({selectedEmp?.full_name})
                </span>
              </h2>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="p-5 border border-blue-100 shadow-sm rounded-2xl bg-gradient-to-br from-blue-50 to-white"
                >
                  {/* Service + Stars */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-blue-800">
                      {c.service}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {Array.from({ length: c.stars }).map((_, j) => (
                        <svg
                          key={j}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {/* Comment */}
                  <p className="leading-relaxed text-gray-700">{c.comment}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-blue-100 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => setShowComments(false)}
                className="px-5 py-2 font-semibold text-white transition bg-blue-600 shadow rounded-xl hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
