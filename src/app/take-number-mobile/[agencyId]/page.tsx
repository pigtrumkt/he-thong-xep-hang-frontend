"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";

export default function Page() {
  const { agencyId } = useParams<{ agencyId: string }>();

  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔑 Fake MAC lưu trong localStorage
  function getClientMac(): string {
    let mac = localStorage.getItem("client_mac");
    if (!mac) {
      mac = crypto.randomUUID(); // sinh UUID
      localStorage.setItem("client_mac", mac);
    }
    return mac;
  }

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    const res = await apiGet("/services/findGroupedActiveServicesInAgency");
    if (res.status !== 200) {
      return;
    }
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

      if (![200, 201].includes(result.status)) {
        return;
      }
      setTicketData(result.data);
    } catch (err: any) {
      alert("Lấy số thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-10 text-center">⏳ Đang xử lý...</div>;

  if (ticketData) {
    return (
      <div className="p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold text-blue-700">Phiếu của bạn</h2>
        <p className="text-lg">{ticketData.service_name}</p>
        <div className="my-6 text-6xl font-extrabold text-blue-600">
          {ticketData.queue_number}
        </div>
        <p>Trước bạn còn {ticketData.waitingAhead} người</p>
        <p className="mt-2 text-gray-600">
          In lúc:{" "}
          {new Date(ticketData.created_at).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
        <button
          onClick={() => setTicketData(null)}
          className="px-6 py-3 mt-6 text-white bg-blue-600 rounded-lg"
        >
          Lấy thêm số khác
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-blue-700">
        Chọn dịch vụ cần lấy số
      </h1>
      <div className="flex flex-col gap-3">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => handleGetNumber(s.id)}
            className="px-4 py-3 text-lg font-semibold bg-white border shadow rounded-xl active:scale-95"
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
