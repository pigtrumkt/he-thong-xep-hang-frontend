"use client";

import { useEffect, useRef, useState } from "react";

export default function CounterStatusPage() {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<HTMLElement | null>(null);
  const [counterSelected, setCounterSelected] = useState<any>(null);
  const [serviceSelected, setServiceSelected] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  const toggleFullscreen = () => {
    const target = parentRef.current;
    if (!target) return;

    if (!document.fullscreenElement) {
      target.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const onConfirmSelected = () => {};

  useEffect(() => {
    const handleResize = () => {
      if (
        !document.fullscreenElement ||
        !scaleRef.current ||
        !parentRef.current
      )
        return;

      const winW = window.innerWidth - 40;
      const winH = window.innerHeight - 40;

      const scale = Math.min(
        winW / scaleRef.current.offsetWidth,
        winH / scaleRef.current.offsetHeight
      );

      parentRef.current.classList.add("apply-full-screen-css");
      scaleRef.current.style.transform = `scale(${scale})`;
    };

    const handleExit = () => {
      if (scaleRef.current && parentRef.current) {
        scaleRef.current.style.transform = "";
        parentRef.current.classList.remove("apply-full-screen-css");
      }
    };

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) handleResize();
      else handleExit();
    });
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("fullscreenchange", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isReady ? (
    <div
      ref={parentRef}
      className="h-[calc(100vh-4rem)] w-full min-w-[42rem] min-h-[64rem] lg:min-w-[67rem] lg:min-h-[42rem] px-4 py-8 bg-blue-100"
    >
      <section
        ref={scaleRef}
        className="relative w-[40rem] h-[60rem] lg:w-[65rem] lg:h-[37.8rem] bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-300 m-auto transition-transform"
      >
        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="absolute z-20 p-2 text-gray-600 transition-all border border-gray-200 rounded-lg shadow-sm top-4 right-4 bg-white/80 hover:bg-gray-100 active:scale-90 backdrop-blur-sm"
          title="Toàn màn hình"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Left panel */}
          <div className="flex flex-col items-center justify-center flex-1 px-8 py-12 bg-gradient-to-br from-blue-50 to-white lg:px-12">
            {/* User info */}
            <div className="absolute px-4 py-2 border border-blue-300 rounded-lg top-4 left-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="font-semibold text-blue-800">
                  Nguyễn Văn A
                </span>
              </div>
            </div>

            {/* Counter info */}
            <div className="mt-6 mb-6 text-center">
              <div className="text-[2rem] font-bold text-blue-800 mb-1">
                QUẦY SỐ 1
              </div>
              <div className="text-lg font-medium text-blue-600">
                Cấp lại CMND/CCCD
              </div>
            </div>

            {/* Queue Number */}
            <div className="relative mb-8">
              <div className="absolute bg-blue-200 -inset-1 rounded-2xl blur opacity-10" />
              <div className="relative p-8 bg-white border border-blue-100 shadow-lg rounded-2xl">
                <div className="px-4 mb-2 font-extrabold text-center text-blue-600 text-8xl">
                  1001
                </div>
                <div className="font-medium text-center text-blue-800">
                  Đang phục vụ
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="flex gap-6 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100/80">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-bold text-blue-900">00:31</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid w-full max-w-xs grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-green-100/80 rounded-xl">
                <span className="text-sm font-medium text-green-600">
                  Đã phục vụ
                </span>
                <span className="mt-1 text-xl font-bold text-green-900">
                  20
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-amber-100/80 rounded-xl">
                <span className="text-sm font-medium text-amber-600">
                  Còn chờ
                </span>
                <span className="mt-1 text-xl font-bold text-amber-900">5</span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="relative flex-1 px-8 py-10 border-t border-gray-200 bg-gray-50 lg:px-12 lg:border-t-0 lg:border-l">
            <button
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 shadow-sm active:scale-[0.98]"
              onClick={() => {
                setCounterSelected(null);
                setServiceSelected(null);
              }}
            >
              <svg
                className="text-gray-600 w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 7l-5 5m0 0l5 5m-5-5h12"
                />
                <rect
                  x="3"
                  y="4"
                  width="3"
                  height="16"
                  rx="1.5"
                  className="text-gray-200 fill-current"
                />
              </svg>
              Thay đổi dịch vụ
            </button>

            <div className="flex flex-col justify-center h-full mt-16 space-y-6 lg:mt-0">
              <button className="group relative w-full py-8 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold shadow-lg transition-all active:scale-[0.98] overflow-hidden">
                <div className="relative z-10 flex items-center justify-center gap-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="text-2xl">Gọi lại</span>
                </div>
                <div className="absolute inset-0 transition-all duration-300 bg-white/10 group-hover:bg-white/0"></div>
              </button>

              <div className="flex gap-5">
                <button className="flex-1 group relative py-7 px-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg transition-all active:scale-[0.98] overflow-hidden">
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-xl">Hoàn thành</span>
                  </div>
                  <div className="absolute inset-0 transition-all duration-300 bg-white/10 group-hover:bg-white/0"></div>
                </button>

                <button className="flex-1 group relative py-7 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg transition-all active:scale-[0.98] overflow-hidden">
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-xl">Vắng mặt</span>
                  </div>
                  <div className="absolute inset-0 transition-all duration-300 bg-white/10 group-hover:bg-white/0"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  ) : (
    <div className="h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-blue-100 to-white px-4 py-8">
      <div className="w-full max-w-xl p-8 mx-auto space-y-6 text-center bg-white border border-blue-200 shadow-xl rounded-3xl">
        <h2 className="text-2xl font-bold text-blue-800">
          Chọn quầy và dịch vụ
        </h2>

        {/* Form chọn */}
        <div className="space-y-4 text-left">
          <div>
            <label className="block mb-1 font-semibold text-blue-700">
              Chọn quầy:
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              onChange={(e) => setCounterSelected(e.target.value)}
              value={counterSelected || ""}
            >
              <option value="" disabled>
                -- Chọn quầy --
              </option>
              <option value="1">Quầy số 1</option>
              <option value="2">Quầy số 2</option>
              <option value="3">Quầy số 3</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-blue-700">
              Chọn dịch vụ:
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              onChange={(e) => setServiceSelected(e.target.value)}
              value={serviceSelected || ""}
            >
              <option value="" disabled>
                -- Chọn dịch vụ --
              </option>
              <option value="101">Cấp lại CMND/CCCD</option>
              <option value="102">Đăng ký khai sinh</option>
              <option value="103">Cấp sổ hộ khẩu</option>
            </select>
          </div>
        </div>

        {/* Nút xác nhận */}
        <button
          className={`mt-4 w-full py-3 font-bold text-white rounded-xl transition-all ${
            counterSelected && serviceSelected
              ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!counterSelected || !serviceSelected}
          onChange={onConfirmSelected}
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
