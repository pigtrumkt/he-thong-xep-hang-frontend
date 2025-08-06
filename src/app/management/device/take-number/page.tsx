"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { usePopup } from "@/components/popup/PopupContext";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [ticketData, setTicketData] = useState<any>(null);
  const { popupMessage } = usePopup();

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
      handleApiError(res, popupMessage, router);
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
        handleApiError(result, popupMessage, router);
        return;
      }

      if (result.status !== 201 && result.status !== 200) {
        throw new Error(result.data?.message || "Lỗi lấy số");
      }

      setTicketData(result.data);
      setShowSuccess(true);
      setCountdown(10);
    } catch (err: any) {
      popupMessage({
        title: "Lấy số thất bại",
        description: err.message,
      });
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="w-full max-w-[100rem] pt-8 px-8 mt-10 flex-1 flex flex-col">
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

        <div className="overflow-y-auto max-h-[calc(100vh-15rem)] p-8 flex-1 custom-scroll">
          <div className="grid grid-cols-1 gap-8 pr-4 md:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                className="py-10 text-3xl font-bold text-blue-600 transition-all bg-white rounded-3xl drop-shadow-md active:scale-98 active:drop-shadow-sm active:bg-blue-50"
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
          <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-[90%] text-center">
            <h2 className="mb-8 text-4xl font-bold text-blue-900">
              XÁC NHẬN DỊCH VỤ
            </h2>
            <div className="p-6 mb-8 text-3xl font-bold text-blue-600 border border-blue-200 bg-blue-50 rounded-2xl">
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
            <div className="p-8 mb-4 text-blue-600 border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl">
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
              <div className="text-[8rem] font-black text-blue-600 mb-8">
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

            <div className="flex justify-center mt-10 text-lg font-medium text-blue-500">
              <span className="text-[2.2rem]">🖨️</span>
              <span className="text-[1.8rem] ml-2">Đang in phiếu</span>
              <span className="flex gap-1 mt-2 ml-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full dot animate-bounce"></span>
                <span className="w-2 h-2 delay-100 bg-blue-600 rounded-full dot animate-bounce"></span>
                <span className="w-2 h-2 delay-200 bg-blue-600 rounded-full dot animate-bounce"></span>
              </span>
            </div>

            <div className="flex items-center justify-center w-full mt-4">
              <button
                onClick={() => setShowSuccess(false)}
                className="flex w-[12rem] px-8 py-4 bg-blue-600 text-white text-[1.5rem] rounded-2xl justify-center items-center"
              >
                <div className="pr-2">Đóng</div>
                <div>({countdown})</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
