"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import { usePopup } from "@/components/popup/PopupContext";
import { handleApiError } from "@/lib/handleApiError";
import { useGlobalParams } from "@/components/ClientWrapper";

interface AddOrUpdateAccountModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
  groupedActiveServices: any[];
}

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

export default function AddOrUpdateAccountModal({
  onClose,
  onSuccess,
  initialData,
  groupedActiveServices,
}: AddOrUpdateAccountModalProps) {
  const { globalParams } = useGlobalParams();
  const currentUserRole = globalParams?.user?.role_id;

  const allowedRoles =
    currentUserRole === 11
      ? [
          { id: 11, label: "Admin" },
          { id: 12, label: "Quản lý" },
          { id: 21, label: "Nhân viên" },
          { id: 31, label: "Thiết bị" },
        ]
      : currentUserRole === 12
      ? [
          { id: 21, label: "Nhân viên" },
          { id: 31, label: "Thiết bị" },
        ]
      : currentUserRole === 21
      ? [
          { id: 21, label: "Nhân viên" },
          { id: 31, label: "Thiết bị" },
        ]
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
    permission_ids: [] as string[],
    assigned_service_ids: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const errorText = (field: string) => {
    if (errors[field]) {
      return <p className="mt-1 text-sm text-red-400">{errors[field]}</p>;
    }
    return "";
  };

  const currentUserPermissions = globalParams?.user?.permission_ids
    ? globalParams.user.permission_ids.split(",")
    : [];

  const closeWithFade = () => {
    setVisible(false);
    setTimeout(() => onClose(), 100);
  };

  useEffect(() => {
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
        permission_ids: initialData.permission_ids
          ? initialData.permission_ids.split(",")
          : [],
        assigned_service_ids: initialData.assigned_service_ids
          ? initialData.assigned_service_ids.split(",")
          : [],
      });
    }

    setTimeout(() => setVisible(true), 10);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangeRole = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const roleId = e.target.value;

    let defaultPermissions: string[] = [];

    if (roleId === "12") {
      defaultPermissions = permissionGroups
        .flatMap((g) => g.children)
        .map((p) => p.id.toString());
    } else if (roleId === "21") {
      defaultPermissions = ["130", "140", "150"];
    } else {
      defaultPermissions = [];
    }

    // Nếu người tạo không phải là admin root thì lọc lại theo quyền họ đang có
    if ([12, 21].includes(currentUserRole)) {
      defaultPermissions = defaultPermissions.filter((p) =>
        currentUserPermissions.includes(p)
      );
    }

    setForm((prev) => ({
      ...prev,
      permission_ids: defaultPermissions,
    }));
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
      permission_ids: form.permission_ids?.join(",") || "",
      assigned_service_ids: form.assigned_service_ids.join(","),
    };

    const endpoint = initialData
      ? `/accounts/${initialData.id}/updateAgency`
      : "/accounts/createAgency";

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
                onChange={(e) => {
                  handleChange(e);
                  handleChangeRole(e);
                }}
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
          </div>

          {[12, 21].includes(Number(form.role_id)) && (
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
                          disabled={
                            [12, 21].includes(currentUserRole) &&
                            !currentUserPermissions.includes(p.id.toString())
                          }
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

          {Number(form.role_id) === 21 && groupedActiveServices.length > 0 && (
            <div>
              <label className="block mb-1 font-medium">
                Dịch vụ được hỗ trợ
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 overflow-y-auto border rounded-lg max-h-64">
                {groupedActiveServices.map((group) => (
                  <div key={group.id}>
                    <div className="mb-1 font-semibold text-blue-700">
                      {group.name}
                    </div>
                    {group.services.map((s: any) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 mb-1 text-sm"
                      >
                        <input
                          type="checkbox"
                          value={s.id}
                          checked={form.assigned_service_ids.includes(
                            s.id.toString()
                          )}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const value = s.id.toString();
                            setForm((prev) => ({
                              ...prev,
                              assigned_service_ids: checked
                                ? [...prev.assigned_service_ids, value]
                                : prev.assigned_service_ids.filter(
                                    (id) => id !== value
                                  ),
                            }));
                          }}
                        />
                        {s.name}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              {errorText("assigned_service_ids")}
            </div>
          )}

          {errorText("message")}
          <div className="pt-4 text-right">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 font-semibold text-white transition shadow rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              {initialData ? "Cập nhật" : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
