"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalParams } from "@/components/ClientWrapper";
import { apiGet, apiPost } from "@/lib/api";
import { usePopup } from "@/components/popup/PopupContext";
import { handleApiError } from "@/lib/handleApiError";
import AddOrUpdateCounterModal from "./component/AddOrUpdateCounterModal";

export default function CountersPage() {
  const router = useRouter();
  const { globalParams } = useGlobalParams();
  const { popupMessage, popupConfirmRed } = usePopup();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [counters, setCounters] = useState<any[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editingCounter, setEditingCounter] = useState<any>(null);

  const fetchData = async () => {
    const res = await apiGet("/counters/findNotDeletedByAgency");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }
    setCounters(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = counters.filter((c) => {
    const matchName =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.using_account_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.using_service_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "" ||
      (statusFilter === "using" && c.using_account_id) ||
      (statusFilter === "free" && !c.using_account_id && c.status === 1) ||
      (statusFilter === "off" && c.status === 0);
    return matchName && matchStatus;
  });

  const renderStatus = (counter: any) => {
    if (counter.status !== 1) {
      return (
        <>
          <span className="inline-block w-3 h-3 mr-2 align-middle bg-gray-400 rounded-full" />
          Tắt
        </>
      );
    }
    if (counter.using_account_id) {
      return (
        <div className="flex items-center gap-3">
          <span className="inline-block w-3 h-3 bg-red-400 rounded-full" />
          <div className="text-slate-700 text-sm space-y-0.5">
            <div className="font-semibold text-red-600">Đang sử dụng</div>
            <div>
              Người sử dụng:{" "}
              <span className="font-semibold text-blue-700">
                {counter.using_account_name}
              </span>
            </div>
            <div>
              Dịch vụ:{" "}
              <span className="font-semibold text-blue-700">
                {counter.using_service_name}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <>
        <span className="inline-block w-3 h-3 mr-2 align-middle bg-green-400 rounded-full" />
        Trống
      </>
    );
  };

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[40rem]">
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2 px-5 py-2 font-semibold text-white transition bg-blue-700 shadow hover:bg-blue-900 rounded-xl"
          onClick={() => {
            setEditingCounter(null);
            setShowAddPopup(true);
          }}
        >
          <span className="font-bold">+</span>
          Thêm
        </button>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="px-4 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="using">Đang sử dụng</option>
            <option value="free">Trống</option>
            <option value="off">Tắt</option>
          </select>
        </div>
      </div>

      <table className="min-w-full overflow-hidden rounded-xl">
        <thead>
          <tr className="text-left text-blue-900 bg-blue-100">
            <th className="px-4 py-3 font-semibold rounded-tl-xl">#</th>
            <th className="px-4 py-3 font-semibold">Tên Quầy</th>
            <th className="px-4 py-3 font-semibold">Trạng Thái</th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, idx) => (
            <tr
              key={c.id}
              className="transition border-b last:border-none hover:bg-blue-50 group"
            >
              <td className="px-4 py-3 font-semibold text-blue-800">
                {idx + 1}
              </td>
              <td className="px-4 py-3">{c.name}</td>
              <td className="px-4 py-3">{renderStatus(c)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={c.status === 1}
                      onChange={async (e) => {
                        e.target.disabled = true;
                        const newStatus = e.target.checked ? 1 : 0;
                        const res = await apiPost(`/counters/${c.id}/status`, {
                          status: newStatus,
                        });
                        e.target.disabled = false;

                        if (![201, 400].includes(res.status)) {
                          popupMessage({
                            title: "Cập nhật trạng thái thất bại",
                            description: c.name,
                          });
                          return;
                        }

                        if (res.status === 201) {
                          fetchData();
                        } else {
                          popupMessage({
                            title: "Cập nhật trạng thái thất bại",
                            description: c.name,
                          });
                        }
                      }}
                    />
                    <div className="h-6 transition duration-300 bg-gray-200 rounded-full w-11 peer-checked:bg-blue-600" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-5" />
                  </label>
                  <button
                    className="p-2 rounded-lg hover:bg-blue-100"
                    title="Chỉnh sửa"
                    onClick={() => {
                      setEditingCounter(c);
                      setShowAddPopup(true);
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-blue-700"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M16.862 4.487l2.65 2.65a2 2 0 010 2.828l-9.393 9.393a2 2 0 01-.708.464l-4 1.333a1 1 0 01-1.262-1.262l1.333-4a2 2 0 01.464-.708l9.393-9.393a2 2 0 012.828 0z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-red-100"
                    title="Xóa"
                    onClick={async () => {
                      const confirmed = await popupConfirmRed({
                        title: "Xác nhận xoá quầy?",
                        description: c.name,
                      });
                      if (!confirmed) return;

                      const res = await apiPost(`/counters/${c.id}/delete`, {});
                      if (![201, 400].includes(res.status)) {
                        handleApiError(res, popupMessage, router);
                        return;
                      }
                      if (res.status === 201) {
                        fetchData();
                      } else {
                        popupMessage({
                          title: "Xóa thất bại",
                          description: c.name,
                        });
                      }
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
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

      {showAddPopup && (
        <AddOrUpdateCounterModal
          onClose={() => {
            setShowAddPopup(false);
            setEditingCounter(null);
          }}
          onSuccess={fetchData}
          initialData={editingCounter}
        />
      )}
    </section>
  );
}
