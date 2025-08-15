"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import PopupManager, { PopupManagerRef } from "@/components/popup/PopupManager";

export default function Page() {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement | null>(null);

  const popupRef = useRef<PopupManagerRef>(null);
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [ticketData, setTicketData] = useState<any>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [popupMessageData, setPopupMessageData] = useState<{
    title?: string;
    description?: string;
  } | null>(null);

  const showMessage = ({
    title,
    description,
  }: {
    title?: string;
    description?: string;
  }) => {
    setPopupMessageData({ title, description });
  };

  const closeMessage = () => {
    setPopupMessageData(null);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowSuccess(false);
          setTicketData(null);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showSuccess]);

  async function fetchServices() {
    const res = await apiGet("/services/findGroupedActiveServicesInAgency");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, showMessage, router);
      return;
    }

    if (res.status === 200) {
      const flat = (res.data || []).flatMap((g: any) => g.services || []);
      setServices(flat);
    }
  }

  async function handleGetNumber(serviceId: number) {
    try {
      const result = await apiPost("/tickets/get-number", {
        service_id: serviceId,
        source: 1,
      });

      if (![201, 400].includes(result.status)) {
        handleApiError(result, showMessage, router);
        return;
      }

      if (result.status !== 201 && result.status !== 200) {
        throw new Error(result.data?.message || "Lỗi lấy số");
      }

      setTicketData(result.data);
      setShowSuccess(true);
      setCountdown(10);

      setTimeout(() => {
        printTicket();
      }, 500);
    } catch (err: any) {
      popupRef.current?.showMessage({
        title: "LẤY SỐ THẤT BẠI",
        description: err.message,
      });
    }
  }

  const toggleFullscreen = async () => {
    const target = parentRef.current;
    if (!target) return;
    if (!document.fullscreenElement) {
      target.requestFullscreen?.();
    } else {
      setPasswordInput("");
      setShowPasswordModal(true);
    }
  };

  const printTicket = () => {
    window.print();
  };

  return (
    <div
      ref={parentRef}
      className="relative flex flex-col items-center w-full h-full pt-10 bg-gradient-to-br from-blue-50 to-sky-100"
    >
      {/* FULLSCREEN BUTTON */}
      <button
        onClick={toggleFullscreen}
        title="Toàn màn hình"
        className="absolute z-50 p-2 text-gray-600 transition-all border border-gray-200 rounded-lg shadow-sm opacity-40 top-4 right-4 bg-white/80 hover:bg-gray-100 active:scale-90 backdrop-blur-sm"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
        </svg>
      </button>

      <div className="w-full h-full max-w-[100rem] pt-8 px-8 flex-1 flex flex-col">
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

        <div className="flex-1 p-8 overflow-y-auto custom-scroll">
          <div className="grid grid-cols-1 gap-8 pr-4 md:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                className="px-4 py-10 text-3xl font-bold text-blue-600 transition-all bg-white rounded-3xl drop-shadow-md active:scale-98 active:drop-shadow-sm active:bg-blue-50"
                onClick={() => {
                  setSelectedService(service);
                  setShowConfirm(true);
                }}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showConfirm && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-[90%] text-center min-w-[40rem]">
            <h2 className="mb-8 text-4xl font-bold text-blue-900">
              XÁC NHẬN DỊCH VỤ
            </h2>
            <div className="px-12 py-6 mb-8 text-3xl font-bold text-blue-600 border border-blue-200 bg-blue-50 rounded-2xl">
              {selectedService.name}
            </div>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-10 py-4 bg-gray-600 text-white text-2xl rounded-2xl w-[12rem]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleGetNumber(selectedService.id);
                }}
                className="px-10 py-4 bg-blue-600 text-white text-2xl rounded-2xl w-[12rem]"
              >
                Lấy số
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && ticketData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-[90%] text-center">
            <h2 className="mb-8 text-4xl font-black text-blue-900">
              PHIẾU CỦA BẠN
            </h2>
            <div
              id="inDay"
              className="p-8 mb-4 text-blue-600 border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl"
            >
              <p className="text-[2rem] font-bold text-blue-800 uppercase">
                {ticketData.agency_name || "Tên cơ quan"}
              </p>
              <p className="text-[1.5rem] mt-1">
                Địa chỉ: {ticketData.agency_address || "-"}
              </p>
              <p className="text-[1.5rem]">
                Điện thoại: {ticketData.agency_phone || "-"}
              </p>
              <div className="mt-4 mb-6 border-t border-blue-300 border-dashed" />
              <p className="text-[2.5rem] font-bold">
                {ticketData.service_name}
              </p>
              <div className="text-[8rem] font-black text-blue-600 mb-10 leading-34">
                {ticketData.queue_number}
              </div>
              <p className="text-[1.5rem]">
                Trước bạn còn <strong>{ticketData.waitingAhead}</strong> người,
                vui lòng chờ đến lượt.
              </p>
              <div className="mt-4 mb-2 border-t border-blue-300 border-dashed" />
              <div className="flex justify-end text-[1.2rem]">
                <span className="mr-1">Thời gian in:</span>
                <span>
                  {new Date(ticketData.created_at).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-center mt-10">
              <div className="flex items-center gap-2 text-lg font-medium text-blue-500">
                <span className="text-[2.2rem]">🖨️</span>
                <span className="text-[1.8rem]">Đang in phiếu</span>
                <span className="flex gap-1 mt-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full dot"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full dot"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full dot"></span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center w-full mt-4">
              <button
                onClick={() => setShowSuccess(false)}
                className="flex w-[12rem] px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[1.5rem] rounded-2xl drop-shadow-md transition-colors active:scale-98 justify-center items-center"
              >
                <div className="pr-2">Đóng</div>
                <div className="text-[1.5rem]">({countdown})</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {popupMessageData && (
        <div className="text-3xl fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center transition-opacity duration-100">
          <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-[90%] text-center min-w-[40rem]">
            {popupMessageData.title && (
              <h2 className="mb-8 text-4xl font-bold text-blue-900">
                {popupMessageData.title}
              </h2>
            )}
            {popupMessageData.description && (
              <p className="px-12 pb-6 mb-8 text-3xl text-gray-600 rounded-2xl">
                {popupMessageData.description}
              </p>
            )}
            <button
              onClick={closeMessage}
              className="px-10 py-4 bg-blue-600 text-white text-2xl rounded-2xl w-[12rem]"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <PopupManager ref={popupRef} />
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-[30rem]">
            {/* Nút đóng */}
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute text-2xl text-gray-400 top-3 right-4 hover:text-red-500"
            >
              ×
            </button>

            <h2 className="mb-6 text-2xl font-bold text-center text-blue-800">
              Xác thực mật khẩu
            </h2>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            <div className="flex justify-end mt-6">
              <button
                onClick={async () => {
                  const res = await apiPost("/auth/kiosk-verify", {
                    password: passwordInput,
                  });
                  if (res.status === 200) {
                    document.exitFullscreen?.();
                  } else {
                    popupRef.current?.showMessage({
                      description: "Sai mật khẩu",
                    });
                  }
                  setShowPasswordModal(false);
                }}
                className="px-6 py-2 text-lg font-semibold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          -webkit-touch-callout: none;
        }

        html {
          font-size: 1.2vmin;
        }

        html,
        body {
          touch-action: manipulation;
          overscroll-behavior: none;
          position: fixed;
          width: 100%;
          height: 100%;
          margin: 0;
          overflow: hidden;
        }

        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(180, 190, 205, 0.4) rgba(230, 236, 245, 0.2);
        }

        .custom-scroll::-webkit-scrollbar {
          width: 8px;
          background: rgba(230, 236, 245, 0.15);
          border-radius: 12px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(160, 170, 190, 0.23);
          border-radius: 12px;
          border: 2px solid rgba(0, 0, 0, 0);
          min-height: 40px;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(110, 130, 180, 0.27);
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.1s ease;
        }

        .modal-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          padding: 3rem;
          max-width: 90%;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          transform: scale(0.8) translateY(2rem);
          transition: all 0.1s ease;
          text-align: center;
        }

        .modal-overlay.active .modal-content {
          transform: scale(1) translateY(0);
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        .dot {
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
      `}</style>
    </div>
  );
}
