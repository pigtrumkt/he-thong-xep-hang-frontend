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

  // danh sách đã lọc theo username tại FE
  const filtered = data.filter((emp) =>
    emp.full_name?.toLowerCase().includes(username.toLowerCase())
  );

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
              <td colSpan={6} className="py-6 text-center text-gray-400">
                Đang tải...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-400">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            filtered.map((emp, idx) => (
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
                  {emp.avgRating ?? "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  {emp.commentCount ?? 0}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
