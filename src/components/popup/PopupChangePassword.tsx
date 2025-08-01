"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { usePopup } from "./PopupContext";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";

export default function PopupChangePassword({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { alertMessageGreen, popupMessage } = usePopup();
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới không khớp");
      return;
    }

    setDisableSubmit(true);
    const res = await apiPost("/accounts/change-password", {
      oldPassword,
      newPassword,
    });
    setDisableSubmit(false);

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      alertMessageGreen("Đổi mật khẩu thành công");
      handleClose();
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } else {
      setErrorMessage(String(Object.values(res.data)[0]) || "Có lỗi xảy ra");
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 200); // thời gian khớp animation
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative `}
      >
        <button
          onClick={() => {
            handleClose();
          }}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl cursor-pointer"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">
          Đổi mật khẩu
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mật khẩu cũ
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              value={oldPassword}
              style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              value={newPassword}
              style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              value={confirmPassword}
              style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <p className="text-center text-red-400">{errorMessage}</p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer disabled:opacity-50"
            disabled={disableSubmit}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
