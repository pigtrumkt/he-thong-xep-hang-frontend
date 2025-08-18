"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE, apiGet, apiPost } from "@/lib/api";

export default function Page() {
  const { agencyId } = useParams<{ agencyId: string }>();

  const [agency, setAgency] = useState<any>(null);
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔑 Fake MAC lưu trong localStorage
  function getClientMac(): string {
    let mac = localStorage.getItem("client_mac");
    if (!mac) {
      mac = crypto.randomUUID();
      localStorage.setItem("client_mac", mac);
    }
    return mac;
  }

  useEffect(() => {
    fetchServices();
    fetchAgency();
  }, []);

  async function fetchAgency() {
    const res = await apiGet("/agencies/getAgency/" + agencyId);
    if (res.status !== 200) return;
    setAgency(res.data);
  }

  async function fetchServices() {
    const res = await apiGet("/services/findGroupedActiveServicesInAgency");
    if (res.status !== 200) return;
    const flat = (res.data || []).flatMap((g: any) => g.services || []);
    setServices(flat);
  }

  async function handleGetNumber(serviceId: number) {
    setLoading(true);
    try {
      const result = await apiPost("/tickets/get-number-mobile", {
        agency_id: Number(agencyId),
        service_id: serviceId,
        source: 2,
        client_mac: getClientMac(),
      });

      if (result.status === 201) {
        setTicketData(result.data);
      } else if (result.status === 400) {
        alert(result.data.message);
      } else {
        alert("Lấy số thất bại");
      }
    } catch (err: any) {
      alert("Lấy số thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Loading Screen với animation đẹp mắt - FULL SCREEN
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <div className="px-4 text-center">
          <div className="relative">
            {/* Spinner animation */}
            <div className="w-20 h-20 mx-auto mb-6 border-4 rounded-full border-white/30 border-t-white animate-spin"></div>
            <div
              className="absolute inset-0 w-20 h-20 mx-auto border-4 border-transparent rounded-full border-r-white/50 animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "0.8s",
              }}
            ></div>
          </div>
          <p className="mb-4 text-xl font-medium text-white">Đang xử lý...</p>
          <div className="flex justify-center space-x-2">
            <div
              className="w-3 h-3 rounded-full bg-white/70 animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-white/70 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-white/70 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Ticket Display với thiết kế như vé thật - FULL SCREEN
  if (ticketData) {
    return (
      <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Agency Header - Full width */}
        <div className="px-4 pb-4 bg-white border-b border-gray-100 shadow-sm pt-safe">
          <div className="flex items-center">
            {/* Agency Logo */}
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                {agency?.logo_url ? (
                  <img
                    src={`${API_BASE}/agencies/logos/${agency.logo_url}`}
                    alt="Logo"
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">🏢</span>
                )}
              </div>
            </div>

            {/* Agency Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">
                {agency?.name_1 || "Cơ quan"}
              </h1>
              {agency?.name_2 && (
                <p className="text-sm font-medium text-blue-600 truncate">
                  {agency.name_2}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 truncate">
                📍 {agency?.address || "Địa chỉ"}
              </p>
              <p className="text-xs text-gray-500">
                📞 {agency?.phone || "Số điện thoại"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center flex-1 p-6">
          <div className="w-full max-w-md">
            {/* Ticket với hiệu ứng shadow và border */}
            <div className="relative overflow-hidden bg-white shadow-2xl rounded-3xl">
              {/* Decorative top */}
              <div className="h-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

              {/* Ticket content */}
              <div className="px-8 py-12 text-center">
                {/* Service name với icon */}
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-blue-100 rounded-full">
                    <span className="text-3xl">🎫</span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-gray-700">
                    {ticketData.service_name}
                  </h3>
                </div>

                {/* Queue number - thiết kế nổi bật hơn */}
                <div className="mb-10">
                  <p className="mb-3 text-sm font-medium tracking-wider text-gray-500 uppercase">
                    Số thứ tự của bạn
                  </p>
                  <div className="relative">
                    <div className="font-black text-transparent text-9xl bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 drop-shadow-lg">
                      {ticketData.queue_number}
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute w-8 h-8 bg-blue-200 rounded-full -top-3 -left-3 opacity-60"></div>
                    <div className="absolute w-6 h-6 bg-indigo-200 rounded-full -bottom-3 -right-3 opacity-60"></div>
                  </div>
                </div>

                {/* Waiting info */}
                <div className="p-6 mb-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                  <div className="flex items-center justify-center mb-3">
                    <span className="mr-3 text-3xl">⏳</span>
                    <span className="text-base font-medium text-gray-600">
                      Trước bạn còn
                    </span>
                  </div>
                  <p className="mb-2 text-4xl font-bold text-blue-600">
                    {ticketData.waitingAhead}
                  </p>
                  <p className="text-base text-gray-500">người đang chờ</p>
                </div>

                {/* Timestamp */}
                <div className="inline-block px-4 py-3 text-sm text-gray-400 bg-gray-50 rounded-xl">
                  <span className="mr-2">🕒</span>
                  In lúc:{" "}
                  {new Date(ticketData.created_at).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Decorative bottom with cutouts */}
              <div className="relative h-8 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                {/* Simulated ticket perforations */}
                <div className="absolute left-0 right-0 flex justify-between px-6 -top-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-blue-50"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action button - Full width */}
        <div className="p-6 pb-safe">
          <button
            onClick={() => setTicketData(null)}
            className="w-full px-6 py-5 text-xl font-bold text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl active:scale-95 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <span className="mr-3 text-2xl">🔄</span>
            Lấy số dịch vụ khác
          </button>
        </div>
      </div>
    );
  }

  // Service Selection với grid layout đẹp - FULL SCREEN
  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Agency Header - Full width */}
      <div className="px-4 pb-4 bg-white border-b border-gray-100 shadow-sm pt-safe">
        <div className="flex items-center">
          {/* Agency Logo */}
          <div className="flex-shrink-0 mr-4">
            <div className="flex items-center justify-center h-16 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
              {agency?.logo_url ? (
                <img
                  src={`${API_BASE}/agencies/logos/${agency.logo_url}`}
                  alt="Logo"
                  className="object-contain w-full h-full"
                />
              ) : (
                <span className="text-2xl font-bold text-white">🏢</span>
              )}
            </div>
          </div>

          {/* Agency Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800 truncate">
              {agency?.name_1 || "Cơ quan"}
            </h1>
            {agency?.name_2 && (
              <p className="text-sm font-medium text-blue-600 truncate">
                {agency.name_2}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 truncate">
              📍 {agency?.address || "Địa chỉ"}
            </p>
            <p className="text-xs text-gray-500">
              📞 {agency?.phone || "Số điện thoại"}
            </p>
          </div>
        </div>
      </div>

      {/* Service Title */}
      <div className="px-4 py-6">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            🎫 Chọn Dịch Vụ
          </h2>
          <p className="text-base text-gray-600">
            Chọn dịch vụ cần lấy số thứ tự
          </p>
          <div className="w-20 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        </div>
      </div>

      {/* Services Grid - Scrollable */}
      <div className="flex-1 px-4 pb-4">
        {services.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="mb-6 text-8xl">📋</div>
              <p className="mb-2 text-xl text-gray-500">Không có dịch vụ nào</p>
              <p className="text-base text-gray-400">Vui lòng thử lại sau</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 pb-safe">
            {services.map((service, index) => (
              <button
                key={service.id}
                onClick={() => handleGetNumber(service.id)}
                className="p-6 text-left transition-all duration-200 transform bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-lg hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-4 focus:ring-blue-300"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex items-center">
                  {/* Service Icon */}
                  <div className="flex items-center justify-center flex-shrink-0 mr-4 transition-transform w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110">
                    <span className="text-2xl font-bold text-white">
                      {service.name.charAt(0)}
                    </span>
                  </div>

                  {/* Service Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold leading-tight text-gray-800 transition-colors group-hover:text-blue-600">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      Nhấn để lấy số thứ tự
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-gray-400 transition-all group-hover:text-blue-500 group-hover:translate-x-1">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
