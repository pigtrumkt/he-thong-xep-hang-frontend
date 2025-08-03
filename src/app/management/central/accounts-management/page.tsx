"use client";

import { usePopup } from "@/components/popup/PopupContext";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useEffect, useState } from "react";
import { useGlobalParams } from "@/components/ClientWrapper";
import { RoleEnum, PermissionEnum } from "@/constants/Enum";

export default function AccountsManagementPage() {
  const router = useRouter();
  const { popupMessage, popupConfirmRed } = usePopup();
  const { hasAccess } = useGlobalParams();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    const res = await apiGet("/accounts/findAllNotDeleted");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }
    setAccounts(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (accountId: number, newStatus: number) => {
    const res = await apiPost(`/accounts/${accountId}/status`, {
      status: newStatus,
    });

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      setAccounts((prev) =>
        prev.map((item) =>
          item.id === accountId ? { ...item, status: newStatus } : item
        )
      );
    } else {
      popupMessage({
        title: "Cập nhật trạng thái thất bại",
        description: "Mạng không ổn định hoặc máy chủ không phản hồi.",
      });
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const username = acc.username || "";
    const matchText = username.toLowerCase().includes(search.toLowerCase());

    const matchAgency =
      agencyFilter === "" ||
      (agencyFilter === "Super Admin" && [1, 2].includes(acc.role_id)) ||
      acc.agency_name === agencyFilter;

    const matchStatus =
      statusFilter === "" ||
      (statusFilter === "active" && acc.status === 1) ||
      (statusFilter === "inactive" && acc.status === 0);

    return matchText && matchAgency && matchStatus;
  });

  const groupedAccounts: Record<string, any[]> = {};

  filteredAccounts.forEach((acc) => {
    const groupKey = [1, 2].includes(acc.role_id)
      ? "Super Admin"
      : acc.agency_name || `Cơ quan ${acc.agency_id}`;
    if (!groupedAccounts[groupKey]) groupedAccounts[groupKey] = [];
    groupedAccounts[groupKey].push(acc);
  });

  Object.keys(groupedAccounts).forEach((key) => {
    groupedAccounts[key].sort((a, b) => {
      if (a.role_id !== b.role_id) return a.role_id - b.role_id;
      return a.username.localeCompare(b.username);
    });
  });

  const getRoleLabel = (roleId: number) => {
    switch (roleId) {
      case 1:
      case 2:
        return "Super Admin";
      case 11:
      case 12:
        return "Admin cơ quan";
      case 21:
        return "Nhân viên";
      case 31:
        return "Thiết bị";
      default:
        return `Vai trò ${roleId}`;
    }
  };

  const getRoleClass = (roleId: number) => {
    return roleId === 1 || roleId === 11
      ? "bg-red-100 text-red-700 font-semibold px-2 py-1 rounded"
      : "";
  };

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      <div className="flex items-center justify-between mb-6">
        {hasAccess({
          allowedRoles: [RoleEnum.SUPER_ADMIN_ROOT],
          allowedPermissions: [PermissionEnum.ACCOUNT_ADD_SUPER],
        }) && (
          <button
            className="flex items-center gap-2 px-5 py-2 font-semibold text-white transition bg-blue-700 shadow cursor-pointer hover:bg-blue-900 rounded-xl"
            onClick={() => {
              // TODO: mở modal thêm mới tài khoản
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
            className="px-4 py-2 transition-colors bg-white border rounded-lg outline-none w-96 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm tên đăng nhập..."
          />
          <select
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value)}
            className="px-3 py-2 transition-colors bg-white border rounded-lg outline-none w-72 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả cơ quan</option>
            <option value="Super Admin">Super Admin</option>
            {Array.from(
              new Set(
                accounts
                  .filter((acc) => acc.agency_name)
                  .map((acc) => acc.agency_name)
              )
            ).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 transition-colors bg-white border rounded-lg outline-none w-60 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      <table className="min-w-full overflow-hidden rounded-xl">
        <thead>
          <tr className="text-left text-blue-900 bg-blue-100">
            <th className="px-4 py-3 font-semibold rounded-tl-xl">#</th>
            <th className="px-4 py-3 font-semibold">Tên đăng nhập</th>
            <th className="px-4 py-3 font-semibold">Họ và tên</th>
            <th className="px-4 py-3 font-semibold">Số điện thoại</th>
            <th className="px-4 py-3 font-semibold">Chức danh</th>
            <th className="px-4 py-3 font-semibold">Vai trò</th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedAccounts).map(([groupName, group]) => (
            <>
              <tr
                key={groupName}
                className="border-b border-slate-300 bg-blue-50/70"
              >
                <td
                  colSpan={7}
                  className="px-4 py-3 font-bold text-blue-800 uppercase"
                >
                  {groupName}
                </td>
              </tr>
              {group.map((acc, index) => (
                <tr
                  key={acc.id}
                  className="transition border-b border-slate-300 hover:bg-blue-50 group"
                >
                  <td className="px-4 py-2 font-semibold text-blue-800">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2">{acc.username}</td>
                  <td className="px-4 py-2">{acc.full_name}</td>
                  <td className="px-4 py-2">{acc.phone}</td>
                  <td className="px-4 py-2">{acc.position}</td>
                  <td className="px-4 py-2">
                    <span className={getRoleClass(acc.role_id)}>
                      {getRoleLabel(acc.role_id)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        title="Xem chi tiết"
                        className="p-2 rounded-lg hover:bg-blue-100"
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
                        allowedPermissions: [
                          PermissionEnum.ACCOUNT_UPDATE_SUPER,
                        ],
                      }) && (
                        <>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={acc.status === 1}
                              onChange={(e) =>
                                handleToggleStatus(
                                  acc.id,
                                  e.target.checked ? 1 : 0
                                )
                              }
                            />
                            <div className="h-6 bg-gray-200 rounded-full w-11 peer-checked:bg-blue-600"></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-5"></div>
                          </label>
                          <button
                            title="Sửa"
                            className="p-2 rounded-lg hover:bg-blue-100"
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
                          PermissionEnum.ACCOUNT_DELETE_SUPER,
                        ],
                      }) && (
                        <button
                          title="Xoá"
                          className="p-2 rounded-lg hover:bg-red-100"
                          onClick={() => {
                            popupConfirmRed({
                              title: "Xác nhận xoá tài khoản?",
                              description: acc.username,
                            }).then(async (confirmed) => {
                              if (!confirmed) return;

                              const res = await apiPost(
                                `/accounts/${acc.id}/delete`,
                                {}
                              );

                              if (![201, 400].includes(res.status)) {
                                handleApiError(res, popupMessage, router);
                                return;
                              }

                              if (res.status === 201) {
                                setAccounts((prev) =>
                                  prev.filter((item) => item.id !== acc.id)
                                );
                              } else {
                                popupMessage({
                                  title: `Xoá thất bại`,
                                  description: acc.username,
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
            </>
          ))}
        </tbody>
      </table>
    </section>
  );
}
