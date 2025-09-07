"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import { usePopup } from "@/components/popup/PopupContext";
import { handleApiError } from "@/lib/handleApiError";
import { useGlobalParams } from "@/components/ClientWrapper";
import { RoleEnum } from "@/constants/Enum";

interface AddOrUpdateAccountModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

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

export default function AddOrUpdateAccountModal({
  onClose,
  onSuccess,
  initialData,
}: AddOrUpdateAccountModalProps) {
  const { globalParams } = useGlobalParams();
  const currentUserRole = globalParams?.user?.role_id;

  const allowedRoles =
    currentUserRole === 1
      ? [
          { id: 1, label: "Super Admin (root)" },
          { id: 2, label: "Super Admin" },
          { id: 11, label: "Admin cơ quan" },
        ]
      : currentUserRole === 2
      ? [{ id: 11, label: "Admin cơ quan" }]
      : [];

  const router = useRouter();
  const { popupMessage } = usePopup();
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    gender: "1",
    email: "",
    phone: "",
    position: "",
    role_id: "",
    agency_id: "",
    permission_ids: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agencies, setAgencies] = useState<any[]>([]);

  const errorText = (field: string) => {
    if (errors[field]) {
      return <p className="mt-1 text-sm text-red-400">{errors[field]}</p>;
    }
    return "";
  };

  const closeWithFade = () => {
    setVisible(false);
    setTimeout(() => onClose(), 100);
  };

  useEffect(() => {
    apiGet("/agencies/findAllNotDeleted").then((res) => {
      if (res.status === 200) setAgencies(res.data);
    });

    if (initialData) {
      setForm({
        username: initialData.username || "",
        password: "",
        full_name: initialData.full_name || "",
        gender: initialData.gender?.toString() || "1",
        email: initialData.email || "",
        phone: initialData.phone || "",
        position: initialData.position || "",
        role_id: initialData.role_id?.toString() || "",
        agency_id: initialData.agency_id?.toString() || "",
        permission_ids: initialData.permission_ids
          ? initialData.permission_ids.split(",")
          : [],
      });
    } else {
      const allPermissionIds = permissionGroups
        .flatMap((g) => g.children)
        .map((p) => p.id.toString());

      setForm((prev) => ({
        ...prev,
        permission_ids: allPermissionIds,
      }));
    }

    setTimeout(() => setVisible(true), 10);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetPassword = async () => {
    const result = await apiPost(`/accounts/${initialData.id}/reset-pass`);
    if (![201, 400].includes(result.status)) {
      handleApiError(result, popupMessage, router);
    }

    if (result?.status === 201) {
      popupMessage({ description: result.data.message });
    } else if (
      result &&
      result.status === 400 &&
      typeof result.data === "object"
    ) {
      popupMessage({ description: result.data.message });
    } else {
      popupMessage({ description: "Lỗi hệ thống" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username: form.username.trim(),
      password: form.password,
      full_name: form.full_name.trim(),
      gender: Number(form.gender),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position: form.position.trim(),
      role_id: Number(form.role_id),
      agency_id: form.agency_id ? Number(form.agency_id) : null,
      permission_ids: form.permission_ids?.join(",") || "",
    };

    const endpoint = initialData
      ? `/accounts/${initialData.id}/updateCentral`
      : "/accounts/createCentral";

    const result = await apiPost(endpoint, payload);
    if (![201, 400].includes(result.status)) {
      handleApiError(result, popupMessage, router);
    }

    if (result?.status === 201) {
      setVisible(false);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 100);
    } else if (
      result &&
      result.status === 400 &&
      typeof result.data === "object"
    ) {
      setErrors(result.data);
    } else {
      setErrors({});
    }
  };

  const inputClass =
    "w-full px-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-100";

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
          {initialData ? "Cập nhật tài khoản" : "Thêm tài khoản"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-sm text-gray-800"
        >
          {/* Username + Password or Full Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">
                Tên đăng nhập <span className="text-red-400">*</span>
              </label>
              <input
                name="username"
                autoComplete="off"
                value={form.username}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={!!initialData}
              />
              {errorText("username")}
            </div>

            {!initialData ? (
              <div>
                <label className="block mb-1 font-medium">
                  Mật khẩu <span className="text-red-400">*</span>
                </label>
                <input
                  name="password"
                  type="text"
                  autoComplete="new-password"
                  style={
                    {
                      WebkitTextSecurity: "disc",
                    } as React.CSSProperties
                  }
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                {errorText("password")}
              </div>
            ) : (
              <div>
                <label className="block mb-1 font-medium">
                  Họ và tên <span className="text-red-400">*</span>
                </label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                {errorText("full_name")}
              </div>
            )}
          </div>

          {!initialData && (
            <div>
              <label className="block mb-1 font-medium">
                Họ và tên <span className="text-red-400">*</span>
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className={inputClass}
                required
              />
              {errorText("full_name")}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">
                Giới tính <span className="text-red-400">*</span>
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="1">Nam</option>
                <option value="0">Nữ</option>
              </select>
              {errorText("gender")}
            </div>
            <div>
              <label className="block mb-1 font-medium">Chức danh</label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                className={inputClass}
              />
              {errorText("position")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Số điện thoại</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
              {errorText("phone")}
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
              {errorText("email")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">
                Vai trò <span className="text-red-400">*</span>
              </label>
              <select
                name="role_id"
                value={form.role_id}
                onChange={handleChange}
                className={`${inputClass} ${
                  errors.role_id ? "border-red-400" : ""
                }`}
                disabled={initialData?.id === globalParams?.user?.id}
                required
              >
                <option value="">-- Chọn vai trò --</option>
                {allowedRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              {errorText("role_id")}
            </div>
            {form.role_id === "11" && (
              <div>
                <label className="block mb-1 font-medium">Cơ quan</label>
                <select
                  name="agency_id"
                  value={form.agency_id}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">-- Chọn cơ quan --</option>
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name_1}
                    </option>
                  ))}
                </select>
                {errorText("agency_id")}
              </div>
            )}
          </div>

          {form.role_id === "2" && (
            <div>
              <label className="block mb-1 font-medium">Phân quyền</label>
              <div className="grid grid-cols-2 gap-2 p-3 overflow-y-auto border rounded-lg">
                {permissionGroups.map((group, gi) => (
                  <div key={gi}>
                    <div className="mb-1 font-semibold text-blue-700">
                      {group.label}
                    </div>
                    {group.children.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 mb-1 text-sm"
                      >
                        <input
                          type="checkbox"
                          value={p.id}
                          checked={form.permission_ids.includes(
                            p.id.toString()
                          )}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const value = p.id.toString();
                            setForm((prev) => {
                              const current = prev.permission_ids;
                              return {
                                ...prev,
                                permission_ids: checked
                                  ? [...current, value]
                                  : current.filter((id) => id !== value),
                              };
                            });
                          }}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                ))}
                {errorText("permission_ids")}
              </div>
            </div>
          )}

          <div className="pt-4 text-right">
            {initialData && currentUserRole === RoleEnum.SUPER_ADMIN_ROOT && (
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2 font-semibold text-white transition bg-red-400 shadow bg-gradient-to-r hover:bg-red-500 rounded-lg mr-2"
                onClick={resetPassword}
              >
                Đặt lại mật khẩu
              </button>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 font-semibold text-white transition bg-blue-700 shadow bg-gradient-to-r hover:bg-blue-900 rounded-lg"
            >
              {initialData ? "Cập nhật" : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
