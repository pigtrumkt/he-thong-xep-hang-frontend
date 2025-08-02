"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { usePopup } from "@/components/popup/PopupContext";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmiting, setSubmiting] = useState(false);

  const { popupMessage, alertMessageRed, alertMessageGreen } = usePopup();

  const host =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : "";

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiGet("/accounts/me");

      if (![200, 400].includes(res.status)) {
        handleApiError(res, popupMessage, router);
        return;
      }

      if (res.status === 200 && res.data) {
        const u = res.data;
        setUser(u);
        setFullName(u.full_name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setGender(u.gender ?? null);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!user) return;

    setErrors({});
    setSubmiting(true);
    const res = await apiPost("/accounts/update-profile", {
      full_name: fullName,
      email,
      phone,
      gender,
    });

    setSubmiting(false);

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      alertMessageGreen("Đã cập nhật hồ sơ");
    } else if (res.status === 400) {
      alertMessageRed("Thông tin chưa hợp lệ, vui lòng kiểm tra lại");
      setErrors(res.data.message);
    } else {
      popupMessage({
        description: "Cập nhật thất bại",
      });
    }
  };

  if (loading) return <div className="p-10 text-gray-500">Đang tải...</div>;
  if (!user)
    return <div className="p-10 text-red-600">Không tìm thấy người dùng</div>;

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      <h1 className="text-xl font-bold text-blue-700 mb-6">Hồ sơ cá nhân</h1>

      <div className="flex flex-col md:flex-row items-start gap-10">
        {/* Avatar hiển thị bên trái */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={`${host}/accounts/avatar/${
              user.avatar_url
                ? user.avatar_url
                : gender === 0
                ? "avatar_default_female.png"
                : "avatar_default_male.png"
            }`}
            alt="Avatar"
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-300 shadow"
          />
          <p className="text-sm text-gray-500">Ảnh đại diện</p>
        </div>

        {/* Inputs thông tin bên phải */}
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
            <label className="text-sm text-gray-500">Vai trò</label>
            <input
              className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg outline-none"
              value={user.role_name || ""}
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
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-400">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500">Giới tính</label>
            <select
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={gender ?? ""}
              onChange={(e) => setGender(Number(e.target.value))}
            >
              <option value="1">Nam</option>
              <option value="0">Nữ</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-400">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500">Số điện thoại</label>
            <input
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          <div className="pt-4 text-right">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold transition disabled:opacity-50 cursor-pointer"
              disabled={isSubmiting}
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
