"use client";

import { useEffect, useState } from "react";
import feather from "feather-icons";
import { API_BASE, apiGet, apiPost } from "@/lib/api";
import { usePopup } from "@/components/popup/PopupContext";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import { useGlobalParams } from "@/components/ClientWrapper";
import { PermissionEnum, RoleEnum } from "@/constants/Enum";

interface AgencyForm {
  id: number;
  logo_file: null | File;
  logo_preview: null | string;
  name_1: string;
  name_2: string;
  address: string;
  phone: string;
  email: string;
  screen_notice: string;
  allowed_days_of_week: string[];
  ticket_time_start: string;
  ticket_time_end: string;
  allow_online_ticket: boolean;
  min_time_between_ticket_online: number;
  max_ticket_per_day_online: number;
}

export default function AgencySettingsPage() {
  const router = useRouter();
  const { hasAccess } = useGlobalParams();
  const [form, setForm] = useState<AgencyForm>({
    id: 0,
    logo_file: null,
    logo_preview: null,
    name_1: "",
    name_2: "",
    address: "",
    phone: "",
    email: "",
    screen_notice: "",
    allowed_days_of_week: [],
    ticket_time_start: "08:00",
    ticket_time_end: "17:00",
    allow_online_ticket: true,
    min_time_between_ticket_online: 0,
    max_ticket_per_day_online: 0,
  });

  const [isActiveLocal, setIsActiveLocal] = useState(true);
  const { popupMessage, popupConfirmRed } = usePopup();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const errorText = (field: string) => {
    if (errors[field]) {
      return <p className="mt-1 text-[1rem] text-red-400">{errors[field]}</p>;
    }

    return "";
  };

  useEffect(() => {
    fetchAgencyData();
  }, []);

  useEffect(() => {
    feather.replace();
  }, []);

  const fetchAgencyData = async () => {
    const res = await apiGet("/agencies/getMyAgency");
    if (res.status === 200) {
      const agency = res.data;
      const [start, end] = agency.ticket_time_range?.split("~") || ["", ""];
      setForm({
        id: agency.id,
        logo_file: null,
        logo_preview: agency?.logo_url
          ? `${API_BASE}/agencies/logos/${agency.logo_url}`
          : null,
        name_1: agency.name_1 || "",
        name_2: agency.name_2 || "",
        address: agency.address || "",
        phone: agency.phone || "",
        email: agency.email || "",
        screen_notice: agency.screen_notice || "",
        allowed_days_of_week: agency.allowed_days_of_week?.split(",") || [],
        ticket_time_start: start || "08:00",
        ticket_time_end: end || "17:00",
        allow_online_ticket: agency.allow_online_ticket === 1,
        min_time_between_ticket_online:
          agency.min_time_between_ticket_online || 0,
        max_ticket_per_day_online: agency.max_ticket_per_day_online || 0,
      });
      setIsActiveLocal(agency.status_local === 1);
    } else {
      popupMessage({ description: "Không thể tải thông tin cơ quan" });
    }
  };

  const handleCheckboxChange = (day: string) => {
    setForm((prev) => {
      const exists = prev.allowed_days_of_week.includes(day);
      return {
        ...prev,
        allowed_days_of_week: exists
          ? prev.allowed_days_of_week.filter((d) => d !== day)
          : [...prev.allowed_days_of_week, day],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name_1", form.name_1.trim());
    formData.append("name_2", form.name_2.trim());
    formData.append("address", form.address.trim());
    formData.append("phone", form.phone.trim());
    formData.append("email", form.email?.trim() || "");
    formData.append("screen_notice", form.screen_notice?.trim() || "");
    formData.append(
      "allow_online_ticket",
      form.allow_online_ticket ? "1" : "0"
    );
    formData.append(
      "min_time_between_ticket_online",
      String(form.min_time_between_ticket_online)
    );
    formData.append(
      "max_ticket_per_day_online",
      String(form.max_ticket_per_day_online)
    );
    formData.append(
      "allowed_days_of_week",
      form.allowed_days_of_week.join(",")
    );
    formData.append(
      "ticket_time_range",
      `${form.ticket_time_start}~${form.ticket_time_end}`
    );

    // Có file mới → gửi file
    if (form.logo_file) {
      formData.append("logo_file", form.logo_file);
    }

    // User xoá ảnh (không còn preview và cũng không chọn file mới) → báo server xoá
    if (!form.logo_preview && !form.logo_file) {
      formData.append("removeLogo", "true");
    }

    const res = await apiPost(`/agencies/${form.id}/update`, formData);

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      setErrors({});
      popupMessage({ description: "Lưu cài đặt thành công" });
    } else if (res.status === 400 && typeof res.data === "object") {
      setErrors(res.data);
    } else {
      popupMessage({
        title: "Cập nhật trạng thái thất bại",
        description: "Mạng không ổn định hoặc máy chủ không phản hồi.",
      });
    }
  };

  const handleToggleStatusLocal = async () => {
    const newStatus = isActiveLocal ? 0 : 1;

    const confirmed = await popupConfirmRed({
      title: isActiveLocal
        ? "Xác nhận tạm dừng hoạt động?"
        : "Xác nhận tiếp tục hoạt động?",
      description: isActiveLocal
        ? "Sau khi tạm dừng, hệ thống sẽ ngừng lấy số và ngừng phục vụ."
        : "Cơ quan sẽ được hoạt động trở lại.",
    });

    if (!confirmed) return;

    const res = await apiPost("/agencies/updateStatusLocal", {
      status: newStatus,
    });

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      setIsActiveLocal(!!newStatus);
    } else {
      popupMessage({
        title: "Cập nhật thất bại",
        description: "Không thể cập nhật trạng thái hoạt động.",
      });
    }
  };

  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dayValues = ["1", "2", "3", "4", "5", "6", "0"];

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 lg:min-w-[55rem]">
      <form className="p-8 space-y-8" onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-2">
          <FormCard title="Thông tin cơ bản" icon="info">
            {/* Logo cơ quan */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <label className="cursor-pointer group">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      popupMessage({
                        description: "Vui lòng chọn tệp hình ảnh.",
                      });
                      return;
                    }
                    if (file.size > 4 * 1024 * 1024) {
                      popupMessage({
                        description: "Ảnh quá lớn, chọn ảnh dưới 4MB.",
                      });
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      logo_file: file,
                      logo_preview: URL.createObjectURL(file),
                    }));
                  }}
                />

                <div className="relative flex items-center justify-center w-32 h-32 overflow-hidden transition-all border border-gray-300 border-dashed rounded-lg bg-gray-50 hover:border-blue-400">
                  <img
                    src={form.logo_preview || "/img/default_image.webp"}
                    alt="Logo cơ quan"
                    className={`object-contain max-w-full max-h-full ${
                      form.logo_preview ? "" : "opacity-20"
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white transition-opacity opacity-0 bg-black/20 group-hover:opacity-100">
                    Nhấn để chọn logo
                  </div>
                </div>
              </label>

              {/* Nút xoá ảnh */}
              {form.logo_preview && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      logo_file: null,
                      logo_preview: null,
                    }))
                  }
                  className="px-3 py-1 text-sm font-medium text-red-600 transition border border-red-300 rounded-md hover:bg-red-100"
                >
                  Xóa ảnh
                </button>
              )}
            </div>
            {/* Tên cơ quan */}
            <div>
              <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
                <i data-feather="home" className="w-4 h-4 text-slate-500" />
                Tên trụ sở <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name_1}
                required={true}
                onChange={(e) => setForm({ ...form, name_1: e.target.value })}
                placeholder="Dòng 1"
                className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors outline-none bg-white`}
              />
              {errorText("name_1")}
              <input
                type="text"
                value={form.name_2}
                onChange={(e) => setForm({ ...form, name_2: e.target.value })}
                placeholder="Dòng 2"
                className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors outline-none mt-2 bg-white`}
              />
              {errorText("name_2")}
            </div>
            <FormInput
              label="Địa chỉ"
              icon="map-pin"
              value={form.address}
              require={true}
              errorText={errorText("address")}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <FormInput
              label="Số điện thoại"
              icon="phone"
              value={form.phone}
              require={true}
              type="tel"
              errorText={errorText("phone")}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <FormInput
              label="Email"
              icon="mail"
              value={form.email}
              type="email"
              errorText={errorText("email")}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormCard>

          <FormCard title="Thông báo" icon="monitor">
            <FormTextarea
              label="Thông báo chạy ở màn hình mỗi quầy"
              icon="message-square"
              value={form.screen_notice}
              errorText={errorText("screen_notice")}
              onChange={(e) =>
                setForm({ ...form, screen_notice: e.target.value })
              }
            />
          </FormCard>

          <FormCard title="Cấu hình thời gian" icon="calendar">
            <div className="mb-8">
              <label className="flex items-center gap-2 mb-3 font-medium text-slate-700">
                <i data-feather="calendar" className="w-4 h-4 text-slate-500" />
                Những ngày được lấy số <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-7 gap-2">
                {dayLabels.map((label, idx) => {
                  const val = dayValues[idx];
                  const checked = form.allowed_days_of_week.includes(val);
                  return (
                    <label
                      key={label}
                      className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange(val)}
                        className="mb-1 accent-blue-500"
                      />
                      <span className="font-medium text-slate-600">
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errorText("allowed_days_of_week")}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-3 font-medium text-slate-700">
                <i data-feather="clock" className="w-4 h-4 text-slate-500" />
                Khoảng thời gian lấy số <span className="text-red-400">*</span>
              </label>
              <div className="flex items-end gap-4">
                <div>
                  <label className="block mb-1 text-sm text-slate-500">
                    Từ
                  </label>
                  <input
                    type="time"
                    value={form.ticket_time_start}
                    step="60"
                    required
                    onChange={(e) =>
                      setForm({ ...form, ticket_time_start: e.target.value })
                    }
                    className="w-40 px-3 py-2 bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <span className="mb-2">~</span>
                <div>
                  <label className="block mb-1 text-sm text-slate-500">
                    Đến
                  </label>
                  <input
                    type="time"
                    value={form.ticket_time_end}
                    step="60"
                    required
                    onChange={(e) =>
                      setForm({ ...form, ticket_time_end: e.target.value })
                    }
                    className="w-40 px-3 py-2 bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              {errorText("ticket_time_range")}
            </div>
          </FormCard>

          <FormCard title="Cấu hình lấy số online" icon="smartphone">
            <div className="flex items-center justify-between p-4 mb-4 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <i
                  data-feather="smartphone"
                  className="w-5 h-5 text-blue-500"
                />
                <span className="font-medium text-slate-700">
                  Cho phép lấy số online
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allow_online_ticket}
                  onChange={(e) =>
                    setForm({ ...form, allow_online_ticket: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="h-6 transition duration-300 bg-gray-200 rounded-full w-11 peer-checked:bg-blue-600" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-5" />
              </label>
            </div>
            <FormInput
              label="Thời gian chờ giữa 2 lần lấy số (phút)"
              icon="clock"
              type="number"
              value={form.min_time_between_ticket_online.toString()}
              errorText={errorText("min_time_between_ticket_online")}
              onChange={(e) =>
                setForm({
                  ...form,
                  min_time_between_ticket_online: Number(e.target.value),
                })
              }
            />
            <FormInput
              label="Giới hạn số lần lấy số trong ngày"
              icon="users"
              type="number"
              value={form.max_ticket_per_day_online.toString()}
              errorText={errorText("max_ticket_per_day_online")}
              onChange={(e) =>
                setForm({
                  ...form,
                  max_ticket_per_day_online: Number(e.target.value),
                })
              }
            />
            <FormInput
              label="Link lấy số online"
              icon="link"
              value={
                typeof window !== "undefined"
                  ? `${window.location.protocol}//${window.location.host}/take-number/${form.id}`
                  : ""
              }
              readOnly
            />
          </FormCard>
        </div>

        {hasAccess({
          allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
          allowedPermissions: [PermissionEnum.SETTINGS_UPDATE],
        }) && (
          <div className="flex flex-col justify-end gap-6 pt-6 border-t sm:flex-row border-slate-300">
            <button
              type="button"
              onClick={handleToggleStatusLocal}
              className={`px-6 py-3 font-semibold rounded-lg shadow-sm transition-colors  ${
                isActiveLocal
                  ? "bg-red-400 text-white hover:bg-red-500"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              {isActiveLocal ? "Tạm dừng hoạt động" : "Tiếp tục hoạt động"}
            </button>
            <button
              type="submit"
              className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
            >
              Lưu cài đặt
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function FormCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 border bg-slate-50 rounded-xl border-slate-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500 rounded-lg">
          <i data-feather={icon} className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-[1.5rem] font-medium text-slate-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormInput({
  label,
  value,
  icon,
  type = "text",
  require = false,
  readOnly = false,
  errorText,
  onChange,
}: {
  label: string;
  value: string;
  icon: string;
  type?: string;
  require?: boolean;
  readOnly?: boolean;
  errorText?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
        <i data-feather={icon} className="w-4 h-4 text-slate-500" />
        {label}
        {require && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={require}
        readOnly={readOnly}
        onChange={onChange}
        className={`w-full px-4 py-3 ${
          readOnly ? "bg-gray-50" : "bg-white"
        } border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors outline-none`}
      />
      {errorText}
    </div>
  );
}

function FormTextarea({
  label,
  value,
  icon,
  readOnly = false,
  errorText,
  onChange,
}: {
  label: string;
  value: string;
  icon: string;
  readOnly?: boolean;
  errorText?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
        <i data-feather={icon} className="w-4 h-4 text-slate-500" />
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        className="w-full px-4 py-3 transition-colors bg-white border rounded-lg outline-none resize-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
      {errorText}
    </div>
  );
}
