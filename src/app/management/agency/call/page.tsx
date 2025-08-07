"use client";

import { useGlobalParams } from "@/components/ClientWrapper";
import { usePopup } from "@/components/popup/PopupContext";
import { apiGet } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export default function CounterStatusPage() {
  const router = useRouter();
  const { popupMessage } = usePopup();
  const parentRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<HTMLElement | null>(null);

  const [counters, setCounters] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [counterIdSelected, setCounterIdSelected] = useState<any>(null);
  const [counterNameSelected, setCounterNameSelected] = useState<any>(null);
  const [serviceIdSelected, setServiceIdSelected] = useState<any>(null);
  const [serviceNameSelected, setServiceNameSelected] = useState<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [statusTicket, setStatusTicket] = useState(null);
  const [totalServed, setTotalServed] = useState(null);
  const [waitingAhead, setWaitingAhead] = useState(null);
  const [serviceTimer, setServiceTimer] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState(null);
  const [calledAt, setCalledAt] = useState<Date | null>(null);

  const { socket, globalParams } = useGlobalParams() as {
    socket: Socket;
    globalParams: any;
  };

  const toggleFullscreen = () => {
    const target = parentRef.current;
    if (!target) return;

    if (!document.fullscreenElement) {
      target.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const fetchData = async () => {
    const counterRes = await apiGet("/counters/findActiveByAgency");
    if (![200, 400].includes(counterRes.status)) {
      handleApiError(counterRes, popupMessage, router);
      return;
    }

    if (counterRes.status === 200 && counterRes.data) {
      setCounters(counterRes.data);
    }

    const serviceRes = await apiGet(
      "/services/findGroupedActiveServicesInAgency"
    );
    if (![200, 400].includes(serviceRes.status)) {
      handleApiError(serviceRes, popupMessage, router);
      return;
    }

    if (serviceRes.status === 200 && serviceRes.data) {
      setServices(serviceRes.data);
    }
  };

  const handleConfirmSelected = () => {
    // set name counter
    setCounterNameSelected(
      counters.find((c) => c.id === counterIdSelected)?.name
    );

    // set name service
    setServiceNameSelected(
      services
        .flatMap((g) => g.services)
        .find((s) => s.id === serviceIdSelected)?.name
    );

    socket.removeAllListeners();

    socket.on("connect_error", onConnectError);
    socket.on("connect", onConnect);
    socket.on("ListingServer", listingServer);

    // connect
    if (!socket.connected) {
      socket.connect();
    } else {
      initDataSocket();
    }
  };

  const handleCall = () => {
    if (statusTicket != 2 || currentNumber == null) {
      socket.emit(
        "action:call",
        {
          counterId: counterIdSelected,
          serviceId: serviceIdSelected,
          action: "call",
        },
        (response: any) => {
          if (response.status === "success") {
          } else if (response.status === "empty") {
          } else if (response.status === "update") {
            setCurrentNumber(response.currentServingNumber);
            setStatusTicket(response.statusTicket);
            setTicketId(response.ticketId);
            if (response.calledAt) {
              setCalledAt(new Date(response.calledAt));
            }
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
    } else {
      socket.emit(
        "action:call",
        {
          counterId: counterIdSelected,
          serviceId: serviceIdSelected,
          counterName: counterNameSelected,
          currentServingNumber: currentNumber,
          action: "recall",
        },
        (response: any) => {
          if (response.status === "success") {
          } else if (response.status === "empty") {
          } else if (response.status === "update") {
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
    }
  };

  const handleDone = () => {
    socket.emit(
      "action:call",
      {
        counterId: counterIdSelected,
        serviceId: serviceIdSelected,
        ticketId: ticketId,
        action: "done",
      },
      (response: any) => {
        if (response.status === "success") {
        } else if (response.status === "empty") {
        } else if (response.status === "update") {
          setStatusTicket(response.statusTicket);
          setTotalServed(response.totalServed);
          setCalledAt(null);
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

  const handleMissed = () => {
    socket.emit(
      "action:call",
      {
        counterId: counterIdSelected,
        serviceId: serviceIdSelected,
        ticketId: ticketId,
        action: "missed",
      },
      (response: any) => {
        if (response.status === "success") {
        } else if (response.status === "empty") {
        } else if (response.status === "update") {
          setStatusTicket(response.statusTicket);
          setTotalServed(response.totalServed);
          setCalledAt(null);
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

  const changeService = () => {
    socket.emit(
      "action:call",
      {
        counterId: counterIdSelected,
        serviceId: serviceIdSelected,
        action: "leaveCounter",
      },
      (response: any) => {
        if (socket) {
          socket.disconnect();
        }

        setIsReady(false);
        setCounterIdSelected(null);
        setServiceIdSelected(null);
        setServiceTimer(null);
        setCurrentNumber(null);
        setStatusTicket(null);
        setTicketId(null);
        setWaitingAhead(null);
        setTotalServed(null);
        setCalledAt(null);
      }
    );
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

  const initDataSocket = () => {
    socket.emit(
      "join_call_screen",
      {
        counterId: counterIdSelected,
        serviceId: serviceIdSelected,
      },
      (response: any) => {
        if (response.status === "success") {
        } else if (response.status === "empty") {
        } else if (response.status === "update") {
          setIsReady(true);
          setCurrentNumber(response.currentNumber);
          setStatusTicket(response.statusTicket);
          setTotalServed(response.totalServed);
          setWaitingAhead(response.waitingAhead);
          setTicketId(response.ticketId);
          if (response.calledAt) {
            setCalledAt(new Date(response.calledAt));
          }
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

  const listingServer = (res: any) => {
    if (res.status === "update") {
      setWaitingAhead(res.waitingAhead);
    }
  };

  const handleResize = () => {
    if (!document.fullscreenElement || !scaleRef.current || !parentRef.current)
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

  const fullscreenHandler = () => {
    if (document.fullscreenElement) handleResize();
    else handleExit();
  };

  useEffect(() => {
    fetchData();

    document.addEventListener("fullscreenchange", fullscreenHandler);

    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenHandler);
      window.removeEventListener("resize", handleResize);

      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!calledAt) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - calledAt.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(diffSeconds / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (diffSeconds % 60).toString().padStart(2, "0");
      setServiceTimer(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [calledAt]);

  return isReady ? (
    <div
      ref={parentRef}
      className="h-[calc(100vh-4rem)] w-full min-w-[42rem] min-h-[64rem] lg:min-w-[67rem] lg:min-h-[42rem] px-4 py-8 bg-blue-100 select-none"
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
                  {globalParams.user.full_name}
                </span>
              </div>
            </div>

            {/* Counter info */}
            <div className="mt-6 mb-6 text-center">
              <div className="text-[2rem] font-bold text-blue-800 mb-1">
                {counterNameSelected}
              </div>
              <div className="text-lg font-medium text-blue-600">
                {serviceNameSelected}
              </div>
            </div>

            {/* Queue Number */}
            <div className="relative mb-8 min-w-[20rem]">
              <div className="absolute bg-blue-200 -inset-1 rounded-2xl blur opacity-10" />
              <div className="relative p-8 bg-white border border-blue-100 shadow-lg rounded-2xl">
                <div className="px-4 mb-2 font-extrabold text-center text-blue-600 text-8xl">
                  {currentNumber || (
                    <span className="text-6xl font-light">-</span>
                  )}
                </div>
                <div
                  className={`font-medium text-center ${
                    statusTicket === 2
                      ? "text-blue-600"
                      : statusTicket === 3
                      ? "text-green-600"
                      : statusTicket === 4
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {statusTicket === 2
                    ? "Đang phục vụ"
                    : statusTicket === 3
                    ? "Phục vụ xong"
                    : statusTicket === 4
                    ? "Vắng mặt"
                    : "\u00A0"}
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
                <span className="font-bold text-blue-900">
                  {serviceTimer || "--:--"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid w-full max-w-xs grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-green-100/80 rounded-xl">
                <span className="text-sm font-medium text-green-600">
                  Đã phục vụ
                </span>
                <span className="mt-1 text-xl font-bold text-green-900">
                  {totalServed}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-amber-100/80 rounded-xl">
                <span className="text-sm font-medium text-amber-600">
                  Còn chờ
                </span>
                <span className="mt-1 text-xl font-bold text-amber-900">
                  {waitingAhead}
                </span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="relative flex-1 px-8 py-10 border-t border-gray-200 bg-gray-50 lg:px-12 lg:border-t-0 lg:border-l">
            <button
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 shadow-sm active:scale-[0.98]"
              onClick={() => {
                changeService();
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
              <button
                className={`group relative w-full py-8 px-6 rounded-xl bg-gradient-to-r  text-white font-bold shadow-lg transition-all  overflow-hidden ${
                  statusTicket == 2 && currentNumber
                    ? "from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-[0.98]"
                    : "from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:scale-[0.98]"
                }`}
                onClick={handleCall}
              >
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
                  <span className="text-2xl">
                    {statusTicket == 2 && currentNumber ? "Gọi lại" : "Gọi"}
                  </span>
                </div>
                <div className="absolute inset-0 transition-all duration-300 bg-white/10 group-hover:bg-white/0"></div>
              </button>

              <div className="flex gap-5">
                <button
                  disabled={statusTicket != 2 || currentNumber == null}
                  onClick={handleDone}
                  className={`flex-1 group relative py-7 px-4 rounded-xl font-bold text-white shadow-lg transition-all overflow-hidden
    ${
      statusTicket != 2 || currentNumber == null
        ? "bg-gray-300"
        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98]"
    }
  `}
                >
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

                <button
                  onClick={handleMissed}
                  disabled={statusTicket != 2 || currentNumber == null}
                  className={`
    flex-1 group relative py-7 px-4 rounded-xl font-bold shadow-lg transition-all overflow-hidden
    ${
      statusTicket != 2 || currentNumber == null
        ? "bg-gray-300 text-white"
        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white active:scale-[0.98]"
    }
  `}
                >
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

          <div>
            <label className="block mb-1 font-semibold text-blue-700">
              Chọn dịch vụ:
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              onChange={(e) => setServiceIdSelected(Number(e.target.value))}
              value={serviceIdSelected || ""}
            >
              <option value="" disabled>
                -- Chọn dịch vụ --
              </option>
              {services.map((group) => (
                <optgroup key={group.id} label={group.name}>
                  {group.services.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Nút xác nhận */}
        <button
          className={`mt-4 w-full py-3 font-bold text-white rounded-xl transition-all ${
            counterIdSelected && serviceIdSelected
              ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!counterIdSelected || !serviceIdSelected}
          onClick={handleConfirmSelected}
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
