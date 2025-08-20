"use client";

import { usePopup } from "@/components/popup/PopupContext";
import { API_BASE, apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getClientIdentifier(): string {
  let uuid = localStorage.getItem("client_identifier");
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem("client_identifier", uuid);
  }
  return uuid;
}

export default function KioskMobilePage() {
  const router = useRouter();
  const params = useParams();
  const agencyId = params.agencyId;
  const { popupMessageMobile } = usePopup();
  const [activeTab, setActiveTab] = useState<"services" | "my">("services");
  const [tickets, setTickets] = useState<any[]>([]);
  const [popup, setPopup] = useState<any | null>(null);

  const [agency, setAgency] = useState<any>({});
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchServices();
    fetchAgency();
    fetchMyTickets();
  }, []);

  async function fetchMyTickets() {
    const res = await apiGet(
      `/tickets/client-get-tickets/${agencyId}/${getClientIdentifier()}`
    );

    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessageMobile, router);
      return;
    }

    if (res.status === 200) {
      setTickets(res.data);
    }
  }

  async function fetchAgency() {
    const res = await apiGet("/agencies/getAgency/" + agencyId);
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessageMobile, router);
      return;
    }

    if (res.status === 200) {
      const data = res.data;

      if (data.logo_url) {
        data.logo_url = `${API_BASE}/agencies/logos/${data.logo_url}`;
      }

      setAgency(res.data);
    }
  }

  async function fetchServices() {
    const res = await apiGet(
      "/services/findGroupedActiveServicesByAgency/" + agencyId
    );

    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessageMobile, router);
      return;
    }

    if (res.status === 200) {
      const flat = (res.data || []).flatMap((g: any) => g.services || []);
      setServices(flat);
    }
  }

  const handleSelectService = async (serviceId: number) => {
    const res = await apiPost("/tickets/get-number-mobile", {
      agency_id: Number(agencyId),
      service_id: serviceId,
      source: 2,
      client_identifier: getClientIdentifier(),
    });

    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessageMobile, router);
      return;
    }

    if (res.status === 201) {
      const newTicket = res.data;
      setTickets([newTicket, ...tickets]);
      setPopup(newTicket);
      setActiveTab("my");
    } else if (res.status === 400 && typeof res.data === "object") {
      popupMessageMobile(res.data.message);
    } else {
      popupMessageMobile({
        description: "Lỗi không xác định",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-50">
      {/* Header with Agency Info */}
      <header className="top-0 z-20 text-white shadow-lg bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
          <img
            src={agency.logo_url || "/img/white.png"}
            alt="Logo"
            className="w-16 h-16 p-2 bg-white rounded-lg shadow-md"
          />
          <div className="text-xl font-bold drop-shadow-sm">
            {agency.name_1}
          </div>
          <div className="text-xl font-bold drop-shadow-sm">
            {agency.name_2}
          </div>
          <div className="text-xs opacity-90">📍 {agency.address}</div>
          <div className="flex items-center justify-center gap-4 text-xs opacity-90">
            {/* Phone */}
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-red-500"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 
               19.79 19.79 0 0 1-8.63-3.07 
               19.5 19.5 0 0 1-6-6 
               19.79 19.79 0 0 1-3.07-8.67 
               A2 2 0 0 1 4.17 2h3a2 2 0 0 1 2 
               1.72c.12.81.37 1.6.72 2.34a2 
               2 0 0 1-.45 2.18L8.09 9.91a16 
               16 0 0 0 6 6l1.67-1.67a2 
               2 0 0 1 2.18-.45c.74.35 
               1.53.6 2.34.72A2 2 0 0 1 
               22 16.92z"
                />
              </svg>
              {agency.phone}
            </span>

            {/* Email */}
            <span className="flex items-center gap-1">📧 {agency.email}</span>
          </div>
        </div>
        <div className="bottom-0 z-20 shadow-md">
          <nav className="grid grid-cols-2">
            <button
              onClick={() => setActiveTab("services")}
              className={`flex flex-col items-center justify-center py-3 text-sm font-semibold transition ${
                activeTab === "services"
                  ? "bg-blue-700 text-white "
                  : "bg-white text-slate-600 border-transparent hover:text-blue-600 hover:bg-slate-100"
              }`}
            >
              <span className="mb-1 text-xl">📋</span>
              Lấy số thứ tự
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`flex flex-col items-center justify-center py-3 text-sm font-semibold transition ${
                activeTab === "my"
                  ? "bg-blue-700 text-white "
                  : "bg-white text-slate-600 border-transparent hover:text-blue-600 hover:bg-slate-100"
              }`}
            >
              <span className="mb-1 text-xl">🪪</span>
              Số của tôi
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center flex-1 p-6">
        {activeTab === "services" ? (
          <div className="w-full max-w-lg">
            <div className="grid grid-cols-1 gap-4">
              {services && services.length === 0 ? (
                <div className="py-5 text-center bg-white text-slate-400 rounded-xl">
                  Không có dịch vụ
                </div>
              ) : (
                services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectService(s.id)}
                    className="p-4 font-semibold text-blue-700 transition bg-white border border-blue-300 shadow-lg rounded-xl hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white active:scale-95"
                  >
                    {s.name}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-4">
            {tickets.length === 0 ? (
              <div className="py-5 text-center bg-white text-slate-400 rounded-xl">
                Bạn chưa lấy số thứ tự
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.ticket_id}
                  onClick={() => setPopup(t)}
                  className="p-4 font-semibold text-blue-700 transition bg-white border border-blue-300 shadow-lg rounded-xl hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white active:scale-95"
                >
                  <div>
                    <div className="text-sm font-semibold leading-none text-slate-600">
                      {t.service_name}
                    </div>
                    <div className="text-[2rem]  font-bold text-blue-600">
                      {t.queue_number}
                    </div>
                  </div>
                  <div className="text-[0.5rem] text-slate-500">
                    <span className="font-semibold">⏰ Thời gian lấy số: </span>{" "}
                    {new Date(t.created_at).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Popup Ticket Info */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="p-6 space-y-3 bg-white shadow-xl rounded-xl w-80">
            <div className="text-[1.2rem] font-bold text-center text-blue-700">
              {agency.name_1}
            </div>
            <div className="text-[0.8rem] text-center text-slate-600">
              📍 {agency.address}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              {/* Phone */}
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-red-500"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 
               19.79 19.79 0 0 1-8.63-3.07 
               19.5 19.5 0 0 1-6-6 
               19.79 19.79 0 0 1-3.07-8.67 
               A2 2 0 0 1 4.17 2h3a2 2 0 0 1 2 
               1.72c.12.81.37 1.6.72 2.34a2 
               2 0 0 1-.45 2.18L8.09 9.91a16 
               16 0 0 0 6 6l1.67-1.67a2 
               2 0 0 1 2.18-.45c.74.35 
               1.53.6 2.34.72A2 2 0 0 1 
               22 16.92z"
                  />
                </svg>
                {agency.phone}
              </span>
            </div>
            <hr />
            <div className="text-[1.2rem] font-medium text-center text-slate-600">
              {popup.service_name}
            </div>
            <div className="text-[5rem] font-bold text-center text-blue-600 leading-[4rem]">
              {popup.queue_number}
            </div>
            <div className="text-xs text-center text-slate-500">
              Trước bạn còn{" "}
              <span className="font-bold">{popup.waitingAhead}</span> người, vui
              lòng chờ đến lượt.
            </div>
            <hr />
            <div className="text-xs text-center text-slate-500">
              <span className="font-bold">⏰ Thời gian lấy số: </span>
              {new Date(popup.created_at).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
            <button
              onClick={() => setPopup(null)}
              className="w-full py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
