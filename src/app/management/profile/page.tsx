"use client";

import { useEffect, useState } from "react";
import { API_BASE, apiGet, apiPost } from "@/lib/api";
import { usePopup } from "@/components/popup/PopupContext";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import AvatarCropper from "@/components/avatar/AvatarCropper";
import { useGlobalParams } from "@/components/ClientWrapper";

function getRoleName(roleId: number): string {
  switch (roleId) {
    case 1:
      return "Super admin (root)";
    case 2:
      return "Super admin";
    case 11:
      return "Admin cơ quan (root)";
    case 12:
      return "Admin cơ quan";
    case 21:
      return "Nhân viên";
    case 31:
      return "Thiết bị";
    default:
      return "Không xác định";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { popupMessage, popupConfirmRed } = usePopup();

  const [user, setUser] = useState<any>(null);

  const { globalParams, setGlobalParams } = useGlobalParams();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmiting, setSubmiting] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

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
    };
    fetchData();
  }, [popupMessage, router]);

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
      popupMessage({ description: "Đã cập nhật hồ sơ" });

      const globalParamsTemp = { ...globalParams };
      globalParamsTemp.user.full_name = fullName;
      setGlobalParams(globalParamsTemp);
    } else if (res.status === 400) {
      setErrors(res.data);
    } else {
      popupMessage({ description: "Cập nhật thất bại" });
    }
  };

  const handleCropDone = async (blob: Blob) => {
    const ext = blob.type.split("/")[1] || "png";
    const filename = `avatar.${ext}`;

    const form = new FormData();
    form.append("avatar", blob, filename);

    const res = await fetch(API_BASE + "/accounts/update-avatar", {
      method: "POST",
      body: form,
      credentials: "include",
    });

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    setCropImageUrl(null);

    if (res.ok) {
      const refreshed = await apiGet("/accounts/me");
      setUser(refreshed.data);

      const globalParamsTemp = { ...globalParams };
      globalParamsTemp.user.avatar_url = refreshed.data.avatar_url;
      setGlobalParams(globalParamsTemp);
    } else {
      popupMessage({ description: "Upload ảnh thất bại" });
    }
  };

  const handleRemoveAvatar = async () => {
    const res = await apiPost("/accounts/update-avatar", {
      removeAvatar: true,
    });

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      const refreshed = await apiGet("/accounts/me");
      setUser(refreshed.data);

      const globalParamsTemp = { ...globalParams };
      globalParamsTemp.user.avatar_url = "";
      setGlobalParams(globalParamsTemp);
    } else {
      popupMessage({ description: "Xoá ảnh thất bại" });
    }
  };

  if (!user) return <></>;

  return (
    <section className="max-w-5xl mx-auto my-6">
      <div className="p-8 mx-4 bg-white border border-blue-200 shadow-xl rounded-3xl">
        <div className="flex flex-col items-center mb-8">
          <img
            src={`${API_BASE}/accounts/avatar/${
              user.avatar_url
                ? `${user.avatar_url}?v=${Date.now()}`
                : gender === 0
                ? "avatar_default_female.png"
                : "avatar_default_male.png"
            }`}
            alt="Avatar"
            className="object-cover w-32 h-32 mb-3 border-2 border-blue-300 shadow-md cursor-pointer"
            onClick={() => setShowAvatarPreview(true)}
          />
          <div className="flex gap-2">
            <label className="text-sm text-blue-600 underline cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
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

                  const reader = new FileReader();
                  reader.onload = () => {
                    setCropImageUrl(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              Đổi ảnh
            </label>

            {user.avatar_url && (
              <button
                onClick={async () => {
                  const confirmed = await popupConfirmRed({
                    description: "Xác nhận xóa ảnh đại diện?",
                  });

                  if (!confirmed) return;
                  handleRemoveAvatar();
                }}
                className="text-sm text-red-600 underline"
              >
                Xoá ảnh
              </button>
            )}
          </div>

          {cropImageUrl && (
            <AvatarCropper
              imageUrl={cropImageUrl}
              onCancel={() => setCropImageUrl(null)}
              onCropDone={handleCropDone}
            />
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="grid grid-cols-1 gap-6 text-sm text-gray-800 md:grid-cols-2"
        >
          {/* Tên đăng nhập */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Tên đăng nhập
            </label>
            <input
              disabled={true}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-700 disabled:bg-gray-100"
              value={user.username}
            />
          </div>

          {/* Vai trò */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Vai trò
            </label>
            <input
              disabled={true}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-slate-700 disabled:bg-gray-100"
              value={getRoleName(user.role_id)}
            />
          </div>

          {/* Chức danh */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Chức danh
            </label>
            <input
              disabled={true}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-slate-700 disabled:bg-gray-100"
              value={user.position}
            />
          </div>

          {/* Cơ quan */}
          {![1, 2].includes(user.role_id) && (
            <div>
              <label className="block mb-1 font-medium text-gray-600">
                Cơ quan
              </label>
              <input
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-slate-700 disabled:bg-gray-100"
                value={user.agency_name}
              />
            </div>
          )}

          {/* Họ và tên */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Họ và tên <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full px-4 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-400">{errors.full_name}</p>
            )}
          </div>

          {/* Giới tính */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Giới tính <span className="text-red-400">*</span>
            </label>
            <select
              className="w-full px-4 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Số điện thoại
            </label>
            <input
              className="w-full px-4 py-2 transition-colors bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Nút cập nhật */}
          <div className="pt-4 text-right md:col-span-2">
            <button
              type="submit"
              disabled={isSubmiting}
              className="px-6 py-2 font-semibold text-white transition bg-blue-700 shadow bg-gradient-to-r hover:bg-blue-900 rounded-xl disabled:opacity-50"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
      {showAvatarPreview && (
        <div
          onClick={() => setShowAvatarPreview(false)}
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center"
        >
          <img
            src={`${API_BASE}/accounts/avatar/${
              user.avatar_url
                ? `${user.avatar_url}?v=${Date.now()}`
                : gender === 0
                ? "avatar_default_female.png"
                : "avatar_default_male.png"
            }`}
            alt="Avatar full"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl bg-white"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAvatarPreview(false);
            }}
            className="absolute text-3xl font-bold text-white top-4 right-6 hover:text-red-400"
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}
