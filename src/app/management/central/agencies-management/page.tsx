"use client";

import { usePopup } from "@/components/popup/PopupContext";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useEffect, useState } from "react";
import AddAgencyModal from "./components/AddOrUpdateAgencyModal";
import AgencyDetailModal from "./components/AgencyDetailModal";
import { useGlobalParams } from "@/components/ClientWrapper";
import { PermissionEnum, RoleEnum } from "@/constants/Enum";

export default function AgenciesManagementPage() {
  const router = useRouter();
  const { popupMessage, popupConfirmRed } = usePopup();

  const [agencies, setAgencies] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<any>(null);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingAgency, setEditingAgency] = useState<any>(null);
  const { hasAccess } = useGlobalParams();

  const fetchData = async () => {
    const res = await apiGet("/agencies/findAllNotDeleted");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }
    setAgencies(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveOrUpdateAgency = async (formData: any) => {
    const isUpdate = !!editingAgency;
    const endpoint = isUpdate
      ? `/agencies/${editingAgency.id}/update`
      : "/agencies/create";

    const res = await apiPost(endpoint, formData);
    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
    }

    if (res.status === 201) {
      setShowAddPopup(false);
      setEditingAgency(null);
      fetchData();
    }

    return res;
  };

  const filtered = agencies.filter((a) => {
    const matchName = a.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "" || String(a.status) === statusFilter;
    return matchName && matchStatus;
  });

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      <div className="flex items-center justify-between mb-6">
        {hasAccess({
          allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
          allowedPermissions: [PermissionEnum.AGENCY_ADD_SUPER],
        }) && (
          <button
            className="flex items-center gap-2 px-5 py-2 font-semibold text-white transition bg-blue-700 shadow cursor-pointer hover:bg-blue-900 rounded-xl"
            onClick={() => {
              setEditingAgency(null);
              setShowAddPopup(true);
            }}
          >
            <span className="font-bold">+</span> Thêm
          </button>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm tên cơ quan..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Tắt</option>
          </select>
        </div>
      </div>

      <table className="min-w-full overflow-hidden rounded-xl">
        <thead>
          <tr className="text-left text-blue-900 bg-blue-100">
            <th className="px-4 py-3 font-semibold rounded-tl-xl">#</th>
            <th className="px-4 py-3 font-semibold">Tên cơ quan</th>
            <th className="px-4 py-3 font-semibold">Địa chỉ</th>
            <th className="px-4 py-3 font-semibold">SĐT</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a, idx) => (
            <tr
              key={a.id}
              className="transition border-b border-slate-300 last:border-none hover:bg-blue-50 group"
            >
              <td className="px-4 py-3 font-semibold text-blue-800">
                {idx + 1}
              </td>
              <td className="px-4 py-3">{a.name}</td>
              <td className="px-4 py-3">{a.address}</td>
              <td className="px-4 py-3">{a.phone}</td>
              <td className="px-4 py-3">{a.email || "-"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
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

                  {hasAccess({
                    allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
                    allowedPermissions: [PermissionEnum.AGENCY_UPDATE_SUPER],
                  }) && (
                    <>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer disabled:opacity-50"
                          checked={a.status === 1}
                          onChange={async (e) => {
                            e.target.disabled = true;
                            const newStatus = e.target.checked ? 1 : 0;
                            const res = await apiPost(
                              `/agencies/${a.id}/status`,
                              {
                                status: newStatus,
                              }
                            );

                            e.target.disabled = false;

                            if (![201, 400].includes(res.status)) {
                              handleApiError(res, popupMessage, router);
                              return;
                            }

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
                        <div className="h-6 transition duration-300 bg-gray-200 rounded-full w-11 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-5"></div>
                      </label>
                      <button
                        title="Chỉnh sửa"
                        className="p-2 rounded-lg hover:bg-blue-100"
                        onClick={() => {
                          setEditingAgency(a);
                          setShowAddPopup(true);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-blue-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l2.65 2.65a2 2 0 010 2.828l-9.393 9.393a2 2 0 01-.708.464l-4 1.333a1 1 0 01-1.262-1.262l1.333-4a2 2 0 01.464-.708l9.393-9.393a2 2 0 012.828 0z"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                  {hasAccess({
                    allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
                    allowedPermissions: [PermissionEnum.AGENCY_DELETE_SUPER],
                  }) && (
                    <button
                      title="Xóa"
                      className="p-2 rounded-lg hover:bg-red-100"
                      onClick={() => {
                        popupConfirmRed({
                          title: "Xác nhận xoá cơ quan?",
                          description: a.name,
                        }).then(async (confirmed) => {
                          if (!confirmed) return;

                          const res = await apiPost(
                            `/agencies/${a.id}/delete`,
                            {}
                          );

                          if (![201, 400].includes(res.status)) {
                            handleApiError(res, popupMessage, router);
                            return;
                          }

                          if (res.status === 201) {
                            setAgencies((prev) =>
                              prev.filter((item) => item.id !== a.id)
                            );
                          } else {
                            popupMessage({
                              title: `Xoá thất bại`,
                              description: a.name,
                            });
                          }
                        });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 7h12M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddPopup && (
        <AddAgencyModal
          onClose={() => {
            setShowAddPopup(false);
            setEditingAgency(null);
          }}
          onSubmit={handleSaveOrUpdateAgency}
          initialData={editingAgency}
        />
      )}

      {showDetail && selectedAgency && (
        <AgencyDetailModal
          agency={selectedAgency}
          onClose={() => setShowDetail(false)}
        />
      )}
    </section>
  );
}
