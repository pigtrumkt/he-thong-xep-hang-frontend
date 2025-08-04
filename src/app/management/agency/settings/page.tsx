"use client";

import { useEffect, useState } from "react";
import feather from "feather-icons";

export default function AgencySettingsPage() {
  const [form, setForm] = useState({
    name: "UBND xã Tân Quang",
    address: "Tỉnh Tân Quang",
    phone: "0982984984",
    email: "ubnd@tanquang.gov.vn",
    screen_notice:
      "Vui lòng chuẩn bị giấy tờ khi đến lượt. Xin cảm ơn quý công dân đã hợp tác!",
    allowed_days_of_week: ["1", "2", "3", "4", "5", "6", "0"],
    ticket_time_start: "07:00",
    ticket_time_end: "17:00",
    allow_online_ticket: true,
    min_time_between_ticket_online: 10,
    max_ticket_per_day_online: 20,
  });

  useEffect(() => {
    feather.replace();
  }, []);

  const handleCheckboxChange = (day: string) => {
    setForm((prev) => {
      const exists = prev.allowed_days_of_week.includes(day);
      return {
        ...prev,
        allowed_days_of_week: exists
          ? prev.allowed_days_of_week.filter((d) => d !== day)
          : [...prev.allowed_days_of_week, day],
      };
    });
  };

  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dayValues = ["1", "2", "3", "4", "5", "6", "0"];

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 lg:min-w-[55rem]">
      <form className="p-8 space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Thông tin cơ bản */}
          <FormCard title="Thông tin cơ bản" icon="info">
            <FormInput label="Tên trụ sở" icon="home" value={form.name} />
            <FormInput label="Địa chỉ" icon="map-pin" value={form.address} />
            <FormInput
              label="Số điện thoại"
              icon="phone"
              value={form.phone}
              type="tel"
            />
            <FormInput
              label="Email"
              icon="mail"
              value={form.email}
              type="email"
            />
          </FormCard>

          {/* Thông báo màn hình */}
          <FormCard title="Thông báo chạy ở màn hình mỗi quầy" icon="monitor">
            <FormTextarea
              label="Nội dung thông báo"
              icon="message-square"
              value={form.screen_notice}
            />
          </FormCard>

          {/* Cấu hình thời gian */}
          <FormCard title="Cấu hình thời gian" icon="calendar">
            <div className="mb-8">
              <label className="flex items-center gap-2 mb-3 font-medium text-slate-700">
                <i data-feather="calendar" className="w-4 h-4 text-slate-500" />
                Những ngày được lấy số
              </label>
              <div className="grid grid-cols-7 gap-2">
                {dayLabels.map((label, idx) => {
                  const val = dayValues[idx];
                  const checked = form.allowed_days_of_week.includes(val);
                  return (
                    <label
                      key={label}
                      className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange(val)}
                        className="mb-1 accent-blue-500"
                      />
                      <span className="font-medium text-slate-600">
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-3 font-medium text-slate-700">
                <i data-feather="clock" className="w-4 h-4 text-slate-500" />
                Khoảng thời gian lấy số
              </label>
              <div className="flex items-end gap-4">
                <div>
                  <label className="block mb-1 text-sm text-slate-500">
                    Từ
                  </label>
                  <input
                    type="time"
                    value={form.ticket_time_start}
                    step="60"
                    className="w-40 px-3 py-2 bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <span className="mb-2">~</span>
                <div>
                  <label className="block mb-1 text-sm text-slate-500">
                    Đến
                  </label>
                  <input
                    type="time"
                    value={form.ticket_time_end}
                    step="60"
                    className="w-40 px-3 py-2 bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </FormCard>

          {/* Cấu hình lấy số */}
          <FormCard title="Cấu hình lấy số online" icon="smartphone">
            <div className="flex items-center justify-between p-4 mb-4 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <i
                  data-feather="smartphone"
                  className="w-5 h-5 text-blue-500"
                />
                <span className="font-medium text-slate-700">
                  Cho phép lấy số online
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allow_online_ticket}
                  className="sr-only peer"
                />
                <div className="h-6 transition duration-300 bg-gray-200 rounded-full w-11 peer-checked:bg-blue-600" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-5" />
              </label>
            </div>
            <FormInput
              label="Thời gian chờ giữa 2 lần lấy số (phút)"
              icon="clock"
              type="number"
              value={form.min_time_between_ticket_online.toString()}
            />
            <FormInput
              label="Giới hạn số lần lấy số trong ngày"
              icon="users"
              type="number"
              value={form.max_ticket_per_day_online.toString()}
            />
            <FormInput
              label="Link lấy số online"
              icon="link"
              value={`https://hethongxephang.com/take-number/1`}
              readOnly
            />
          </FormCard>
        </div>

        <div className="flex flex-col justify-end gap-3 pt-6 border-t sm:flex-row border-slate-200">
          <button
            type="submit"
            className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
          >
            <i data-feather="save" className="inline w-4 h-4 mr-2"></i>
            Lưu cài đặt
          </button>
        </div>
      </form>
    </section>
  );
}

function FormCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 border bg-slate-50 rounded-xl border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500 rounded-lg">
          <i data-feather={icon} className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-[1.5rem] font-medium text-slate-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormInput({
  label,
  value,
  icon,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  icon: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
        <i data-feather={icon} className="w-4 h-4 text-slate-500" />
        {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        className={`w-full px-4 py-3 ${
          readOnly ? "bg-gray-50" : "bg-white"
        } border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors outline-none`}
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
        <i data-feather={icon} className="w-4 h-4 text-slate-500" />
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        className="w-full px-4 py-3 transition-colors bg-white border rounded-lg outline-none resize-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
