"use client";

import { useEffect, useState } from "react";

interface ViewAccountModalProps {
  onClose: () => void;
  accountData: any;
}

const roleLabels: Record<number, string> = {
  11: "Admin",
  12: "Quản lý",
  21: "Nhân viên",
  31: "Thiết bị",
};

const permissionGroups = [
  {
    label: "Gọi số",
    children: [{ id: 130, label: "Gọi" }],
  },
  {
    label: "Quầy",
    children: [
      { id: 140, label: "Xem quầy" },
      { id: 141, label: "Thêm quầy" },
      { id: 142, label: "Sửa quầy" },
      { id: 143, label: "Xoá quầy" },
    ],
  },
  {
    label: "Dịch vụ",
    children: [
      { id: 150, label: "Xem dịch vụ" },
      { id: 151, label: "Thay đổi dịch vụ" },
    ],
  },
  {
    label: "Tài khoản",
    children: [
      { id: 160, label: "Xem tài khoản" },
      { id: 161, label: "Thêm tài khoản" },
      { id: 162, label: "Sửa tài khoản" },
      { id: 163, label: "Xoá tài khoản" },
    ],
  },
  {
    label: "Cài đặt",
    children: [
      { id: 170, label: "Xem cài đặt" },
      { id: 171, label: "Thay đổi cài đặt" },
    ],
  },
];

export default function ViewAccountModal({
  onClose,
  accountData,
}: ViewAccountModalProps) {
  const [visible, setVisible] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

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

  const host =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : "";

  const avatarUrl = accountData?.avatar_url
    ? `${host}/accounts/avatar/${accountData.avatar_url}?v=${Date.now()}`
    : accountData?.gender === 0
    ? `${host}/accounts/avatar/avatar_default_female.png`
    : `${host}/accounts/avatar/avatar_default_male.png`;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-100 bg-black/40 backdrop-blur-sm ${
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

        {/* Ảnh đại diện */}
        <div className="flex justify-center my-4">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="object-cover w-32 h-32 mb-3 border-2 shadow-md border-slate-400"
          />
        </div>

        <div className="space-y-5 text-sm text-gray-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tên đăng nhập" value={accountData.username} />
            <Field
              label="Trạng thái"
              value={accountData.status === 1 ? "Đang hoạt động" : "Tạm khóa"}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Họ và tên" value={accountData.full_name} />
            <Field
              label="Giới tính"
              value={accountData.gender === 1 ? "Nam" : "Nữ"}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Số điện thoại" value={accountData.phone} />
            <Field label="Email" value={accountData.email} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Chức danh" value={accountData.position} />
            <Field
              label="Vai trò"
              value={
                roleLabels[accountData.role_id] ||
                `Vai trò ${accountData.role_id}`
              }
            />
          </div>

          {[12, 21].includes(accountData.role_id) && (
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Danh sách quyền
              </label>
              <div className="grid grid-cols-1 gap-4 p-4 border border-blue-200 md:grid-cols-2 bg-blue-50/50 rounded-xl">
                {permissionGroups.map((group, gi) => (
                  <div key={gi}>
                    <div className="mb-2 font-semibold text-blue-700">
                      {group.label}
                    </div>
                    {group.children.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 mb-1 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={permissions.includes(p.id.toString())}
                          disabled
                          className="w-4 h-4 accent-blue-600"
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Field hiển thị giá trị readonly
function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="px-3 py-2 break-words whitespace-pre-wrap bg-gray-100 rounded">
        {value !== undefined && value !== null && value !== ""
          ? value
          : "(Không có)"}
      </div>
    </div>
  );
}
