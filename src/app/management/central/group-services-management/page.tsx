"use client";

import { usePopup } from "@/components/popup/PopupContext";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useEffect, useState } from "react";
import { useGlobalParams } from "@/components/ClientWrapper";
import { PermissionEnum, RoleEnum } from "@/constants/Enum";
import AddOrUpdateGroupServiceModal from "./components/AddOrUpdateGroupServiceModal";

export default function GroupServicesManagementPage() {
  const router = useRouter();
  const { popupMessage, popupConfirmRed } = usePopup();
  const { hasAccess } = useGlobalParams();

  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const fetchData = async () => {
    const res = await apiGet("/group-services/findAllNotDeleted");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    setGroups(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (groupId: number, newStatus: number) => {
    const res = await apiPost(`/group-services/${groupId}/status`, {
      status: newStatus,
    });

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      setGroups((prev) =>
        prev.map((item) =>
          item.id === groupId ? { ...item, status: newStatus } : item
        )
      );
    } else {
      popupMessage({
        title: "Cập nhật trạng thái thất bại",
        description: "Mạng không ổn định hoặc máy chủ không phản hồi.",
      });
    }
  };

  const handleDelete = async (group: any) => {
    const res = await apiPost(`/group-services/${group.id}/delete`, {});
    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      setGroups((prev) => prev.filter((item) => item.id !== group.id));
    } else {
      popupMessage({
        title: `Xoá thất bại`,
        description: group.name,
      });
    }
  };

  const filteredGroups = groups.filter((group) => {
    const matchName = group.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "" || String(group.status) === statusFilter;
    return matchName && matchStatus;
  });

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[50rem]">
      <div className="flex items-center justify-between mb-6">
        {hasAccess({
          allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
          allowedPermissions: [PermissionEnum.SERVICE_GROUP_ADD_SUPER],
        }) && (
          <button
            className="flex items-center gap-2 px-5 py-2 font-semibold text-white transition bg-blue-700 shadow hover:bg-blue-900 rounded-xl"
            onClick={() => {
              setEditingGroup(null); // thêm mới nên clear dữ liệu
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
            placeholder="Tìm kiếm..."
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
            <th className="px-4 py-3 font-semibold">Tên nhóm</th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.map((group, idx) => (
            <tr
              key={group.id}
              className="transition border-b border-slate-300 last:border-none hover:bg-blue-50"
            >
              <td className="px-4 py-3 font-semibold text-blue-800">
                {idx + 1}
              </td>
              <td className="px-4 py-3">{group.name}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {hasAccess({
                    allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
                    allowedPermissions: [
                      PermissionEnum.SERVICE_GROUP_UPDATE_SUPER,
                    ],
                  }) && (
                    <>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={group.status === 1}
                          onChange={(e) => {
                            const newStatus = e.target.checked ? 1 : 0;
                            handleToggleStatus(group.id, newStatus);
                          }}
                        />
                        <div className="h-6 bg-gray-200 rounded-full w-11 peer-checked:bg-blue-600"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform duration-300"></div>
                      </label>
                      <button
                        title="Chỉnh sửa"
                        className="p-2 rounded-lg hover:bg-blue-100"
                        onClick={() => {
                          setEditingGroup(group);
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
                    allowedPermissions: [
                      PermissionEnum.SERVICE_GROUP_DELETE_SUPER,
                    ],
                  }) && (
                    <button
                      title="Xoá"
                      className="p-2 rounded-lg hover:bg-red-100"
                      onClick={() => {
                        popupConfirmRed({
                          title: "Xác nhận xoá nhóm?",
                          description: group.name,
                        }).then((confirmed) => {
                          if (confirmed) handleDelete(group);
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
        <AddOrUpdateGroupServiceModal
          onClose={() => {
            setShowAddPopup(false);
            setEditingGroup(null);
          }}
          onSuccess={fetchData}
          initialData={editingGroup}
        />
      )}
    </section>
  );
}
