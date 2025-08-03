"use client";

interface AgencyDetailModalProps {
  agency: any;
  onClose: () => void;
}

export default function AgencyDetailModal({
  agency,
  onClose,
}: AgencyDetailModalProps) {
  const weekdays = [
    { label: "Chủ nhật", value: "0" },
    { label: "Thứ 2", value: "1" },
    { label: "Thứ 3", value: "2" },
    { label: "Thứ 4", value: "3" },
    { label: "Thứ 5", value: "4" },
    { label: "Thứ 6", value: "5" },
    { label: "Thứ 7", value: "6" },
  ];

  const allowed = (agency.allowed_days_of_week || "").split(",");
  const [start, end] = (agency.ticket_time_range || "").split("~");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl p-8 bg-white border border-blue-200 shadow-2xl rounded-3xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute text-2xl text-gray-400 top-4 right-4 hover:text-red-500"
        >
          ×
        </button>

        <h2 className="pb-3 mb-6 text-2xl font-bold text-blue-700 border-b">
          Thông tin cơ quan
        </h2>

        <div className="space-y-5 text-sm text-gray-800">
          <Field label="Tên cơ quan" value={agency.name} />
          <Field label="Địa chỉ" value={agency.address} />
          <Field label="Số điện thoại" value={agency.phone} />
          <Field label="Email" value={agency.email} />
          <Field label="Thông báo màn hình quầy" value={agency.screen_notice} />

          {/* Ngày làm việc */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Ngày làm việc
            </label>
            <div className="flex flex-wrap gap-3">
              {weekdays.map((d) => (
                <label
                  key={d.value}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    disabled
                    checked={allowed.includes(d.value)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          {/* Giờ lấy số */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Khoảng giờ lấy số
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                value={start}
                readOnly
                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded"
              />
              <input
                type="time"
                value={end}
                readOnly
                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded"
              />
            </div>
          </div>

          {/* Online config */}
          <div className="p-5 space-y-4 border border-blue-200 bg-blue-50/50 rounded-xl">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                disabled
                checked={agency.allow_online_ticket === 1}
                className="w-5 h-5 accent-blue-600"
              />
              <span className="text-sm font-medium text-blue-700">
                Cho phép lấy số online
              </span>
            </div>

            {agency.allow_online_ticket === 1 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Chờ giữa 2 lượt (phút)"
                  value={agency.min_time_between_ticket_online}
                />
                <Field
                  label="Giới hạn lượt/ngày"
                  value={agency.max_ticket_per_day_online}
                />
              </div>
            )}
          </div>

          {/* Link */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Link lấy số online
            </label>
            <div className="px-3 py-2 text-blue-700 break-all bg-gray-100 rounded">
              <a
                href={`/take-number/${agency.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {typeof window !== "undefined"
                  ? `${window.location.origin}/take-number/${agency.id}`
                  : `/take-number/${agency.id}`}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Field component hiển thị giá trị như input readOnly
function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="px-3 py-2 bg-gray-100 rounded min-h-[40px] whitespace-pre-wrap break-words">
        {value !== undefined && value !== null && value !== ""
          ? value
          : "(Không có)"}
      </div>
    </div>
  );
}
