"use client";

import { useEffect, useRef, useState } from "react";

type HistoryItem = {
  counter: number;
  number: number;
  status: "done" | "missed";
  justAdded?: boolean;
};

export default function CounterStatusScreen() {
  const [currentNumber, setCurrentNumber] = useState(1005);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = currentNumber + 1;

      // hiệu ứng số chính
      if (mainRef.current) {
        mainRef.current.classList.remove("pulse-once");
        void mainRef.current.offsetWidth;
        mainRef.current.classList.add("pulse-once");
      }

      setCurrentNumber(next);
      setHistory((prev) => {
        const newItem: HistoryItem = {
          counter: 3,
          number: next - 1,
          status: Math.random() < 0.8 ? "done" : "missed",
          justAdded: true,
        };
        const updated = [...prev, newItem];
        return updated.slice(-4); // giữ lại 4 dòng
      });

      // xoá hiệu ứng sau khi render
      setTimeout(() => {
        setHistory((prev) =>
          prev.map((item) => {
            const { justAdded, ...rest } = item;
            return rest;
          })
        );
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentNumber]);

  return (
    <div className="flex flex-col h-screen font-sans text-gray-800 uppercase bg-blue-50">
      {/* HEADER */}
      <header className="px-5 pt-2 pb-10 tracking-wide text-center text-white shadow-md bg-gradient-to-tr from-blue-700 to-blue-500">
        <h1 className="font-bold text-9xl leading-[1.4]">QUẦY SỐ 3</h1>
        <p className="text-6xl">Đăng ký cư trú</p>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 overflow-hidden">
        {/* SỐ CHÍNH */}
        <section className="w-3/4 bg-white flex flex-col items-center justify-center relative mt-[-5rem]">
          <div className="text-6xl font-semibold tracking-wide text-blue-800">
            Mời công dân có số
          </div>
          <div
            ref={mainRef}
            className="font-extrabold text-red-500 drop-shadow-lg leading-none text-[20rem] zoom-loop"
          >
            {currentNumber}
          </div>
        </section>

        {/* SỐ ĐÃ GỌI */}
        <aside className="flex flex-col w-1/4 p-6 overflow-hidden bg-blue-100">
          <h2 className="flex items-center justify-center gap-2 mb-2 text-5xl font-semibold leading-normal text-center text-blue-800">
            Số đã gọi
          </h2>
          <div className="flex flex-col flex-1 space-y-2 overflow-hidden">
            {[...history].reverse().map((item, idx) => (
              <div
                key={item.number}
                className={`bg-white rounded-xl shadow p-2 text-center border border-blue-400 flex-1 flex flex-col justify-center items-center h-12 ${
                  idx === 0 && item.justAdded
                    ? "animate-zoom-in"
                    : "animate-slide-down"
                }`}
              >
                <div className="text-3xl text-blue-600">
                  Quầy số {item.counter}
                </div>
                <div className="font-bold text-blue-800 text-8xl">
                  {item.number}
                </div>
                <div
                  className={`flex gap-x-1.5 text-3xl mt-2 ${
                    item.status === "done" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <span>{item.status === "done" ? "✔️" : "❌"}</span>
                  <span>
                    {item.status === "done" ? "Đã phục vụ" : "Không có mặt"}
                  </span>
                </div>
              </div>
            ))}
            {/* chèn dòng trống nếu thiếu */}
            {Array.from({ length: Math.max(0, 4 - history.length) }).map(
              (_, i) => (
                <div key={i} className="flex-1 invisible" />
              )
            )}
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-500 h-14">
        <div className="absolute text-4xl font-semibold leading-normal text-white whitespace-nowrap animate-scrollText">
          Vui lòng chuẩn bị giấy tờ khi đến lượt. Xin cảm ơn quý công dân đã hợp
          tác!
        </div>
      </footer>

      {/* STYLES */}
      <style jsx global>{`
        html {
          font-size: 1.2vmin;
          touch-action: manipulation;
          overscroll-behavior: none;
        }
        * {
          user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
        }

        @keyframes scrollText {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes zoomLoop {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.01);
          }
        }

        @keyframes pulseOnce {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes zoomIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          0% {
            transform: translateY(-20%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .zoom-loop {
          animation: zoomLoop 1.8s ease-in-out infinite;
        }

        .pulse-once {
          animation: pulseOnce 0.6s ease;
        }

        .animate-zoom-in {
          animation: zoomIn 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.25s ease-out;
        }

        .animate-scrollText {
          animation: scrollText 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
