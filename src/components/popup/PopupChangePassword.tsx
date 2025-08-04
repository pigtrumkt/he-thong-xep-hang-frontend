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
    }, 100); // thời gian khớp animation
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center transition-all duration-100 ${
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
          className="absolute text-xl text-gray-400 cursor-pointer top-2 right-3 hover:text-red-500"
        >
          ×
        </button>
        <h2 className="mb-4 text-xl font-bold text-center text-blue-700">
          Đổi mật khẩu
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Mật khẩu cũ
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={oldPassword}
              style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Mật khẩu mới
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={newPassword}
              style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
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
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-600 disabled:opacity-50"
            disabled={disableSubmit}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
