"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import { usePopup } from "@/components/popup/PopupContext";
import { handleApiError } from "@/lib/handleApiError";

interface AddOrUpdateCounterModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export default function AddOrUpdateCounterModal({
  onClose,
  onSuccess,
  initialData,
}: AddOrUpdateCounterModalProps) {
  const router = useRouter();
  const { popupMessage } = usePopup();
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    status: true,
  });

  const closeWithFade = () => {
    setVisible(false);
    setTimeout(() => onClose(), 100);
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        status: initialData.status === 1,
      });
    }
    setTimeout(() => setVisible(true), 10);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      status: form.status ? 1 : 0,
    };

    const endpoint = initialData
      ? `/counters/${initialData.id}/update`
      : "/counters/create";

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
    } else if (result?.status === 400 && typeof result.data === "object") {
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
      <div className="relative w-full max-w-xl p-8 bg-white border border-blue-200 shadow-2xl rounded-3xl">
        <button
          onClick={closeWithFade}
          className="absolute text-2xl text-gray-400 top-4 right-4 hover:text-red-500"
        >
          ×
        </button>

        <h2 className="flex items-center gap-2 pb-3 mb-6 text-2xl font-bold text-blue-700 border-b">
          {initialData ? "Cập nhật quầy" : "Thêm quầy mới"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-sm text-gray-800"
        >
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Tên quầy <span className="text-red-400">*</span>
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
