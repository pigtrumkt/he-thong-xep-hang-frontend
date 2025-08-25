"use client";

import { useGlobalParams } from "@/components/ClientWrapper";
import { usePopup } from "@/components/popup/PopupContext";
import { API_BASE, apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PopupManager, { PopupManagerRef } from "@/components/popup/PopupManager";

type AdsData = {
  type?: number; // 0:none, 1:images, 2:video
  videoUrl?: string; // link 1 video
  videoObjectFit?: number; // 0: object-contain, 1: object-cover, 2: object-fill, 3: object-none, 4: object-scale-down
  imagesUrl?: string[]; // link nhiều img
  imagesDuration?: number; // thời gian chuyển ảnh
  imagesObjectFit?: number; // 0: object-contain, 1: object-cover, 2: object-fill, 3: object-none, 4: object-scale-down
};

const objectFitClassFromNumber = (n?: number) => {
  const map: Record<number, string> = {
    0: "object-contain",
    1: "object-cover",
    2: "object-fill",
    3: "object-none",
    4: "object-scale-down",
  };
  return map[n ?? 1] || "object-cover";
};

function AdsDisplay({ ads }: { ads?: AdsData }) {
  const [idx, setIdx] = useState(0);

  // Slideshow cho images
  useEffect(() => {
    if (!ads || ads.type !== 1 || !ads.imagesUrl || ads.imagesUrl.length === 0)
      return;
    const durMs = Math.max(1000, (ads.imagesDuration ?? 5) * 1000);
    const t = setTimeout(
      () => setIdx((i) => (i + 1) % ads.imagesUrl!.length),
      durMs
    );
    return () => clearTimeout(t);
  }, [ads, idx]);

  if (!ads || ads.type === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-blue-500">
        Chưa có nội dung quảng cáo
      </div>
    );
  }

  // VIDEO
  if (ads.type === 2 && ads.videoUrl) {
    const fit = objectFitClassFromNumber(ads.videoObjectFit);
    return (
      <video
        src={ads.videoUrl}
        className={`w-full h-full ${fit} bg-black`}
        autoPlay
        loop
        muted
        controls={false}
      />
    );
  }

  // IMAGES
  if (ads.type === 1 && ads.imagesUrl && ads.imagesUrl.length) {
    const cur = ads.imagesUrl[idx] || ads.imagesUrl[0];
    const fit = objectFitClassFromNumber(ads.imagesObjectFit);

    return (
      <div className="relative w-full h-full overflow-hidden bg-black">
        {ads.imagesUrl.map((url, i) => (
          <img
            key={i}
            src={url}
            alt="Quảng cáo"
            className={`absolute inset-0 w-full h-full ${fit} transition-opacity duration-1000 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    );
  }

  return null;
}

export default function CounterStatusScreen() {
  const popupRef = useRef<PopupManagerRef>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { popupMessage } = usePopup();
  const { socket, globalParams } = useGlobalParams() as {
    socket: Socket;
    globalParams: any;
  };
  const [counters, setCounters] = useState<any[]>([]);
  const [counterIdSelected, setCounterIdSelected] = useState<any>(null);
  const counterNameSelectedRef = useRef("");
  const [isReady, setIsReady] = useState<any>(false);

  const serviceIdRef = useRef(null);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [currentNumber, setCurrentNumber] = useState<string | null>(null);
  const [statusTicket, setStatusTicket] = useState<number | null>(null);
  const [screenNotice, setScreenNotice] = useState<string | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoConnect, setAutoConnect] = useState(false);

  const [adsData, setAdsData] = useState<AdsData>();
  const [isShowAds, setShowAds] = useState<boolean>(false);
  const delayAdsRef = useRef<NodeJS.Timeout | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const showAdsRef = useRef<(delay?: number) => void>(() => {});
  showAdsRef.current = (delay = 0) => {
    if (!adsData || adsData.type === 0) {
      return;
    }

    if (delay === 0) {
      setShowAds(true);
    } else {
      if (delayAdsRef.current) clearTimeout(delayAdsRef.current);
      delayAdsRef.current = setTimeout(() => {
        setShowAds(true);
      }, delay);
    }
  };

  const hideAds = () => {
    if (delayAdsRef.current) clearTimeout(delayAdsRef.current);
    setShowAds(false);
  };

  const fetchAds = async () => {
    const res = await apiGet("/advertising/getCounterScreenAdvertising");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 200) {
      const baseImageUrl = `${API_BASE}/advertising/images/`;
      const baseVideoUrl = `${API_BASE}/advertising/videos/`;

      setAdsData({
        type: res.data.counter_status_screen_type,
        videoUrl: res.data.counter_status_screen_video_url
          ? `${baseVideoUrl}${res.data.counter_status_screen_video_url}`
          : undefined,
        videoObjectFit: res.data.counter_status_screen_video_object_fit,
        imagesUrl: res.data.counter_status_screen_images_url
          ? res.data.counter_status_screen_images_url
              .split(",")
              .map((img: string) => `${baseImageUrl}${img.trim()}`)
          : [],
        imagesDuration: res.data.counter_status_screen_images_duration,
        imagesObjectFit: res.data.counter_status_screen_images_object_fit,
      });
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
  };

  const handleResSocket = (response: any) => {
    if (response.status === "success") {
    } else if (response.status === "empty") {
      if (serviceIdRef.current) {
        leaveListenHistory(serviceIdRef.current);
      }

      serviceIdRef.current = null;
      setServiceName(null);
      setCurrentNumber(null);
      setStatusTicket(null);
      setHistory([]);
      showAdsRef.current();
    } else if (response.status === "update") {
      if (response.serviceId) {
        serviceIdRef.current = response.serviceId;
        joinListenHistory(response.serviceId);
      }

      if (response.serviceName !== undefined)
        setServiceName(response.serviceName);

      if (response.currentNumber !== undefined) {
        setCurrentNumber(response.currentNumber);
        hideAds();
      }

      if (response.screenNotice !== undefined)
        setScreenNotice(response.screenNotice);

      if (response.statusTicket !== undefined) {
        setStatusTicket(response.statusTicket);

        if (response.statusTicket === null) {
          showAdsRef.current();
        }

        if ([3, 4].includes(response.statusTicket)) {
          showAdsRef.current(180000);
        }
      }

      if (response.history !== undefined) {
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
  };

  const onConnectError = () => {
    popupMessage({
      title: "Mất kết nối",
      description: "Vui lòng thử lại sau.",
    });
  };

  const onConnect = () => {
    setIsReady(true);
    joinListenSocket();
  };

  const onDisconnect = () => {
    setIsReady(false);
    setServiceName(null);
    setCurrentNumber(null);
    setHistory([]);
    setScreenNotice(null);
    setStatusTicket(null);
  };

  const listingServer = (response: any) => {
    handleResSocket(response);
  };

  const joinListenSocket = () => {
    socket.emit(
      "join_counter_status_screen",
      {
        counterId: counterIdSelected,
      },
      (response: any) => {
        handleResSocket(response);
      }
    );
  };

  const joinListenHistory = (serviceId: number) => {
    socket.emit(
      "counter_status_history_screen",
      {
        serviceId: serviceId,
      },
      (response: any) => {
        handleResSocket(response);
      }
    );
  };

  const leaveListenHistory = (serviceId: number) => {
    socket.emit(
      "leave_counter_status_history_screen",
      {
        serviceId: serviceId,
      },
      (response: any) => {
        handleResSocket(response);
      }
    );
  };

  const handleConfirmSelected = () => {
    socket.disconnect();

    // set name counter
    counterNameSelectedRef.current = counters.find(
      (c) => c.id === counterIdSelected
    )?.name;

    socket.removeAllListeners();
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.on("ListingServer", listingServer);

    // connect
    if (!socket.connected) {
      socket.connect();
    }

    rememberChoice();
  };

  useEffect(() => {
    fetchData();
    fetchAds();

    return () => {
      if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
      }
    };
  }, []);

  const toggleFullscreen = () => {
    const target = parentRef.current;
    if (!target) return;
    if (!document.fullscreenElement) {
      setIsFullscreen(true);
      target.requestFullscreen?.();
    } else {
      setPasswordInput("");
      setShowPasswordModal(true);
    }
  };

  const handleBack = () => {
    if (socket) {
      socket.disconnect();
      socket.removeAllListeners();
    }

    setIsReady(false);
    setCounterIdSelected(null);
    removeRememberChoice();
  };

  // ghi nhớ lựa chọn
  const rememberChoice = () => {
    const accountId = globalParams.user.id;
    localStorage.setItem(
      `counter_screen_selectedCounterId_${accountId}`,
      counterIdSelected.toString()
    );
  };

  const removeRememberChoice = () => {
    const accountId = globalParams.user.id;
    localStorage.removeItem(`counter_screen_selectedCounterId_${accountId}`);
  };

  useEffect(() => {
    if (!counters || counters.length === 0) {
      return;
    }

    const accountId = globalParams.user.id;
    const rememberedCounterId = localStorage.getItem(
      `counter_screen_selectedCounterId_${accountId}`
    );

    if (!rememberedCounterId) {
      return;
    }

    if (
      rememberedCounterId &&
      counters.some((c) => c.id === Number(rememberedCounterId))
    ) {
      setCounterIdSelected(Number(rememberedCounterId));
      setAutoConnect(true);
    }
  }, [counters]);

  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    setAutoConnect(false);
    handleConfirmSelected();
  }, [autoConnect]);

  return isReady ? (
    <div
      ref={parentRef}
      className="relative flex flex-col w-full h-full uppercase"
    >
      {/* FULLSCREEN BUTTON */}
      <button
        onClick={toggleFullscreen}
        title="Toàn màn hình"
        className="absolute z-50 p-2 text-gray-600 transition-all border border-gray-200 rounded-lg shadow-sm opacity-20 top-4 right-4 bg-white/80 hover:bg-gray-100 active:scale-90 backdrop-blur-sm"
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
      {/* BACK BUTTON */}
      {!isFullscreen && (
        <button
          onClick={handleBack}
          title="Quay lại"
          className="absolute z-50 p-2 text-gray-600 transition-all border border-gray-200 rounded-lg shadow-sm opacity-20 top-4 right-16 bg-white/80 hover:bg-gray-100 active:scale-90 backdrop-blur-sm"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6l-6 6 6 6"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
          </svg>
        </button>
      )}
      {!isShowAds ? (
        <>
          {/* HEADER */}
          <header className="px-5 pt-2 pb-10 tracking-wide text-center text-white shadow-md bg-gradient-to-tr from-blue-700 to-blue-500">
            <h1 className="font-bold text-9xl leading-[1.4]">
              {counterNameSelectedRef.current}
            </h1>
            <p className="text-6xl">{serviceName}</p>
          </header>

          {/* MAIN */}
          <main className="flex flex-1 overflow-hidden">
            {/* SỐ CHÍNH */}
            <section className="w-3/4 bg-white flex flex-col items-center justify-center relative mt-[-5rem]">
              <div className="text-6xl font-semibold tracking-wide text-blue-800">
                {statusTicket === 2 && currentNumber && "Mời công dân có số"}
              </div>
              <div className="font-extrabold text-red-500 drop-shadow-lg leading-none text-[20rem] zoom-loop">
                {statusTicket === 2 && currentNumber}
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
                      idx === 0 ? "animate-zoom-in" : ""
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
            <div className="absolute min-w-full text-4xl font-semibold leading-normal text-white whitespace-nowrap animate-scrollText">
              {screenNotice}
            </div>
          </footer>

          {/* STYLES */}
          <style jsx global>{`
            html {
              font-size: 1.2vmin;
              touch-action: manipulation;
              overscroll-behavior: none;
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

            .zoom-loop {
              animation: zoomLoop 1.8s ease-in-out infinite;
            }

            .animate-zoom-in {
              animation: zoomIn 0.3s ease-out;
            }

            .animate-scrollText {
              animation: scrollText 15s linear infinite;
            }
          `}</style>
        </>
      ) : (
        <>
          <section className="w-full h-full bg-black">
            <AdsDisplay ads={adsData} />
          </section>
        </>
      )}

      <PopupManager ref={popupRef} />
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-[30rem]">
            {/* Nút đóng */}
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute text-2xl text-gray-400 top-3 right-4 hover:text-red-500"
            >
              ×
            </button>

            <h2 className="mb-6 text-2xl font-bold text-center text-blue-800">
              Xác thực mật khẩu
            </h2>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            <div className="flex justify-end mt-6">
              <button
                onClick={async () => {
                  const res = await apiPost("/auth/kiosk-verify", {
                    password: passwordInput,
                  });
                  if (res.status === 200) {
                    setIsFullscreen(false);
                    document.exitFullscreen?.();
                  } else {
                    popupRef.current?.showMessage({
                      description: "Sai mật khẩu",
                    });
                  }
                  setShowPasswordModal(false);
                }}
                className="px-6 py-2 text-lg font-semibold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="w-full h-full px-4 py-8 bg-gradient-to-br from-blue-100 to-white">
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
