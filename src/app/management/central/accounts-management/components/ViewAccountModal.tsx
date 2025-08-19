"use client";

import { API_BASE } from "@/lib/api";
import { useEffect, useState } from "react";

interface ViewAccountModalProps {
  onClose: () => void;
  accountData: any;
}

const roleLabels: Record<number, string> = {
  1: "Super Admin (root)",
  2: "Super Admin",
  11: "Admin cơ quan",
  12: "Admin cơ quan",
  21: "Nhân viên",
  31: "Thiết bị",
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
  const [visible, setVisible] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

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

  const avatarUrl = accountData?.avatar_url
    ? `${API_BASE}/accounts/avatar/${accountData.avatar_url}`
    : accountData?.gender === 0
    ? `${API_BASE}/accounts/avatar/avatar_default_female.png`
    : `${API_BASE}/accounts/avatar/avatar_default_male.png`;

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
            className="object-cover w-32 h-32 mb-3 border-2 border-blue-300 rounded-full shadow-md cursor-pointer"
            onClick={() => setShowAvatarPreview(true)}
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
          {![1, 2].includes(accountData.role_id) && (
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Cơ quan
              </label>
              <div className="px-3 py-2 break-words whitespace-pre-wrap bg-gray-100 rounded">
                {accountData.agency_name_1}
                {accountData.agency_name_2 && (
                  <>
                    <br />
                    {accountData.agency_name_2}
                  </>
                )}
              </div>
            </div>
          )}

          {accountData.role_id === 2 && (
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

      {showAvatarPreview && (
        <div
          onClick={() => setShowAvatarPreview(false)}
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center"
        >
          <img
            src={avatarUrl}
            alt="Avatar full"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl bg-white"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAvatarPreview(false);
            }}
            className="absolute text-3xl font-bold text-white top-4 right-6 hover:text-red-400"
          >
            ×
          </button>
        </div>
      )}
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
