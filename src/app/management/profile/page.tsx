"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState({
    username: "nguyenvana",
    full_name: "Nguyễn Văn A",
    email: "a@example.com",
    phone: "0909123456",
    role: "Nhân viên",
    position: "", // Cán bộ tư pháp
    avatar: "",
  });

  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
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

    console.log("submit", form);

    setUser((prev) => ({
      ...prev,
      full_name: fullName,
      email,
      phone,
      avatar: avatarPreview,
    }));
    alert("Đã cập nhật hồ sơ!");
  };

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      <h1 className="text-xl font-bold text-blue-700 mb-6">Hồ sơ cá nhân</h1>

      <div className="flex flex-col md:flex-row items-start gap-10">
        {/* Avatar bên trái */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={avatarPreview || "/avatar-default.png"}
              alt="Avatar"
              className="w-36 h-36 rounded-full object-cover border-4 border-blue-300 shadow"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 shadow">
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
          <p className="text-sm text-gray-500">Ảnh đại diện</p>
        </div>

        {/* Inputs bên phải */}
        <div className="flex-1 w-full grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm text-gray-500">Tên đăng nhập</label>
            <input
              className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg outline-none"
              value={user.username}
              readOnly
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Họ và tên</label>
            <input
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Số điện thoại</label>
            <input
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Vai trò</label>
            <input
              className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg outline-none"
              value={user.role}
              readOnly
            />
          </div>

          {/* <div>
            <label className="text-sm text-gray-500">Chức danh</label>
            <input
              className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg outline-none"
              value={user.position}
              readOnly
            />
          </div> */}

          <div className="pt-4 text-right">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold transition"
            >
              Lưu thông tin
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
