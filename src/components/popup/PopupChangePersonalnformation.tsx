"use client";

import { useState } from "react";

export default function PopupHoSoCaNhan({
  user,
  onClose,
  onSave,
}: {
  user: {
    username: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
  };
  onClose: () => void;
  onSave: (updated: FormData) => void;
}) {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const form = new FormData();
    form.append("full_name", fullName);
    form.append("email", email);
    form.append("phone", phone);
    if (avatarFile) form.append("avatar", avatarFile);
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-lg border border-blue-200 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-blue-700 mb-4">
          Hồ sơ cá nhân
        </h2>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={avatarPreview || "/avatar-default.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-300"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full cursor-pointer hover:bg-blue-600">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
            </label>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm text-gray-500">Tên đăng nhập</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg outline-none"
              value={user.username}
              readOnly
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Họ và tên</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Số điện thoại</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Vai trò</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg outline-none"
              value={user.role}
              readOnly
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Lưu thông tin
          </button>
        </div>
      </div>
    </div>
  );
}
