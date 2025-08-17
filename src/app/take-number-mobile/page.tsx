// app/online/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { usePopup } from "@/components/popup/PopupContext";

type Service = { id: number; name: string };

export default function MobileOnlineTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { popupMessage } = usePopup();

  // Nếu bạn truyền ?agencyId=... từ link, BE có thể đọc từ session/host → tuỳ bạn
  const agencyId = searchParams.get("agencyId"); // optional

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [ticket, setTicket] = useState<any>(null); // kết quả vé
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiGet("/services/findGroupedActiveServicesInAgency");
      setLoading(false);
      if (![200, 400].includes(res.status)) {
        handleApiError(res, popupMessage as any, router);
        return;
      }
      const flat = (res.data || []).flatMap((g: any) => g.services || []);
      setServices(flat);
    })();
  }, []);

  const getNumber = async (serviceId: number) => {
    try {
      setSubmitting(true);
      const res = await apiPost("/tickets/get-number", {
        service_id: serviceId,
        source: 2, // online
        ...(agencyId ? { agency_id: Number(agencyId) } : {}),
      });
      setSubmitting(false);

      if (![200, 201, 400].includes(res.status)) {
        handleApiError(res, popupMessage as any, router);
        return;
      }
      if (res.status === 200 || res.status === 201) {
        setTicket(res.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 400) {
        popupMessage({
          title: "Không thể lấy số",
          description:
            typeof res.data === "string"
              ? res.data
              : res.data?.message || "Vui lòng thử lại sau.",
        });
      }
    } catch (e: any) {
      setSubmitting(false);
      popupMessage({
        title: "Lỗi lấy số",
        description: e?.message || "Vui lòng thử lại sau.",
      });
    }
  };

  if (ticket) {
    // Màn hình kết quả — mobile-first
    return (
      <main className="min-h-dvh bg-gradient-to-b from-blue-50 to-white">
        <header className="px-4 pt-6 pb-3">
          <h1 className="text-xl font-extrabold text-blue-700">
            Phiếu của bạn
          </h1>
          <p className="text-sm text-slate-500">
            Vui lòng chờ đến lượt, giữ trang này để theo dõi.
          </p>
        </header>

        <section className="px-4">
          <div className="p-4 bg-white border border-blue-200 shadow-sm rounded-2xl">
            <div className="text-xs text-slate-500">Cơ quan</div>
            <div className="text-base font-semibold text-slate-800">
              {ticket.agency_name || "—"}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 text-center rounded-xl bg-blue-50">
                <div className="text-xs text-blue-700">Dịch vụ</div>
                <div className="text-sm font-semibold text-blue-900">
                  {ticket.service_name}
                </div>
              </div>
              <div className="p-3 text-center rounded-xl bg-blue-50">
                <div className="text-xs text-blue-700">Số thứ tự</div>
                <div className="text-4xl font-black leading-none text-blue-700">
                  {ticket.queue_number}
                </div>
              </div>
            </div>

            <div className="p-3 mt-3 rounded-xl bg-slate-50">
              <div className="text-xs text-slate-500">Còn trước bạn</div>
              <div className="text-lg font-bold text-slate-800">
                {ticket.waitingAhead} người
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span>
                {new Date(ticket.created_at).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
              <span>Nguồn: Online</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              className="py-3 font-semibold text-white bg-blue-600 rounded-xl active:scale-95"
              onClick={() => {
                // có thể điều hướng sang trang theo dõi trạng thái nếu bạn có
                // router.push(`/tracking?ticket=${ticket.id}`);
                navigator.clipboard
                  .writeText(String(ticket.queue_number))
                  .then(() =>
                    popupMessage({
                      title: "Đã sao chép",
                      description: "Đã copy số thứ tự vào clipboard.",
                    })
                  );
              }}
            >
              Sao chép số
            </button>
            <button
              className="py-3 font-semibold text-blue-700 bg-white border border-blue-200 rounded-xl active:scale-95"
              onClick={() =>
                popupMessage({
                  title: "Mẹo lưu vé",
                  description:
                    "Bạn có thể chụp màn hình để lưu vé hoặc giữ trang này để theo dõi.",
                })
              }
            >
              Lưu vé
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              className="text-sm underline text-slate-500 underline-offset-4"
              onClick={() => {
                setTicket(null); // quay lại danh sách dịch vụ
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Lấy thêm vé cho dịch vụ khác
            </button>
          </div>
        </section>

        <footer className="px-4 py-6 text-xs text-center text-slate-400">
          Vui lòng đến đúng lượt để tránh phiếu bị bỏ lỡ/hết hạn.
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-blue-50 to-white">
      <header className="px-4 pt-6 pb-3">
        <h1 className="text-xl font-extrabold text-blue-700">
          Lấy số trực tuyến
        </h1>
        <p className="text-sm text-slate-500">
          Chọn dịch vụ bạn cần. Không cần đăng nhập.
        </p>
      </header>

      {/* Danh sách dịch vụ */}
      <section className="px-4 pb-24">
        {loading ? (
          <div className="mt-6 text-center text-slate-500">Đang tải…</div>
        ) : services.length ? (
          <ul className="grid grid-cols-1 gap-3 mt-3">
            {services.map((s) => (
              <li key={s.id}>
                <button
                  className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left shadow-sm active:scale-[0.98]"
                  onClick={() => {
                    setSelected(s);
                    setShowConfirm(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center text-blue-700 bg-blue-100 h-9 w-9 rounded-xl">
                      {/* small icon */}
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 7h16M7 11h10M9 15h6" />
                      </svg>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {s.name}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 text-center text-slate-500">
            Hiện chưa có dịch vụ khả dụng.
          </div>
        )}
      </section>

      {/* Bottom Sheet xác nhận */}
      {showConfirm && selected && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirm(false)}
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-white shadow-2xl rounded-t-2xl">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="mt-3 text-sm text-center text-slate-500">
              Xác nhận dịch vụ
            </div>
            <div className="mt-1 text-base font-semibold text-center text-slate-800">
              {selected.name}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                className="py-3 font-semibold bg-white border rounded-xl border-slate-200 active:scale-95"
                onClick={() => setShowConfirm(false)}
              >
                Hủy
              </button>
              <button
                disabled={submitting}
                className="py-3 font-semibold text-white bg-blue-600 rounded-xl active:scale-95 disabled:opacity-50"
                onClick={async () => {
                  await getNumber(selected.id);
                  setShowConfirm(false);
                }}
              >
                {submitting ? "Đang xử lý…" : "Lấy số"}
              </button>
            </div>
            <div className="mt-3 pb-2 text-center text-[11px] text-slate-400">
              Lưu ý: Mỗi người chỉ có thể lấy 1 số/5 phút.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
