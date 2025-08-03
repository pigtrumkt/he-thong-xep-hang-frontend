"use client";

import { useEffect, useState } from "react";

interface AddAgencyModalProps {
  onClose: () => void;
  onSubmit: (formData: any) => void;
  initialData?: any;
}

export default function AddAgencyModal({
  onClose,
  onSubmit,
  initialData,
}: AddAgencyModalProps) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    screen_notice: "",
    allow_online_ticket: true,
    min_time_between_ticket_online: "",
    max_ticket_per_day_online: "",
    allowed_days_of_week: [] as string[],
    ticket_time_start: "",
    ticket_time_end: "",
  });

  useEffect(() => {
    if (initialData) {
      const [start, end] = initialData.ticket_time_range?.split("~") || [
        "",
        "",
      ];
      setForm({
        name: initialData.name || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        screen_notice: initialData.screen_notice || "",
        allow_online_ticket: initialData.allow_online_ticket === "1",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
      alert("Vui lòng nhập đầy đủ tên, địa chỉ và số điện thoại.");
      return;
    }

    if (!form.ticket_time_start || !form.ticket_time_end) {
      alert("Vui lòng chọn khoảng giờ lấy số.");
      return;
    }

    const ticket_time_range = `${form.ticket_time_start}~${form.ticket_time_end}`;

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || "",
      screen_notice: form.screen_notice?.trim() || "",
      allow_online_ticket: form.allow_online_ticket ? "1" : "0",
      min_time_between_ticket_online: form.allow_online_ticket
        ? Number(form.min_time_between_ticket_online || 0)
        : undefined,
      max_ticket_per_day_online: form.allow_online_ticket
        ? Number(form.max_ticket_per_day_online || 0)
        : undefined,
      allowed_days_of_week: form.allowed_days_of_week.join(","),
      ticket_time_range,
    };

    onSubmit(payload);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl p-8 bg-white border border-blue-200 shadow-2xl rounded-3xl">
        <button
          onClick={onClose}
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
          {/* Tên + Địa chỉ */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Tên cơ quan *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Địa chỉ *
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* SĐT + Email */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Số điện thoại *
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
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
            </div>
          </div>

          {/* Thông báo màn hình */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Thông báo ở màn hình
            </label>
            <textarea
              name="screen_notice"
              value={form.screen_notice}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
              rows={2}
            />
          </div>

          {/* Ngày làm việc */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Ngày làm việc
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
          </div>

          {/* Khoảng giờ lấy số */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Khoảng giờ lấy số *
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
                />
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
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 text-right">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 font-semibold text-white transition shadow rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              {initialData ? "💾 Cập nhật" : "💾 Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
