"use client";

import { useEffect, useRef, useState } from "react";

const mockServices = [
  "Cấp CCCD/CMND",
  "Khai sinh",
  "Đăng ký hôn nhân",
  "Giấy phép lái xe",
  "Gia hạn hộ chiếu",
  "Sổ đỏ/Sổ hồng",
  "Chứng thực văn bản",
  "Tạm trú/Tạm vắng",
  "Xác nhận độc thân",
  "Chuyển hộ khẩu",
  "Thẻ BHYT",
  "Giấy tờ dân sự",
  "Giấy tờ dân sự",
  "Giấy tờ dân sự",
  "Giấy tờ dân sự",
];

export default function TakeNumberPage() {
  const [selectedService, setSelectedService] = useState("");
  const [queueNumber, setQueueNumber] = useState("1001");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    let time = 10;
    setCountdown(time);

    countdownInterval.current = setInterval(() => {
      time--;
      setCountdown(time);
      if (time <= 0 && countdownInterval.current) {
        clearInterval(countdownInterval.current);
        setShowSuccessModal(false);
      }
    }, 1000);
  };

  const handleServiceClick = (name: string) => {
    setSelectedService(name);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    setQueueNumber("1001"); // bạn có thể thay bằng call API lấy số
    setShowSuccessModal(true);
    startCountdown();
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="w-full max-w-[100rem] pt-8 px-8 mt-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10 ml-7">
          <img
            src="/img/vn-circle.png"
            alt="Avatar"
            className="w-24 h-24 bg-white border-4 border-white rounded-full shadow-lg"
          />
          <div>
            <h1 className="mb-2 text-6xl font-extrabold tracking-wide text-blue-600 rounded-3xl drop-shadow-sm">
              LẤY SỐ THỨ TỰ
            </h1>
            <div className="text-gray-700 text-[1.9rem] font-semibold">
              Chào bạn, chọn dịch vụ bạn cần nhé!
            </div>
          </div>
        </div>

        {/* Danh sách dịch vụ */}
        <div className="custom-scroll overflow-y-auto max-h-[calc(100vh-15rem)] p-8 flex-1">
          <div className="grid grid-cols-1 gap-8 pr-4 md:grid-cols-2">
            {mockServices.map((service) => (
              <button
                key={service}
                onClick={() => handleServiceClick(service)}
                className="py-10 text-3xl font-bold text-blue-600 transition-all bg-white rounded-3xl drop-shadow-md active:scale-98 active:drop-shadow-sm active:bg-blue-50"
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal xác nhận */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay active bg-black/50 backdrop-blur">
          <div className="modal-content bg-white rounded-3xl p-12 max-w-[90%] text-center shadow-xl">
            <h2 className="mb-8 text-4xl font-bold text-blue-900">
              XÁC NHẬN DỊCH VỤ
            </h2>
            <div className="p-6 mb-8 text-3xl font-bold text-blue-600 border border-blue-200 bg-blue-50 rounded-2xl">
              {selectedService}
            </div>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-10 py-4 text-2xl text-white bg-gray-500 hover:bg-gray-600 rounded-2xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirm}
                className="px-10 py-4 text-2xl text-white bg-blue-500 hover:bg-blue-600 rounded-2xl"
              >
                Lấy số
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thành công */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay active bg-black/50 backdrop-blur">
          <div className="modal-content bg-white rounded-3xl p-12 max-w-[90%] text-center shadow-xl">
            <h2 className="mb-8 text-4xl font-black text-blue-900">
              PHIẾU CỦA BẠN
            </h2>
            <div className="p-8 mb-4 text-blue-600 border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl">
              <p className="text-[2rem] font-bold text-blue-800 uppercase">
                UBND xã Tân Quang
              </p>
              <p className="text-[1.5rem] text-blue-600 mt-1">
                Địa chỉ: Tỉnh Tuyên Quang
              </p>
              <p className="text-[1.5rem] text-blue-600">
                Điện thoại: 0982984984
              </p>
              <div className="mt-4 mb-6 border-t border-blue-300 border-dashed"></div>
              <p className="text-[2.5rem] font-bold text-blue-600">
                {selectedService}
              </p>
              <div className="text-[8rem] font-black text-blue-600 mb-8">
                {queueNumber}
              </div>
              <p className="text-[1.5rem] text-blue-600">
                Trước bạn còn <strong>5</strong> người, vui lòng chờ đến lượt.
              </p>
              <div className="mt-4 mb-2 border-t border-blue-300 border-dashed"></div>
              <div className="flex justify-end text-[1.2rem] text-blue-600">
                <span className="mr-1">Thời gian in:</span>
                <span>{new Date().toLocaleString("vi-VN")}</span>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-10 text-lg font-medium text-blue-500">
              <span className="text-[2.2rem]">🖨️</span>
              <span className="text-[1.8rem]">Đang in phiếu</span>
              <span className="flex gap-1 mt-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full dot animate-bounce"></span>
                <span className="w-2 h-2 delay-150 bg-blue-600 rounded-full dot animate-bounce"></span>
                <span className="w-2 h-2 delay-300 bg-blue-600 rounded-full dot animate-bounce"></span>
              </span>
            </div>
            <div className="flex justify-center w-full mt-4">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-[12rem] px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-[1.5rem] rounded-2xl mt-6"
              >
                Đóng ({countdown})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
