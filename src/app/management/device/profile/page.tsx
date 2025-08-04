"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<number | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const host =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : "";

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiGet("/accounts/me");
      if (res.status === 200 && res.data) {
        const u = res.data;
        setUser(u);
        setFullName(u.full_name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setGender(u.gender ?? null);
        setAvatarPreview(u.avatar || "");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    const form = new FormData();
    form.append("full_name", fullName);
    form.append("email", email);
    form.append("phone", phone);
    form.append("gender", String(gender ?? ""));
    if (avatarFile) form.append("avatar", avatarFile);

    const res = await fetch("/accounts/update-profile", {
      method: "POST",
      credentials: "include",
      body: form,
    });

    if (res.ok) {
      alert("Đã cập nhật hồ sơ!");
    } else {
      alert("Cập nhật thất bại");
    }
  };

  if (loading) return <div className="p-10 text-gray-500">Đang tải...</div>;
  if (!user)
    return <div className="p-10 text-red-600">Không tìm thấy người dùng</div>;

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      <h1 className="mb-6 text-xl font-bold text-blue-700">Hồ sơ cá nhân</h1>

      <div className="flex flex-col items-start gap-10 md:flex-row">
        {/* Avatar bên trái */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={
                avatarPreview ||
                `${host}/accounts/avatar/${
                  user.avatar
                    ? user.avatar
                    : gender === 0
                    ? "avatar_default_female.png"
                    : "avatar_default_male.png"
                }`
              }
              alt="Avatar"
              className="object-cover border-4 border-blue-300 rounded-full shadow w-36 h-36"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full shadow cursor-pointer hover:bg-blue-600">
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
        <div className="grid flex-1 w-full grid-cols-1 gap-4">
          <div>
            <label className="text-sm text-gray-500">Tên đăng nhập</label>
            <input
              className="w-full px-4 py-2 mt-1 bg-gray-100 border border-gray-300 rounded-lg outline-none"
              value={user.username}
              readOnly
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Vai trò</label>
            <input
              className="w-full px-4 py-2 mt-1 bg-gray-100 border border-gray-300 rounded-lg outline-none"
              value={user.role_name || ""}
              readOnly
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Họ và tên</label>
            <input
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Giới tính</label>
            <select
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg outline-none"
              value={gender ?? ""}
              onChange={(e) => setGender(Number(e.target.value))}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="1">Nam</option>
              <option value="0">Nữ</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Số điện thoại</label>
            <input
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="pt-4 text-right">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              Lưu thông tin
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
