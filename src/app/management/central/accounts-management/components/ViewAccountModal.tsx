"use client";

import { useEffect, useState } from "react";

interface ViewAccountModalProps {
  onClose: () => void;
  accountData: any;
}

const roleLabels: Record<number, string> = {
  1: "Super Admin (root)",
  2: "Super Admin",
  11: "Admin cơ quan",
};

const permissionGroups = [
  {
    label: "Dịch vụ",
    children: [
      { id: 100, label: "Xem dịch vụ" },
      { id: 101, label: "Thêm dịch vụ" },
      { id: 102, label: "Sửa dịch vụ" },
      { id: 103, label: "Xoá dịch vụ" },
    ],
  },
  {
    label: "Nhóm dịch vụ",
    children: [
      { id: 105, label: "Xem nhóm dịch vụ" },
      { id: 106, label: "Thêm nhóm dịch vụ" },
      { id: 107, label: "Sửa nhóm dịch vụ" },
      { id: 108, label: "Xoá nhóm dịch vụ" },
    ],
  },
  {
    label: "Cơ quan",
    children: [
      { id: 110, label: "Xem cơ quan" },
      { id: 111, label: "Thêm cơ quan" },
      { id: 112, label: "Sửa cơ quan" },
      { id: 113, label: "Xoá cơ quan" },
    ],
  },
  {
    label: "Tài khoản",
    children: [
      { id: 120, label: "Xem tài khoản" },
      { id: 121, label: "Thêm tài khoản" },
      { id: 122, label: "Sửa tài khoản" },
      { id: 123, label: "Xoá tài khoản" },
    ],
  },
];

export default function ViewAccountModal({
  onClose,
  accountData,
}: ViewAccountModalProps) {
  const [permissions, setPermissions] = useState<string[]>([]);

  const [visible, setVisible] = useState(false);

  const closeWithFade = () => {
    setVisible(false);
    setTimeout(() => onClose(), 100);
  };
  useEffect(() => {
    if (accountData?.permission_ids) {
      setPermissions(accountData.permission_ids.split(","));
    }

    setTimeout(() => setVisible(true), 10);
  }, [accountData]);

  const labelClass = "text-sm text-gray-600 mb-1";
  const valueClass = "text-base font-medium text-gray-800 mb-4";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm duration-100 transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative w-full max-w-2xl p-8 bg-white border border-blue-200 shadow-2xl rounded-3xl">
        <button
          onClick={closeWithFade}
          className="absolute text-2xl text-gray-400 top-4 right-4 hover:text-red-500"
        >
          ×
        </button>

        <h2 className="pb-3 mb-6 text-2xl font-bold text-blue-700 border-b">
          Chi tiết tài khoản
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className={labelClass}>Tên đăng nhập</div>
            <div className={valueClass}>{accountData.username}</div>
          </div>
          <div>
            <div className={labelClass}>Họ và tên</div>
            <div className={valueClass}>{accountData.full_name}</div>
          </div>
          <div>
            <div className={labelClass}>Giới tính</div>
            <div className={valueClass}>
              {accountData.gender === 1 ? "Nam" : "Nữ"}
            </div>
          </div>
          <div>
            <div className={labelClass}>Số điện thoại</div>
            <div className={valueClass}>{accountData.phone || "-"}</div>
          </div>
          <div>
            <div className={labelClass}>Email</div>
            <div className={valueClass}>{accountData.email || "-"}</div>
          </div>
          <div>
            <div className={labelClass}>Chức danh</div>
            <div className={valueClass}>{accountData.position || "-"}</div>
          </div>
          <div>
            <div className={labelClass}>Vai trò</div>
            <div className={valueClass}>
              {roleLabels[accountData.role_id] ||
                `Vai trò ${accountData.role_id}`}
            </div>
          </div>
          <div>
            <div className={labelClass}>Cơ quan</div>
            <div className={valueClass}>{accountData.agency_name || "-"}</div>
          </div>
        </div>

        {accountData.role_id === 2 && (
          <div className="mt-6">
            <div className="mb-2 font-medium text-blue-700">
              Danh sách quyền
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 overflow-y-auto border rounded-lg max-h-[12rem] text-sm">
              {permissionGroups.map((group, gi) => (
                <div key={gi}>
                  <div className="mb-1 font-semibold text-blue-600">
                    {group.label}
                  </div>
                  {group.children.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={permissions.includes(p.id.toString())}
                        readOnly
                        disabled
                      />
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
