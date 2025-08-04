"use client";

import { usePopup } from "@/components/popup/PopupContext";
import { apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AddOrUpdateServiceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
  groupOptions: { id: number; name: string }[];
}

export default function AddOrUpdateServiceModal({
  onClose,
  onSuccess,
  initialData,
  groupOptions,
}: AddOrUpdateServiceModalProps) {
  const router = useRouter();
  const { popupMessage } = usePopup();
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    group_id: 0,
    range_start: 1,
    range_end: 100,
    status: true,
  });

  const closeWithFade = () => {
    setVisible(false);
    setTimeout(() => onClose(), 100); // onClose vẫn dùng được
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        group_id: initialData.group_id ?? 0,
        range_start: initialData.range_start ?? 0,
        range_end: initialData.range_end ?? 999999,
        status: initialData.status === 1,
      });
    }

    // Kích hoạt hiệu ứng hiện
    setTimeout(() => setVisible(true), 10);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "group_id" ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      group_id: form.group_id === 0 ? null : form.group_id,
      range_start: Number(form.range_start),
      range_end: Number(form.range_end),
      status: form.status ? 1 : 0,
    };

    const endpoint = initialData
      ? `/services/${initialData.id}/update`
      : "/services/create";

    const result = await apiPost(endpoint, payload);

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
      setErrors(result.data);
    } else {
      setErrors({});
    }
  };

  const inputClass =
    "w-full px-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-100 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative w-full max-w-xl p-8 bg-white border border-blue-200 shadow-2xl rounded-3xl ">
        <button
          onClick={closeWithFade}
          className="absolute text-2xl text-gray-400 top-4 right-4 hover:text-red-500"
        >
          ×
        </button>

        <h2 className="flex items-center gap-2 pb-3 mb-6 text-2xl font-bold text-blue-700 border-b">
          {initialData ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-sm text-gray-800"
        >
          {/* Tên dịch vụ */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Tên dịch vụ <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Nhóm dịch vụ */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Nhóm dịch vụ
            </label>
            <select
              name="group_id"
              value={form.group_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value={0}>Chưa phân nhóm</option>
              {groupOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {errors.group_id && (
              <p className="mt-1 text-sm text-red-400">{errors.group_id}</p>
            )}
          </div>

          {/* Khoảng số thứ tự */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Số bắt đầu <span className="text-red-400">*</span>
              </label>
              <input
                name="range_start"
                type="number"
                value={form.range_start}
                onChange={handleChange}
                className={inputClass}
                required
              />
              {errors.range_start && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.range_start}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Số kết thúc <span className="text-red-400">*</span>
              </label>
              <input
                name="range_end"
                type="number"
                value={form.range_end}
                onChange={handleChange}
                className={inputClass}
                required
              />
              {errors.range_end && (
                <p className="mt-1 text-sm text-red-400">{errors.range_end}</p>
              )}
            </div>
          </div>
          {errors._validateRange && (
            <p className="mt-1 text-sm text-red-400">{errors._validateRange}</p>
          )}
          {errors.message && (
            <p className="mt-1 text-sm text-red-400">{errors.message}</p>
          )}
          {/* Submit */}
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
