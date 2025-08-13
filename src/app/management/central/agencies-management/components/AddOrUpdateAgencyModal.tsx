"use client";

import { usePopup } from "@/components/popup/PopupContext";
import { API_BASE, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AddOrUpdateAgencyModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export default function AddOrUpdateAgencyModal({
  onClose,
  onSuccess,
  initialData,
}: AddOrUpdateAgencyModalProps) {
  const router = useRouter();
  const { popupMessage } = usePopup();
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    logo_file: null as File | null,
    logo_preview: null as string | null,
    name_1: "",
    name_2: "",
    address: "",
    phone: "",
    email: "",
    screen_notice:
      "Vui lòng chuẩn bị giấy tờ khi đến lượt. Xin cảm ơn quý công dân đã hợp tác!",
    allow_online_ticket: true,
    min_time_between_ticket_online: 15,
    max_ticket_per_day_online: 20,
    allowed_days_of_week: ["1", "2", "3", "4", "5"] as string[],
    ticket_time_start: "08:00",
    ticket_time_end: "17:00",
  });

  const errorText = (field: string) => {
    if (errors[field]) {
      return <p className="mt-1 text-sm text-red-400">{errors[field]}</p>;
    }

    return "";
  };

  const closeWithFade = () => {
    setVisible(false);
    setTimeout(() => onClose(), 100); // onClose vẫn dùng được
  };

  useEffect(() => {
    if (initialData) {
      const [start, end] = initialData.ticket_time_range?.split("~") || [
        "",
        "",
      ];
      setForm({
        logo_file: null as File | null,
        logo_preview: initialData?.logo_url
          ? `${API_BASE}/agencies/logos/${initialData.logo_url}`
          : null,
        name_1: initialData.name_1 || "",
        name_2: initialData.name_2 || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        screen_notice: initialData.screen_notice || "",
        allow_online_ticket: initialData.allow_online_ticket === 1,
        min_time_between_ticket_online:
          initialData.min_time_between_ticket_online?.toString() || "",
        max_ticket_per_day_online:
          initialData.max_ticket_per_day_online?.toString() || "",
        allowed_days_of_week:
          initialData.allowed_days_of_week?.split(",") || [],
        ticket_time_start: start,
        ticket_time_end: end,
      });
    }

    // Kích hoạt hiệu ứng hiện
    setTimeout(() => setVisible(true), 10);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleWorkday = (day: string) => {
    setForm((prev) => {
      const exists = prev.allowed_days_of_week.includes(day);
      const updated = exists
        ? prev.allowed_days_of_week.filter((d) => d !== day)
        : [...prev.allowed_days_of_week, day];
      return { ...prev, allowed_days_of_week: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let ticket_time_range = `${form.ticket_time_start}~${form.ticket_time_end}`;
    if (ticket_time_range.length < 11) {
      ticket_time_range = ""; // ✅ Clear if invalid
    }

    const formData = new FormData();

    // Append tất cả field dạng text
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
      form.allow_online_ticket
        ? String(form.min_time_between_ticket_online || 0)
        : ""
    );
    formData.append(
      "max_ticket_per_day_online",
      form.allow_online_ticket
        ? String(form.max_ticket_per_day_online || 0)
        : ""
    );
    formData.append(
      "allowed_days_of_week",
      form.allowed_days_of_week.join(",")
    );
    formData.append("ticket_time_range", ticket_time_range);

    // ✅ Nếu có logo_file → đính kèm
    if (form.logo_file) {
      formData.append("logo_file", form.logo_file);
    }

    // ✅ Nếu user đã xoá ảnh (trường hợp update)
    if (initialData?.logo_url && !form.logo_preview && !form.logo_file) {
      formData.append("removeLogo", "true");
    }

    const endpoint = initialData
      ? `/agencies/${initialData.id}/update`
      : "/agencies/create";

    const result = await apiPost(endpoint, formData);

    if (![201, 400].includes(result.status)) {
      handleApiError(result, popupMessage, router);
      return;
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
      setErrors(result.data); // ✅ Set lỗi từ API
    } else {
      setErrors({}); // ✅ Clear lỗi nếu submit thành công
    }
  };

  const inputClass =
    "w-full px-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500";

  const weekdays = [
    { label: "Thứ 2", value: "1" },
    { label: "Thứ 3", value: "2" },
    { label: "Thứ 4", value: "3" },
    { label: "Thứ 5", value: "4" },
    { label: "Thứ 6", value: "5" },
    { label: "Thứ 7", value: "6" },
    { label: "Chủ nhật", value: "0" },
  ];

  return (
    <div
      className={`transition-opacity duration-100 fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${
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

        <h2 className="flex items-center gap-2 pb-3 mb-6 text-2xl font-bold text-blue-700 border-b">
          {initialData ? "Cập nhật cơ quan" : "Thêm cơ quan mới"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-sm text-gray-800"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            {/* Phần chọn ảnh */}
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
                  if (file.size > 2 * 1024 * 1024) {
                    popupMessage({
                      description: "Ảnh quá lớn, chọn ảnh dưới 2MB.",
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

              <div className="relative flex items-center justify-center h-32 overflow-hidden transition-all border border-gray-300 border-dashed rounded-lg bg-gray-50 hover:border-blue-400">
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
          {/* Tên + Địa chỉ */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Tên cơ quan <span className="text-red-400">*</span>
              </label>
              <input
                name="name_1"
                value={form.name_1}
                onChange={handleChange}
                className={inputClass}
                placeholder="Dòng 1"
              />
              {errorText("name_1")}
              <input
                name="name_2"
                value={form.name_2}
                onChange={handleChange}
                className={`${inputClass} mt-2`}
                placeholder="Dòng 2"
              />
              {errorText("name_2")}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Địa chỉ <span className="text-red-400">*</span>
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className={inputClass}
              />
              {errorText("address")}
            </div>
          </div>

          {/* SĐT + Email */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
              {errorText("phone")}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
              {errorText("email")}
            </div>
          </div>

          {/* Thông báo màn hình */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Thông báo chạy ở màn hình mỗi quầy
            </label>
            <textarea
              name="screen_notice"
              value={form.screen_notice}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
              rows={2}
            />
            {errorText("screen_notice")}
          </div>

          {/* Ngày làm việc */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Ngày có thể lấy số <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {weekdays.map((day) => (
                <label
                  key={day.value}
                  className="inline-flex items-center gap-2 text-sm text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={form.allowed_days_of_week.includes(day.value)}
                    onChange={() => toggleWorkday(day.value)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {day.label}
                </label>
              ))}
            </div>
            {errorText("allowed_days_of_week")}
          </div>

          {/* Khoảng giờ lấy số */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Thời gian có thể lấy số <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                step="60"
                name="ticket_time_start"
                value={form.ticket_time_start}
                onChange={handleChange}
                className={inputClass}
              />
              <input
                type="time"
                step="60"
                name="ticket_time_end"
                value={form.ticket_time_end}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            {errorText("ticket_time_range")}
          </div>

          {/* Cho phép lấy số online */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allow_online_ticket"
              checked={form.allow_online_ticket}
              onChange={(e) =>
                setForm({ ...form, allow_online_ticket: e.target.checked })
              }
              className="w-5 h-5 accent-blue-600"
            />
            <label
              htmlFor="allow_online_ticket"
              className="font-medium text-gray-700"
            >
              Cho phép lấy số online
            </label>
          </div>

          {/* Nếu bật online → nhập thêm 2 ô */}
          {form.allow_online_ticket && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Thời gian chờ giữa 2 lượt (phút)
                </label>
                <input
                  type="number"
                  name="min_time_between_ticket_online"
                  value={form.min_time_between_ticket_online}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Để trống hoặc 0 nếu không giới hạn"
                />
                {errorText("min_time_between_ticket_online")}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Giới hạn lượt/ngày
                </label>
                <input
                  type="number"
                  name="max_ticket_per_day_online"
                  value={form.max_ticket_per_day_online}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Để trống hoặc 0 nếu không giới hạn"
                />
                {errorText("max_ticket_per_day_online")}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 text-right">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 font-semibold text-white transition bg-blue-700 shadow bg-gradient-to-r hover:bg-blue-900 rounded-xl"
            >
              {initialData ? "Cập nhật" : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
