"use client";

import { useGlobalParams } from "@/components/ClientWrapper";
import { usePopup } from "@/components/popup/PopupContext";
import { apiGet } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CounterStatusScreen() {
  const router = useRouter();
  const { popupMessage } = usePopup();
  const { socket, globalParams } = useGlobalParams() as {
    socket: Socket;
    globalParams: any;
  };
  const [counters, setCounters] = useState<any[]>([]);
  const [counterIdSelected, setCounterIdSelected] = useState<any>(null);
  const [counterNameSelected, setCounterNameSelected] = useState<any>(null);
  const [isReady, setIsReady] = useState<any>(false);

  const [currentServingNumber, setCurrentServingNumber] = useState<
    string | null
  >(null);
  const [serviceName, setServiceName] = useState(null);

  const [history, setHistory] = useState<any[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    const counterRes = await apiGet("/counters/findActiveByAgency");
    if (![200, 400].includes(counterRes.status)) {
      handleApiError(counterRes, popupMessage, router);
      return;
    }

    if (counterRes.status === 200 && counterRes.data) {
      setCounters(counterRes.data);
    }
  };

  const onConnectError = () => {
    popupMessage({
      title: "Mất kết nối",
      description: "Vui lòng thử lại sau.",
    });
  };

  const onConnect = () => {
    initDataSocket();
  };

  const listingServer = (response: any) => {
    if (response.status === "update") {
      if (response.currentServingNumber !== undefined) {
        setCurrentServingNumber(response.currentServingNumber);
      }

      if (response.serviceName !== undefined) {
        setServiceName(response.serviceName);
        initDataSocket();
      }

      if (response.history) {
        setHistory((prev) => {
          const incoming = Array.isArray(response.history)
            ? response.history
            : [response.history];

          // thêm vào đầu mảng → item mới ở trước
          const updated = [...incoming, ...prev];

          // lấy 4 phần tử đầu tiên → mới nhất
          return updated.slice(0, 4);
        });
      }
    }

    if (response.status === "empty") {
      setCurrentServingNumber(null);
      setServiceName(null);
      setHistory([]);
    }
  };

  const initDataSocket = () => {
    socket.emit(
      "join_counter_status_screen",
      {
        counterId: counterIdSelected,
      },
      (response: any) => {
        if (response.status === "success") {
        } else if (response.status === "empty") {
          setIsReady(true);
          setCurrentServingNumber(null);
          setHistory([]);
          setServiceName(null);
        } else if (response.status === "update") {
          setIsReady(true);
          setCurrentServingNumber(response.currentServingNumber);
          setHistory(response.history);
          setServiceName(response.serviceName);
        } else if (response.status === "error") {
          popupMessage({
            description: response?.message || "Đã xảy ra lỗi",
          });
          return;
        } else if (response.status === "logout") {
          router.push("/login");
        } else {
          popupMessage({
            title: "Lỗi không xác định",
            description: response?.message,
          });
        }
      }
    );
  };

  const handleConfirmSelected = () => {
    // set name counter
    setCounterNameSelected(
      counters.find((c) => c.id === counterIdSelected)?.name
    );

    socket.removeAllListeners();
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("ListingServer", listingServer);

    // connect
    if (!socket.connected) {
      socket.connect();
    } else {
      initDataSocket();
    }
  };

  useEffect(() => {
    fetchData();

    return () => {
      if (socket) {
        socket.removeAllListeners();
      }
    };
  }, []);

  return isReady ? (
    <div className="flex flex-col h-screen font-sans text-gray-800 uppercase bg-blue-50">
      {/* HEADER */}
      <header className="px-5 pt-2 pb-10 tracking-wide text-center text-white shadow-md bg-gradient-to-tr from-blue-700 to-blue-500">
        <h1 className="font-bold text-9xl leading-[1.4]">
          {counterNameSelected}
        </h1>
        <p className="text-6xl">{serviceName}</p>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 overflow-hidden">
        {/* SỐ CHÍNH */}
        <section className="w-3/4 bg-white flex flex-col items-center justify-center relative mt-[-5rem]">
          <div className="text-6xl font-semibold tracking-wide text-blue-800">
            {currentServingNumber && "Mời công dân có số"}
          </div>
          <div
            ref={mainRef}
            className="font-extrabold text-red-500 drop-shadow-lg leading-none text-[20rem] zoom-loop"
          >
            {currentServingNumber}
          </div>
        </section>

        {/* SỐ ĐÃ GỌI */}
        <aside className="flex flex-col w-1/4 p-6 overflow-hidden bg-blue-100">
          <h2 className="flex items-center justify-center gap-2 mb-2 text-5xl font-semibold leading-normal text-center text-blue-800">
            Số đã gọi
          </h2>
          <div className="flex flex-col flex-1 space-y-2 overflow-hidden">
            {[...history].map((item, idx) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow p-2 text-center border border-blue-400 flex-1 flex flex-col justify-center items-center h-12 ${
                  idx === 0 ? "animate-zoom-in" : "animate-slide-down"
                }`}
              >
                <div className="text-3xl text-blue-600">
                  {item.counter_name}
                </div>
                <div className="font-bold text-blue-800 text-8xl">
                  {item.queue_number}
                </div>
                <div
                  className={`flex gap-x-1.5 text-3xl mt-2 ${
                    item.status === 3 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <span>{item.status === 3 ? "✔️" : "❌"}</span>
                  <span>
                    {item.status === 3 ? "Đã phục vụ" : "Không có mặt"}
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
  ) : (
    <div className="h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-blue-100 to-white px-4 py-8">
      <div className="w-full max-w-xl p-8 mx-auto space-y-6 text-center bg-white border border-blue-200 shadow-xl rounded-3xl">
        <h2 className="text-2xl font-bold text-blue-800">Màn hình tại quầy</h2>

        {/* Form chọn */}
        <div className="space-y-4 text-left">
          <div>
            <label className="block mb-1 font-semibold text-blue-700">
              Chọn quầy:
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              onChange={(e) => setCounterIdSelected(Number(e.target.value))}
              value={counterIdSelected || ""}
            >
              <option value="" disabled>
                -- Chọn quầy --
              </option>
              {counters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nút xác nhận */}
        <button
          className={`mt-4 w-full py-3 font-bold text-white rounded-xl transition-all ${
            counterIdSelected
              ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!counterIdSelected}
          onClick={handleConfirmSelected}
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
