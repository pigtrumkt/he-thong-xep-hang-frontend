"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { usePopup } from "@/components/popup/PopupContext";
import { useGlobalParams } from "@/components/ClientWrapper";
import { PermissionEnum, RoleEnum } from "@/constants/Enum";
import React from "react";

interface ServiceWithGroupName {
  id: number;
  name: string;
  group_id: number | null;
  groupName: string;
  range_start: number;
  range_end: number;
  status: number;
  order: number;
}

export default function ServicesManagementPage() {
  const router = useRouter();
  const { popupMessage, popupConfirmRed } = usePopup();
  const { hasAccess } = useGlobalParams();

  const [services, setServices] = useState<ServiceWithGroupName[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const fetchData = async () => {
    const res = await apiGet("/services/findGroupedServicesNotDeleted");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    const flattened: ServiceWithGroupName[] = (res.data || []).flatMap(
      (group: any) => {
        const groupName =
          group.id === 0 ? "Chưa phân nhóm" : group.name || "Chưa phân nhóm";
        return (group.services || []).map((s: any) => ({
          ...s,
          groupName,
        }));
      }
    );

    setServices(flattened);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupOptions = Array.from(new Set(services.map((s) => s.groupName)));

  const handleToggleStatus = async (id: number, newStatus: number) => {
    const res = await apiPost(`/services/${id}/status`, { status: newStatus });
    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      setServices((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } else {
      popupMessage({
        title: "Cập nhật trạng thái thất bại",
        description: "Mạng không ổn định hoặc máy chủ không phản hồi.",
      });
    }
  };

  const handleDelete = async (s: ServiceWithGroupName) => {
    const res = await apiPost(`/services/${s.id}/delete`, {});
    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      setServices((prev) => prev.filter((item) => item.id !== s.id));
    } else {
      popupMessage({
        title: `Xoá thất bại`,
        description: s.name,
      });
    }
  };

  const filteredGroups = services
    .filter((s) => {
      const matchName = s.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "" || String(s.status) === statusFilter;
      const matchGroup = groupFilter === "" || s.groupName === groupFilter;
      return matchName && matchStatus && matchGroup;
    })
    .reduce((groups: Record<string, ServiceWithGroupName[]>, service) => {
      const key = service.groupName || "Chưa phân nhóm";
      if (!groups[key]) groups[key] = [];
      groups[key].push(service);
      return groups;
    }, {});

  const groupKeys = Object.keys(filteredGroups);

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {hasAccess({
          allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
          allowedPermissions: [PermissionEnum.SERVICE_ADD_SUPER],
        }) && (
          <button
            className="flex items-center gap-2 px-5 py-2 font-semibold text-white transition bg-blue-700 shadow cursor-pointer hover:bg-blue-900 rounded-xl"
            onClick={() => alert("TODO: open modal thêm dịch vụ")}
          >
            <span className="font-bold">+</span> Thêm
          </button>
        )}
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm tên dịch vụ..."
          />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-3 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả nhóm</option>
            {groupOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
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
            <th className="px-4 py-3 font-semibold">Tên dịch vụ</th>
            <th className="px-4 py-3 font-semibold">Số thứ tự</th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {groupKeys.map((groupName) => {
            const servicesInGroup = filteredGroups[groupName];
            return (
              <React.Fragment key={groupName}>
                <tr className="border-b border-blue-200 bg-blue-50/70">
                  <td
                    colSpan={5}
                    className="px-4 py-3 font-bold text-blue-800 uppercase"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <path d="M3 7v10" />
                      </svg>
                      {groupName}
                    </div>
                  </td>
                </tr>
                {servicesInGroup.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="transition border-b hover:bg-blue-50 group"
                  >
                    <td className="px-4 py-3 font-semibold text-blue-800">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">
                      {s.range_start} ~ {s.range_end}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {hasAccess({
                          allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
                          allowedPermissions: [
                            PermissionEnum.SERVICE_UPDATE_SUPER,
                          ],
                        }) && (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={s.status === 1}
                              onChange={(e) => {
                                const newStatus = e.target.checked ? 1 : 0;
                                handleToggleStatus(s.id, newStatus);
                              }}
                            />
                            <div className="h-6 transition-colors bg-gray-200 rounded-full w-11 peer-checked:bg-blue-600"></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform duration-300"></div>
                          </label>
                        )}

                        {hasAccess({
                          allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
                          allowedPermissions: [
                            PermissionEnum.SERVICE_UPDATE_SUPER,
                          ],
                        }) && (
                          <button
                            title="Chỉnh sửa"
                            className="p-2 rounded-lg hover:bg-blue-100"
                            onClick={() => alert("TODO: sửa dịch vụ")}
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
                        )}

                        {hasAccess({
                          allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
                          allowedPermissions: [
                            PermissionEnum.SERVICE_DELETE_SUPER,
                          ],
                        }) && (
                          <button
                            title="Xoá"
                            className="p-2 rounded-lg hover:bg-red-100"
                            onClick={() => {
                              popupConfirmRed({
                                title: "Xác nhận xoá dịch vụ?",
                                description: s.name,
                              }).then((confirmed) => {
                                if (confirmed) handleDelete(s);
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
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
