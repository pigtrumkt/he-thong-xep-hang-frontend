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

const COLORS = ["#3b82f6", "#facc15", "#22c55e", "#ef4444"];
const COLORS2 = ["#2563eb", "#60a5fa"];

export default function DailyReportPage() {
  const ticketStats = [
    { name: "Đang đợi", value: 120, color: COLORS[0], icon: Clock },
    { name: "Đang phục vụ", value: 50, color: COLORS[1], icon: PlayCircle },
    { name: "Phục vụ xong", value: 200, color: COLORS[2], icon: CheckCircle },
    { name: "Vắng mặt", value: 30, color: COLORS[3], icon: XCircle },
  ];

  const sourceStats = [
    { name: "Tại cơ quan", value: 250, color: COLORS2[0], icon: Building2 },
    { name: "Online", value: 150, color: COLORS2[1], icon: Globe },
  ];

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const totalTickets = ticketStats.reduce((a, b) => a + b.value, 0);
  const totalSource = sourceStats.reduce((a, b) => a + b.value, 0);

  const renderLabel = (entry: any, _: number, data: any[]) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-blue-50">
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
              <ResponsiveContainer width="100%" height={250}>
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
                  <Ticket size={18} className="text-blue-600" /> Tổng số
                </span>
                <span className="font-bold text-blue-600">{totalTickets}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nguồn */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <h2 className="mb-4 text-lg font-semibold text-blue-700">
            Nguồn phát số
          </h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
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
                  <Ticket size={18} className="text-blue-600" /> Tổng số
                </span>
                <span className="font-bold text-blue-600">{totalTickets}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
