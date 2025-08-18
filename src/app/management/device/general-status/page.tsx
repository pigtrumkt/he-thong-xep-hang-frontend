"use client";

import { useGlobalParams } from "@/components/ClientWrapper";
import { usePopup } from "@/components/popup/PopupContext";
import { API_BASE, apiGet } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
      <img
        src={cur}
        className={`w-full h-full ${fit} bg-black`}
        alt="Quảng cáo"
      />
    );
  }

  return null;
}

export default function GeneralStatusScreen() {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { popupMessage } = usePopup();
  const { socket, globalParams } = useGlobalParams() as {
    socket: Socket;
    globalParams: any;
  };

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [agencyName1, setAgencyName1] = useState<string | null>(null);
  const [agencyName2, setAgencyName2] = useState<string | null>(null);
  const [currentNumber, setCurrentNumber] = useState<string | null>(null);
  const [counterName, setCounterName] = useState<string | null>(null);
  const [screenNotice, setScreenNotice] = useState<string | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [adsData, setAdsData] = useState<AdsData>();
  const [isShowAds, setShowAds] = useState<boolean>(false);
  const delayAdsRef = useRef<NodeJS.Timeout | null>(null);

  const showAds = (delay = 0) => {
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

  const hideAds = (delay = 0) => {
    if (delayAdsRef.current) clearTimeout(delayAdsRef.current);
    setShowAds(false);
  };

  const fetchAds = async () => {
    const res = await apiGet("/advertising/getGeneralScreenAdvertising");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 200) {
      const baseImageUrl = `${API_BASE}/advertising/images/`;
      const baseVideoUrl = `${API_BASE}/advertising/videos/`;

      setAdsData({
        type: res.data.general_status_screen_type,
        videoUrl: res.data.general_status_screen_video_url
          ? `${baseVideoUrl}${res.data.general_status_screen_video_url}`
          : undefined,
        videoObjectFit: res.data.general_status_screen_video_object_fit,
        imagesUrl: res.data.general_status_screen_images_url
          ? res.data.general_status_screen_images_url
              .split(",")
              .map((img: string) => `${baseImageUrl}${img.trim()}`)
          : [],
        imagesDuration: res.data.general_status_screen_images_duration,
        imagesObjectFit: res.data.general_status_screen_images_object_fit,
      });
    }
  };

  const handleResSocket = (response: any) => {
    if (response.status === "success") {
    } else if (response.status === "empty") {
      setCurrentNumber(null);
      showAds();
    } else if (response.status === "update") {
      if (response.logoUrl !== undefined) setLogoUrl(response.logoUrl);

      if (response.agencyName1 !== undefined)
        setAgencyName1(response.agencyName1);

      if (response.agencyName2 !== undefined)
        setAgencyName2(response.agencyName2);

      if (response.currentNumber !== undefined) {
        setCurrentNumber(response.currentNumber);
        hideAds();
        showAds(180000);
      }

      if (response.screenNotice !== undefined)
        setScreenNotice(response.screenNotice);

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
    joinListenSocket();
  };

  const onDisconnect = () => {
    setLogoUrl(null);
    setAgencyName1(null);
    setAgencyName2(null);
    setCurrentNumber(null);
    setHistory([]);
    setScreenNotice(null);
  };

  const listingServer = (response: any) => {
    handleResSocket(response);
  };

  const joinListenSocket = () => {
    socket.emit("join_counter_status_screen", {}, (response: any) => {
      handleResSocket(response);
    });
  };

  useEffect(() => {
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
      setIsFullscreen(false);
      document.exitFullscreen?.();
    }
  };
  return;
  <div
    ref={parentRef}
    className="relative flex flex-col w-full h-full uppercase "
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

    {!isShowAds ? (
      <>
        {/* HEADER */}
        <header className="px-8 py-6 tracking-wide text-white shadow-md bg-gradient-to-tr from-blue-700 to-blue-500">
          <div className="flex items-center gap-6 justify-left">
            {logoUrl && (
              <div className="flex-shrink-0">
                <img
                  src={`${API_BASE}/agencies/logos/${logoUrl}`}
                  alt="Logo cơ quan"
                  className="object-contain h-40"
                />
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-6xl font-bold leading-tight">{agencyName1}</p>
              <p className="text-6xl font-bold leading-tight">{agencyName2}</p>
            </div>
          </div>
        </header>
        {/* MAIN */}
        <main className="flex flex-1 overflow-hidden">
          {/* SỐ CHÍNH */}
          <section className="w-3/4 bg-white flex flex-col items-center justify-center relative mt-[-5rem]">
            <div className="text-6xl font-semibold tracking-wide text-blue-800">
              {currentNumber ? "Mời công dân có số" : ""}
            </div>
            <div className="font-extrabold text-red-500 drop-shadow-lg leading-none text-[20rem] zoom-loop">
              {currentNumber ? currentNumber : ""}
            </div>
            <div className="mt-6 text-6xl font-semibold tracking-wide text-red-600">
              {currentNumber ? `Đến ${counterName}` : ""}
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
  </div>;
}
