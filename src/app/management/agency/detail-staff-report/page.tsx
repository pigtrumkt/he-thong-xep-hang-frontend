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
  const [allServices, setAllServices] = useState<
    { service_id: number; service_name: string }[]
  >([]);

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    const allServicesTemp: { service_id: number; service_name: string }[] = [];
    data.forEach((emp) => {
      emp.services_report?.forEach((srv: any) => {
        if (!allServicesTemp.find((s) => s.service_id === srv.service_id)) {
          allServicesTemp.push({
            service_id: srv.service_id,
            service_name: srv.service_name,
          });
        }
      });
    });

    setAllServices(allServicesTemp);
  }, [data]);

  async function fetchReport() {
    setLoading(true);

    let url = `/tickets/detailEmployeesReport?from=${fromDate}&to=${toDate}`;
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
      <div className="max-w-full overflow-auto employee-report-scroll max-h-[calc(100vh-15rem)]">
        <table className="min-w-full rounded-xl">
          <thead>
            <tr className="text-left text-blue-900 bg-blue-100">
              <th className="px-4 py-3 font-semibold rounded-tl-xl">#</th>
              <th className="px-4 py-3 font-semibold">Tài khoản</th>
              <th className="px-4 py-3 font-semibold">Tên nhân viên</th>
              {allServices.map((srv) => (
                <th
                  key={srv.service_id}
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                >
                  {srv.service_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={3 + allServices.length}
                  className="py-6 text-center text-gray-500"
                >
                  Đang tải...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + allServices.length}
                  className="py-6 text-center text-gray-500"
                >
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    {emp.username}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {emp.full_name}
                  </td>

                  {/* ✅ render số vé theo từng dịch vụ */}
                  {allServices.map((srv) => {
                    const found = emp.services_report?.find(
                      (s: any) => s.service_id === srv.service_id
                    );
                    return (
                      <td
                        key={srv.service_id}
                        className="px-4 py-3 text-center"
                      >
                        {found ? found.total_tickets : 0}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* STYLES */}
      <style jsx global>{`
        .employee-report-scroll::-webkit-scrollbar {
          height: 0.6rem; /* thanh ngang */
          width: 0.5rem; /* thanh ngang */
          background: #7c7c7c22;
        }

        .employee-report-scroll::-webkit-scrollbar-thumb {
          background: #7c7c7c44;
          border-radius: 1rem;
        }
      `}</style>
    </section>
  );
}
