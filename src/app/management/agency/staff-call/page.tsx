"use client";

import { useGlobalParams } from "@/components/ClientWrapper";
import { usePopup } from "@/components/popup/PopupContext";
import PopupManager, { PopupManagerRef } from "@/components/popup/PopupManager";
import { RoleEnum } from "@/constants/Enum";
import { apiGet } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export default function CallPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { socket, globalParams } = useGlobalParams() as {
    socket: Socket;
    globalParams: any;
  };

  const popupRef = useRef<PopupManagerRef>(null);

  const { popupMessage } = usePopup();
  const parentRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<HTMLElement | null>(null);

  const counterIdRef = useRef(null);
  const counterNameRef = useRef(null);
  const serviceIdsRef = useRef<number[]>([]);
  const serviceNamesRef = useRef<string[]>([]);
  const intervalServiceNames = useRef<any>(undefined);

  const [currentNumber, setCurrentNumber] = useState(null);
  const [statusTicket, setStatusTicket] = useState(null);
  const [totalServed, setTotalServed] = useState(null);
  const [waitingAhead, setWaitingAhead] = useState(null);
  const [serviceTimer, setServiceTimer] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState(null);
  const [calledAt, setCalledAt] = useState<Date | null>(null);

  const [serviceIndex, setServiceIndex] = useState(0);

  useEffect(() => {
    // chuyển hướng web khi vào sai trang call
    if (
      [RoleEnum.AGENCY_ADMIN_ROOT, RoleEnum.AGENCY_ADMIN].includes(
        globalParams.user.role_id
      ) &&
      pathname === "/management/agency/staff-call"
    ) {
      if (typeof window !== "undefined") {
        router.replace("/management/agency/call");
        return;
      }
    }

    fetchData();
    document.addEventListener("fullscreenchange", fullscreenHandler);

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(intervalServiceNames.current);
      document.removeEventListener("fullscreenchange", fullscreenHandler);
      window.removeEventListener("resize", handleResize);

      if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
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

  const toggleFullscreen = () => {
    const target = parentRef.current;
    if (!target) return;

    if (!document.fullscreenElement) {
      target.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleResSocket = (response: any) => {
    if (response.status === "success") {
    } else if (response.status === "empty") {
    } else if (response.status === "update") {
      if (response.currentNumber !== undefined)
        setCurrentNumber(response.currentNumber);
      if (response.statusTicket !== undefined) {
        if ([3, 4].includes(response.statusTicket)) {
          setCalledAt(null);
        }
        setStatusTicket(response.statusTicket);
      }

      if (response.ticketId !== undefined) setTicketId(response.ticketId);
      if (response.calledAt !== undefined)
        setCalledAt(new Date(response.calledAt));
      if (response.totalServed !== undefined)
        setTotalServed(response.totalServed);
      if (response.waitingAhead !== undefined)
        setWaitingAhead(response.waitingAhead);
    } else if (response.status === "error") {
      popupRef.current?.showMessage({
        description: response?.message || "Đã xảy ra lỗi",
      });
      return;
    } else if (response.status === "logout") {
      router.push("/login");
    } else {
      popupRef.current?.showMessage({
        title: "Lỗi không xác định",
        description: response?.message,
      });
    }
  };

  const handleCall = async () => {
    if (statusTicket != 2 || currentNumber == null) {
      const confirmed = await popupRef.current?.showConfirm({
        description: "Gọi?",
      });

      if (!confirmed) return;

      socket.emit(
        "action:call",
        {
          counterId: counterIdRef.current,
          counterName: counterNameRef.current,
          serviceIds: serviceIdsRef.current,
          serviceNames: serviceNamesRef.current,
          action: "call",
        },
        (response: any) => {
          handleResSocket(response);
        }
      );
    } else {
      const confirmed = await popupRef.current?.showConfirm({
        description: "Gọi lại?",
      });

      if (!confirmed) return;

      socket.emit(
        "action:call",
        {
          counterId: counterIdRef.current,
          counterName: counterNameRef.current,
          serviceIds: serviceIdsRef.current,
          serviceNames: serviceNamesRef.current,
          currentNumber: currentNumber,
          action: "recall",
        },
        (response: any) => {
          handleResSocket(response);
        }
      );
    }
  };

  const handleDone = async () => {
    const confirmed = await popupRef.current?.showConfirm({
      description: "Phục vụ xong?",
    });

    if (!confirmed) return;

    socket.emit(
      "action:call",
      {
        counterId: counterIdRef.current,
        counterName: counterNameRef.current,
        serviceIds: serviceIdsRef.current,
        serviceNames: serviceNamesRef.current,
        ticketId: ticketId,
        currentNumber: currentNumber,
        action: "done",
      },
      (response: any) => {
        handleResSocket(response);
        if (response.status === "update") {
        }
      }
    );
  };

  const handleMissed = async () => {
    const confirmed = await popupRef.current?.showConfirm({
      description: "Vắng mặt?",
    });

    if (!confirmed) return;

    socket.emit(
      "action:call",
      {
        counterId: counterIdRef.current,
        counterName: counterNameRef.current,
        serviceIds: serviceIdsRef.current,
        serviceNames: serviceNamesRef.current,
        ticketId: ticketId,
        currentNumber: currentNumber,
        action: "missed",
      },
      (response: any) => {
        handleResSocket(response);
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

  const onDisconnect = () => {
    setServiceTimer(null);
    setCurrentNumber(null);
    setStatusTicket(null);
    setTicketId(null);
    setWaitingAhead(null);
    setTotalServed(null);
    setCalledAt(null);
  };

  const connectSocket = () => {
    socket.disconnect();
    socket.removeAllListeners();
    if (!counterIdRef.current) {
      popupMessage({ description: "Chưa chỉ định quầy" });
      return;
    }

    if (!serviceIdsRef.current || serviceIdsRef.current.length === 0) {
      popupMessage({ description: "Chưa chỉ định dịch vụ" });
      return;
    }

    socket.on("connect_error", onConnectError);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("ListingServer", listingServer);

    // connect
    if (!socket.connected) {
      socket.connect();
    }
  };

  const initDataSocket = () => {
    socket.emit(
      "join_call_screen",
      {
        counterId: counterIdRef.current,
        counterName: counterNameRef.current,
        serviceIds: serviceIdsRef.current,
        serviceNames: serviceNamesRef.current,
      },
      (response: any) => {
        handleResSocket(response);
      }
    );
  };

  const listingServer = (res: any) => {
    handleResSocket(res);
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

  const fullscreenHandler = () => {
    if (document.fullscreenElement) handleResize();
    else if (scaleRef.current && parentRef.current) {
      scaleRef.current.style.transform = "";
      parentRef.current.classList.remove("apply-full-screen-css");
    }
  };

  const fetchData = async () => {
    const res = await apiGet("/accounts/me");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 200 && res.data) {
      counterIdRef.current = res.data.assigned_counter_id;
      counterNameRef.current = res.data.assigned_counter_name;

      const serviceIds = [];
      const serviceNames = [];
      for (const service of res.data.assigned_services) {
        serviceIds.push(service.id);
        serviceNames.push(service.name);
      }

      serviceIdsRef.current = serviceIds;
      serviceNamesRef.current = serviceNames;

      connectSocket();

      // vòng lặp hiển thị serviceNames
      if (!intervalServiceNames.current && serviceNamesRef.current.length > 1) {
        intervalServiceNames.current = setInterval(() => {
          setServiceIndex(
            (prev) => (prev + 1) % serviceNamesRef.current.length
          );
        }, 2000);
      }
    } else {
      popupMessage({
        description: "Lỗi không xác định",
      });
    }
  };

  function getScaleFromElement(el: HTMLElement | null): number {
    if (!el) return 1;
    const transform = window.getComputedStyle(el).transform;
    const match = transform.match(/^matrix\(([\d.]+),/);
    return match && match[1] ? parseFloat(match[1]) : 1;
  }

  return (
    <>
      <div
        ref={parentRef}
        className="h-full w-full min-w-[42rem] min-h-[64rem] lg:min-w-[67rem] lg:min-h-[42rem] px-4 py-8 bg-blue-100 select-none"
      >
        <section
          ref={scaleRef}
          className="relative w-[40rem] h-[60rem] lg:w-[65rem] lg:h-[37.8rem] bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-300 m-auto"
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
                  {counterNameRef.current}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={serviceIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-medium text-blue-600"
                  >
                    {serviceNamesRef.current[serviceIndex] || ""}
                  </motion.div>
                </AnimatePresence>
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

        {/* ✅ Popup luôn render bên ngoài - dùng được cho cả hai chế độ */}
        <PopupManager
          ref={popupRef}
          scale={getScaleFromElement(scaleRef.current)}
        />
      </div>
    </>
  );
}
