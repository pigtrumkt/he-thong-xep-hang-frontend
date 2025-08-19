"use client";

import { useEffect, useMemo, useState } from "react";

// —— Mock constants
const AGENCY = {
  name: "UBND tỉnh Hà Giang",
  address: "Số 1 Nguyễn Trãi, TP. Hà Giang, Hà Giang",
  phone: "0219-38626661",
  email: "ubnd@hagiang1.gov.vn",
};

const SERVICES = [
  "Cấp căn cước công dân",
  "Đô thị - Công thương",
  "Nông nghiệp - Môi trường",
  "Tư pháp - Hộ tịch",
  "Văn hóa",
  "Phụ trách chung",
  "Giáo dục - Đào tạo",
  "Y tế - Xã hội",
] as const;

const SERVICE_PREFIX: Record<(typeof SERVICES)[number], string> = {
  "Cấp căn cước công dân": "A",
  "Đô thị - Công thương": "B",
  "Nông nghiệp - Môi trường": "C",
  "Tư pháp - Hộ tịch": "D",
  "Văn hóa": "E",
  "Phụ trách chung": "F",
  "Giáo dục - Đào tạo": "G",
  "Y tế - Xã hội": "H",
};

// —— Limits (mock, client only)
const MINUTES_BETWEEN_TICKETS = 5; // 1 người chỉ lấy 1 số trong 5 phút
const MAX_TICKETS_PER_DAY = 10; // tổng số vé/ngày

type Ticket = {
  number: string;
  service: (typeof SERVICES)[number] | string;
  time: string; // hiển thị HH:mm:ss
  timestamp: number; // ms
};

export default function KioskPage() {
  const [activeTab, setActiveTab] = useState<"services" | "my-tickets">(
    "services"
  );
  const [todayTickets, setTodayTickets] = useState<Ticket[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTicket, setPopupTicket] = useState<Ticket | null>(null);
  const [alert, setAlert] = useState<string>("");

  // —— localStorage keys theo ngày
  const todayKey = useMemo(() => {
    const d = new Date();
    // Lưu theo múi giờ trình duyệt (VN): YYYY-MM-DD
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `kiosk-${y}-${m}-${day}`;
  }, []);

  // —— Load tickets trong ngày từ localStorage khi mount
  useEffect(() => {
    const raw = localStorage.getItem(todayKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          tickets: Ticket[];
          lastTs?: number;
        };
        setTodayTickets(parsed.tickets || []);
      } catch {
        // ignore corrupted data
      }
    }
  }, [todayKey]);

  // —— Lưu lại khi thay đổi
  useEffect(() => {
    const raw = localStorage.getItem(todayKey);
    let lastTs: number | undefined = undefined;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          tickets: Ticket[];
          lastTs?: number;
        };
        lastTs = parsed.lastTs;
      } catch {
        /* ignore */
      }
    }
    localStorage.setItem(
      todayKey,
      JSON.stringify({ tickets: todayTickets, lastTs })
    );
  }, [todayTickets, todayKey]);

  // —— Tính counter (mock): dựa trên số lượng vé đã in trong ngày (toàn cục)
  const nextCounter = useMemo(
    () => todayTickets.length + 1,
    [todayTickets.length]
  );

  const genTicketNumber = (serviceName: (typeof SERVICES)[number] | string) => {
    const prefix =
      SERVICE_PREFIX[serviceName as (typeof SERVICES)[number]] ?? "X";
    const number = String(nextCounter).padStart(3, "0");
    return `${prefix}${number}`;
  };

  const viTime = (d = new Date()) =>
    d.toLocaleTimeString("vi-VN", { hour12: false });

  const openAlert = (msg: string) => {
    setAlert(msg);
    setTimeout(() => setAlert(""), 2500);
  };

  const canTakeTicket = (): { ok: true } | { ok: false; reason: string } => {
    // tổng vé/ngày
    if (todayTickets.length >= MAX_TICKETS_PER_DAY) {
      return {
        ok: false,
        reason: `Đã đạt giới hạn ${MAX_TICKETS_PER_DAY} vé trong ngày.`,
      };
    }
    // kiểm tra 1 vé/5 phút theo client
    try {
      const raw = localStorage.getItem(todayKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          tickets: Ticket[];
          lastTs?: number;
        };
        const lastTs = parsed.lastTs;
        if (lastTs) {
          const diffMs = Date.now() - lastTs;
          const needMs = MINUTES_BETWEEN_TICKETS * 60 * 1000;
          if (diffMs < needMs) {
            const remainSec = Math.ceil((needMs - diffMs) / 1000);
            const mm = String(Math.floor(remainSec / 60)).padStart(2, "0");
            const ss = String(remainSec % 60).padStart(2, "0");
            return {
              ok: false,
              reason: `Vui lòng đợi ${mm}:${ss} để lấy số tiếp theo.`,
            };
          }
        }
      }
    } catch {
      /* ignore */
    }

    return { ok: true };
  };

  const persistLastTs = (ts: number) => {
    // cập nhật lastTs trong localStorage
    try {
      const raw = localStorage.getItem(todayKey);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.lastTs = ts;
      parsed.tickets = todayTickets;
      localStorage.setItem(todayKey, JSON.stringify(parsed));
    } catch {
      /* ignore */
    }
  };

  const takeNumber = (serviceName: (typeof SERVICES)[number]) => {
    const check = canTakeTicket();
    if (!check.ok) {
      openAlert(check.reason);
      return;
    }

    const number = genTicketNumber(serviceName);
    const now = new Date();
    const ticket: Ticket = {
      number,
      service: serviceName,
      time: viTime(now),
      timestamp: now.getTime(),
    };

    setTodayTickets((prev) => {
      const updated = [ticket, ...prev];
      return updated.sort((a, b) => b.timestamp - a.timestamp);
    });
    setPopupTicket(ticket);
    setShowPopup(true);
    persistLastTs(Date.now());
    setActiveTab("my-tickets");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-slate-800">
      <div className="mx-auto min-h-screen max-w-[480px] bg-white relative">
        {/* Header */}
        <header className="p-5 text-center text-white shadow bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="w-[60px] h-[60px] bg-red-600 mx-auto mb-4 rounded-lg shadow flex items-center justify-center">
            {/* ngôi sao */}
            <div
              className="w-[35px] h-[35px] bg-amber-300"
              style={{
                clipPath:
                  "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
              }}
            />
          </div>
          <div className="font-bold text-[18px] leading-snug">
            {AGENCY.name}
          </div>
          <div className="opacity-90 text-[12px] leading-relaxed mt-1">
            {AGENCY.address}
            <br />
            📞 {AGENCY.phone} | 📧 {AGENCY.email}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b bg-slate-50 border-slate-200">
          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 py-3 text-[16px] font-medium transition ${
              activeTab === "services"
                ? "bg-white text-blue-600 border-b-4 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Lấy số
          </button>
          <button
            onClick={() => setActiveTab("my-tickets")}
            className={`flex-1 py-3 text-[16px] font-medium transition ${
              activeTab === "my-tickets"
                ? "bg-white text-blue-600 border-b-4 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Phiếu của bạn
          </button>
        </div>

        {/* Alert (toast) */}
        {alert && (
          <div className="px-4 pt-4">
            <div className="px-4 py-3 text-sm text-red-700 border border-red-200 shadow rounded-xl bg-red-50">
              {alert}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5 min-h-[calc(100vh-200px)]">
          {/* Services */}
          {activeTab === "services" && (
            <div className="grid grid-cols-2 gap-4">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  onClick={() => takeNumber(s)}
                  className="bg-white border-2 border-slate-200 rounded-xl py-6 px-4 text-center shadow-sm hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-lg transition flex items-center justify-center"
                >
                  <span className="text-[14px] font-semibold text-slate-800 leading-tight">
                    {s}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* My tickets */}
          {activeTab === "my-tickets" && (
            <div>
              {todayTickets.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl rounded-full bg-slate-100">
                    🎫
                  </div>
                  <h3 className="mb-1 font-semibold">Chưa có phiếu nào</h3>
                  <p>Hãy lấy số từ tab “Lấy số” để xem phiếu của bạn tại đây</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTickets.map((t) => (
                    <div
                      key={`${t.number}-${t.timestamp}`}
                      className="p-4 bg-white border-l-4 border-blue-600 shadow rounded-xl"
                    >
                      <div className="mb-2 text-3xl font-bold text-center text-blue-600">
                        {t.number}
                      </div>
                      <div className="font-semibold text-slate-800">
                        {t.service}
                      </div>
                      <div className="text-sm text-slate-500">
                        Thời gian: {t.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popup overlay */}
      {showPopup && popupTicket && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-[320px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute text-2xl top-3 right-3 text-slate-400 hover:text-red-500"
                aria-label="Đóng"
              >
                &times;
              </button>

              <div className="relative p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-gradient-to-b from-white to-slate-50">
                <div className="absolute -top-2 left-6 right-6 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,#cbd5e1_8px,#cbd5e1_12px)]" />

                <div className="mb-4 text-center">
                  <div className="text-[18px] font-bold text-slate-900">
                    {AGENCY.name}
                  </div>
                  <div className="text-[13px] text-slate-600 leading-relaxed mt-1">
                    {AGENCY.address}
                    <br />
                    Điện thoại: {AGENCY.phone}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">
                    {popupTicket.service}
                  </div>
                  <div className="my-3 text-5xl font-bold text-blue-600 drop-shadow">
                    {popupTicket.number}
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    Thời gian in: {popupTicket.time}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
