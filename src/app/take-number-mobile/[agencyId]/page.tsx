"use client";

import { useState } from "react";

const AGENCY = {
  name_1: "UBND Hà Giang",
  name_2: "TỈNH HÀ GIANG",
  address: "Số 1 Nguyễn Trãi, TP. Hà Giang, Hà Giang",
  phone: "0219-3862666",
  email: "ubnd@hagiang.gov.vn",
  logo:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><rect rx='20' width='96' height='96' fill='#2563eb'/><polygon points='48,12 57,36 84,36 62,50 70,78 48,62 26,78 34,50 12,36 39,36' fill='#fbbf24'/></svg>`
    ),
};

const SERVICES = [
  { label: "Cấp căn cước công dân" },
  { label: "Đô thị - Công thương" },
  { label: "Nông nghiệp - Môi trường" },
  { label: "Tư pháp - Hộ tịch" },
  { label: "Văn hóa" },
  { label: "Phụ trách chung" },
  { label: "Giáo dục - Đào tạo" },
  { label: "Y tế - Xã hội" },
] as const;

export default function KioskMobilePage() {
  const [activeTab, setActiveTab] = useState<"services" | "my">("services");
  const [tickets, setTickets] = useState<any[]>([]);
  const [popup, setPopup] = useState<any | null>(null);

  const handleSelectService = (service: string) => {
    const now = new Date();
    const newTicket = {
      service,
      number: Math.floor(Math.random() * 100) + 1,
      timestamp: now.getTime(),
      time: now.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }), // ✅ HH:mm dd/MM/yyyy
      waiting: 1,
    };

    setTickets([...tickets, newTicket]);
    setPopup(newTicket);
    setActiveTab("my");
  };

  return (
    <div className="flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-50">
      {/* Header with Agency Info */}
      <header className="top-0 z-20 text-white shadow-lg bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
          <img
            src={AGENCY.logo}
            alt="Logo"
            className="w-16 h-16 p-2 bg-white rounded-lg shadow-md"
          />
          <div className="text-xl font-bold drop-shadow-sm">
            {AGENCY.name_1}
          </div>
          <div className="text-xl font-bold drop-shadow-sm">
            {AGENCY.name_2}
          </div>
          <div className="text-xs opacity-90">📍 {AGENCY.address}</div>
          <div className="text-xs opacity-90">
            <span className="px-1 text-xs opacity-90">☎️ {AGENCY.phone}</span>
            <span className="px-1 text-xs opacity-90"> 📧 {AGENCY.email}</span>
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
              {SERVICES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSelectService(s.label)}
                  className="p-4 font-semibold text-blue-700 transition bg-white border border-blue-100 shadow-lg rounded-xl hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-4">
            {tickets.length === 0 ? (
              <div className="py-10 text-center bg-white border shadow-md text-slate-500 rounded-xl">
                Chưa có vé nào hôm nay
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.timestamp}
                  onClick={() => setPopup(t)}
                  className="p-4 font-semibold text-blue-700 transition bg-white border border-blue-100 shadow-lg rounded-xl hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white active:scale-95"
                >
                  <div>
                    <div className="text-sm font-semibold leading-none text-slate-600">
                      {t.service}
                    </div>
                    <div className="text-[2rem]  font-bold text-blue-600">
                      {t.number}
                    </div>
                  </div>
                  <div className="text-[0.5rem] text-slate-500">
                    <span className="font-semibold">⏰ Thời gian lấy số: </span>{" "}
                    {t.time}
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
              {AGENCY.name_1}
            </div>
            <div className="text-[0.8rem] text-center text-slate-600">
              📍 {AGENCY.address}
            </div>
            <div className="text-[0.8rem] text-center text-slate-600">
              ☎️ {AGENCY.phone}
            </div>
            <hr />
            <div className="text-[1.2rem] font-medium text-center text-slate-600">
              {popup.service}
            </div>
            <div className="text-[5rem] font-bold text-center text-blue-600 leading-[4rem]">
              {popup.number}
            </div>
            <div className="text-xs text-center text-slate-500">
              Trước bạn còn <span className="font-bold">{popup.waiting}</span>{" "}
              người, vui lòng chờ đến lượt.
            </div>
            <hr />
            <div className="text-xs text-center text-slate-500">
              <span className="font-bold">⏰ Thời gian lấy số: </span>
              {popup.time}
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

      {/* Footer with Full-width Tabs */}
    </div>
  );
}
