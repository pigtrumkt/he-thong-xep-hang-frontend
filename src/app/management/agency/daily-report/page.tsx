"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  Building2,
  Globe,
  Ticket,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/lib/handleApiError";
import { usePopup } from "@/components/popup/PopupContext";
import { lab } from "d3-color";

const COLORS = [
  "#06b6d4",
  lab(44.0605, 29.0279, -86.0352).formatHex(),
  lab(70.5521, -66.5147, 45.8072).formatHex(),
  lab(55.4814, 75.0732, 48.8528).formatHex(),
];
const COLORS2 = [lab(44.0605, 29.0279, -86.0352).formatHex(), "#06b6d4"];

export default function DailyReportPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { popupMessage } = usePopup();

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    const res = await apiGet("/tickets/dailyReport");
    setLoading(false);
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 200) {
      setStats(res.data);
    }
  }

  if (loading) {
    return (
      <div className="inset-0 z-50 flex flex-col items-center justify-center w-full h-full select-none bg-white/80 backdrop-blur-sm">
        <div className="border-blue-500 rounded-full border-6 w-15 h-15 border-t-transparent animate-spin" />
      </div>
    );
  }

  const ticketStats = [
    { name: "Đang đợi", value: stats.waiting, color: COLORS[0], icon: Clock },
    {
      name: "Đang phục vụ",
      value: stats.serving,
      color: COLORS[1],
      icon: PlayCircle,
    },
    {
      name: "Phục vụ xong",
      value: stats.done,
      color: COLORS[2],
      icon: CheckCircle,
    },
    { name: "Vắng mặt", value: stats.missed, color: COLORS[3], icon: XCircle },
  ];

  const sourceStats = [
    {
      name: "Tại cơ quan",
      value: stats.kiosk,
      color: COLORS2[0],
      icon: Building2,
    },
    { name: "Trực tuyến", value: stats.online, color: COLORS2[1], icon: Globe },
  ];

  const totalTickets = stats.totalTickets;
  const avgRating = stats.avgRating;

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const renderLabel = (entry: any, _: number, data: any[]) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const percent = total ? ((entry.value / total) * 100).toFixed(1) : 0;
    return `${percent}%`;
  };

  return (
    <div className="min-h-full p-8 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-blue-700">
          📊 Báo cáo hàng ngày
        </h1>
        <p className="mt-1 text-gray-500">{today}</p>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Trạng thái */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <h2 className="mb-4 text-lg font-semibold text-blue-700">
            Trạng thái phục vụ
          </h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ticketStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={(entry) => renderLabel(entry, 0, ticketStats)}
                  >
                    {ticketStats.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-3 w-44">
              {ticketStats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={18} style={{ color: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-bold" style={{ color: s.color }}>
                      {s.value}
                    </span>
                  </div>
                );
              })}

              {/* Tổng số */}
              <div className="flex items-center justify-between pt-2 mt-2 text-sm border-t border-gray-200">
                <span className="flex items-center gap-2 font-semibold text-gray-700">
                  <Ticket size={18} className="text-blue-800" /> Tổng số
                </span>
                <span className="font-bold text-blue-800">{totalTickets}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nguồn */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <h2 className="mb-4 text-lg font-semibold text-blue-700">
            Nguồn lấy số
          </h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sourceStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={(entry) => renderLabel(entry, 0, sourceStats)}
                  >
                    {sourceStats.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-3 w-44">
              {sourceStats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={18} style={{ color: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-bold" style={{ color: s.color }}>
                      {s.value}
                    </span>
                  </div>
                );
              })}

              {/* Tổng số */}
              <div className="flex items-center justify-between pt-2 mt-2 text-sm border-t border-gray-200">
                <span className="flex items-center gap-2 font-semibold text-gray-700">
                  <Ticket size={18} className="text-blue-800" /> Tổng số
                </span>
                <span className="font-bold text-blue-800">{totalTickets}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
