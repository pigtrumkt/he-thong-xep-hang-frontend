"use client";

import { usePopup } from "@/components/popup/PopupContext";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useEffect, useState } from "react";

export default function AgenciesManagementPage() {
  const router = useRouter();
  const { popupMessage, popupConfirmRed } = usePopup();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState(""); // "", "1", "0"
  const [search, setSearch] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiGet("/agencies/findAllActive");

      if (![200, 400].includes(res.status)) {
        handleApiError(res, popupMessage, router);
        return;
      }

      const data = res.data;
      setAgencies(data);
    };

    fetchData();
  }, [popupMessage, router]);

  const filtered = agencies.filter((a) => {
    const matchName = a.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "" || String(a.status) === statusFilter;
    return matchName && matchStatus;
  });

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      <div className="flex items-center justify-between mb-6">
        <button className="bg-blue-700 hover:bg-blue-900 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2 shadow transition">
          <span className="font-bold">+</span>
          Thêm
        </button>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors outline-none"
            placeholder="Tìm tên cơ quan..."
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Tắt</option>
          </select>
        </div>
      </div>

      <table className="min-w-full rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-blue-100 text-blue-900 text-left">
            <th className="py-3 px-4 rounded-tl-xl font-semibold">#</th>
            <th className="py-3 px-4 font-semibold">Tên cơ quan</th>
            <th className="py-3 px-4 font-semibold">Địa chỉ</th>
            <th className="py-3 px-4 font-semibold">SĐT</th>
            <th className="py-3 px-4 font-semibold">Email</th>
            <th className="py-3 px-4 rounded-tr-xl font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a, idx) => (
            <tr
              key={a.id}
              className="border-b border-slate-300 last:border-none hover:bg-blue-50 transition group"
            >
              <td className="py-3 px-4 text-blue-800 font-semibold">
                {idx + 1}
              </td>
              <td className="py-3 px-4">{a.name}</td>
              <td className="py-3 px-4">{a.address}</td>
              <td className="py-3 px-4">{a.phone}</td>
              <td className="py-3 px-4">{a.email}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {/* Xem chi tiết */}
                  <button
                    title="Xem chi tiết"
                    className="p-2 rounded-lg hover:bg-blue-100"
                    onClick={() => {
                      setSelectedAgency(a);
                      setShowDetail(true);
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  {/* Toggle trạng thái */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer disabled:opacity-50"
                      checked={a.status === 1}
                      onChange={async (e) => {
                        e.target.disabled = true;
                        const newStatus = e.target.checked ? 1 : 0;
                        const res = await apiPost(`/agencies/${a.id}/status`, {
                          status: newStatus,
                        });

                        e.target.disabled = false;
                        if (res.status === 201) {
                          setAgencies((prev) =>
                            prev.map((item) =>
                              item.id === a.id
                                ? { ...item, status: newStatus }
                                : item
                            )
                          );
                        } else {
                          popupMessage({
                            title: "Cập nhật trạng thái thất bại",
                            description:
                              "Mạng không ổn định hoặc máy chủ không phản hồi.",
                          });
                        }
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full transition duration-300 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-5"></div>
                  </label>

                  {/* Sửa */}
                  <button
                    className="p-2 rounded-lg hover:bg-blue-100"
                    title="Chỉnh sửa"
                  >
                    <svg
                      className="w-6 h-6 text-blue-700"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16.862 4.487l2.65 2.65a2 2 0 010 2.828l-9.393 9.393a2 2 0 01-.708.464l-4 1.333a1 1 0 01-1.262-1.262l1.333-4a2 2 0 01.464-.708l9.393-9.393a2 2 0 012.828 0z" />
                    </svg>
                  </button>

                  {/* Xóa */}
                  <button
                    className="p-2 rounded-lg hover:bg-red-100"
                    title="Xóa"
                    onClick={() => {
                      popupConfirmRed({
                        title: "Xác nhận xoá cơ quan?",
                        description: `${a.name}`,
                      }).then(async (confirmed) => {
                        if (!confirmed) return;

                        const res = await apiPost(
                          `/agencies/${a.id}/delete`,
                          {}
                        );
                        if (res.status === 201) {
                          setAgencies((prev) =>
                            prev.filter((item) => item.id !== a.id)
                          );
                        } else {
                          popupMessage({
                            title: `Xoá thất bại`,
                            description: `${a.name}`,
                          });
                        }
                      });
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm7 4H4" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* detail */}
      {showDetail && selectedAgency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xl w-full relative border border-blue-300">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-blue-700 mb-4">
              Thông tin chi tiết cơ quan
            </h2>

            <div className="grid grid-cols-1 gap-4 text-sm text-gray-800">
              <div>
                <label className="block text-gray-500 font-medium mb-1">
                  Tên cơ quan:
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded">
                  {selectedAgency.name}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">
                  Thông báo ở màn hình quầy:
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded">
                  {selectedAgency.screen_notice || "(Không có)"}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">
                  Ngày làm việc:
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded">
                  {(selectedAgency.allowed_days_of_week || "")
                    .split(",")
                    .map((d: string) => {
                      const days = [
                        "Chủ nhật",
                        "Thứ 2",
                        "Thứ 3",
                        "Thứ 4",
                        "Thứ 5",
                        "Thứ 6",
                        "Thứ 7",
                      ];
                      return days[Number(d)] ?? d;
                    })
                    .join(", ")}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">
                  Thời gian lấy số:
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded">
                  {selectedAgency.ticket_time_range}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">
                  Cho phép lấy số online:
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded">
                  {selectedAgency.allow_online_ticket === 1 ? "Có" : "Không"}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">
                  Thời gian chờ giữa 2 lần lấy số (phút):
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded">
                  {selectedAgency.min_time_between_ticket_online}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">
                  Giới hạn số lần lấy số trong ngày:
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded">
                  {selectedAgency.max_ticket_per_day_online}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">
                  Link lấy số online:
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded">
                  <a
                    href={`/take-number/${selectedAgency.id}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    {origin}/take-number/{selectedAgency.id}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
