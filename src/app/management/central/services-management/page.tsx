"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { usePopup } from "@/components/popup/PopupContext";
import { useGlobalParams } from "@/components/ClientWrapper";
import { PermissionEnum, RoleEnum } from "@/constants/Enum";

export default function ServicesManagementPage() {
  const router = useRouter();
  const { popupMessage } = usePopup();
  const { hasAccess } = useGlobalParams();

  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    const res = await apiGet("/services/findAllNotDeleted");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }
    setServices(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = services.filter((s) => {
    const matchName = s.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "" || String(s.status) === statusFilter;
    return matchName && matchStatus;
  });

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      <div className="flex items-center justify-between mb-6">
        {hasAccess({
          allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
          allowedPermissions: [PermissionEnum.SERVICE_ADD_SUPER],
        }) && (
          <button
            className="flex items-center gap-2 px-5 py-2 font-semibold text-white transition bg-blue-700 shadow cursor-pointer hover:bg-blue-900 rounded-xl"
            onClick={() => alert("TODO: open modal thêm dịch vụ")}
          >
            <span className="font-bold">+</span> Thêm dịch vụ
          </button>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm tên dịch vụ..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hiển thị</option>
            <option value="0">Ẩn</option>
          </select>
        </div>
      </div>

      <table className="min-w-full overflow-hidden rounded-xl">
        <thead>
          <tr className="text-left text-blue-900 bg-blue-100">
            <th className="px-4 py-3 font-semibold rounded-tl-xl">#</th>
            <th className="px-4 py-3 font-semibold">Tên dịch vụ</th>
            <th className="px-4 py-3 font-semibold">Nhóm</th>
            <th className="px-4 py-3 font-semibold">Range</th>
            <th className="px-4 py-3 font-semibold">Trạng thái</th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s, idx) => (
            <tr
              key={s.id}
              className="transition border-b border-slate-300 last:border-none hover:bg-blue-50 group"
            >
              <td className="px-4 py-3 font-semibold text-blue-800">
                {idx + 1}
              </td>
              <td className="px-4 py-3">{s.name}</td>
              <td className="px-4 py-3">{s.group_id}</td>
              <td className="px-4 py-3">
                {s.range_start} ~ {s.range_end}
              </td>
              <td className="px-4 py-3">
                {s.status === 1 ? "Hiển thị" : "Ẩn"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    title="Chỉnh sửa"
                    className="p-2 rounded-lg hover:bg-blue-100"
                    onClick={() => alert("TODO: sửa dịch vụ")}
                  >
                    ✏️
                  </button>
                  <button
                    title="Xoá"
                    className="p-2 rounded-lg hover:bg-red-100"
                    onClick={() => alert("TODO: xóa dịch vụ")}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
