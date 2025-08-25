"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useGlobalParams } from "@/components/ClientWrapper";
import { usePopup } from "@/components/popup/PopupContext";
import PopupManager, { PopupManagerRef } from "@/components/popup/PopupManager";
import { API_BASE, apiGet, apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

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

export default function RatingScreen() {
  const parentRef = useRef<HTMLDivElement | null>(null);
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
  const [currentNumber, setCurrentNumber] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [staffName, setStaffName] = useState(null);
  const [staffGender, setStaffGender] = useState(null);
  const [StaffPosition, setStaffPosition] = useState(null);
  const [staffAvatarUrl, setStaffAvatarUrl] = useState(null);
  const [statusTicket, setStatusTicket] = useState(null);

  const [selectedStars, setSelectedStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [autoConnect, setAutoConnect] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const popupRef = useRef<PopupManagerRef>(null);

  const [adsData, setAdsData] = useState<AdsData>();
  const [isShowAds, setShowAds] = useState<boolean>(false);
  const delayAdsRef = useRef<NodeJS.Timeout | null>(null);

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
    const res = await apiGet("/advertising/getFeedbackScreenAdvertising");
    if (![200, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 200) {
      const baseImageUrl = `${API_BASE}/advertising/images/`;
      const baseVideoUrl = `${API_BASE}/advertising/videos/`;

      setAdsData({
        type: res.data.feedback_screen_type,
        videoUrl: res.data.feedback_screen_video_url
          ? `${baseVideoUrl}${res.data.feedback_screen_video_url}`
          : undefined,
        videoObjectFit: res.data.feedback_screen_video_object_fit,
        imagesUrl: res.data.feedback_screen_images_url
          ? res.data.feedback_screen_images_url
              .split(",")
              .map((img: string) => `${baseImageUrl}${img.trim()}`)
          : [],
        imagesDuration: res.data.feedback_screen_images_duration,
        imagesObjectFit: res.data.feedback_screen_images_object_fit,
      });
    }
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

  const handleConfirmSelected = () => {
    socket.disconnect();

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
    }

    rememberChoice();
  };

  const onConnectError = () => {
    popupRef.current?.showMessage({
      title: "Mất kết nối",
      description: "Vui lòng thử lại sau.",
    });
  };

  const onConnect = () => {
    setIsReady(true);
    initDataSocket();
  };

  const listingServer = (response: any) => {
    handleListenSocket(response);
  };

  const handleListenSocket = (response: any) => {
    if (response.status === "empty") {
      setTicketId(null);
      setCurrentNumber(null);
      setServiceName(null);
      setStaffName(null);
      setStaffGender(null);
      setStaffPosition(null);
      setStaffAvatarUrl(null);
      setStatusTicket(null);
      setSelectedStars(0);
      setFeedback("");
      showAdsRef.current();
    } else if (response.status === "update") {
      if (response.staffName !== undefined) {
        setStaffName(response.staffName);
      }
      if (response.staffGender !== undefined) {
        setStaffGender(response.staffGender);
      }
      if (response.staffPosition !== undefined) {
        setStaffPosition(response.staffPosition);
      }
      if (response.staffAvatarUrl !== undefined) {
        setStaffAvatarUrl(response.staffAvatarUrl);
      }
      if (response.serviceName !== undefined) {
        setServiceName(response.serviceName);
      }
      if (response.currentNumber !== undefined) {
        setCurrentNumber(response.currentNumber);
        setSelectedStars(0);
        setFeedback("");
        setSubmitted(false);
        hideAds();
      }
      if (response.statusTicket !== undefined) {
        setStatusTicket(response.statusTicket);
        if (response.statusTicket === null) {
          showAdsRef.current();
        }

        if ([3, 4].includes(response.statusTicket)) {
          showAdsRef.current(180000);
        }
      }
      if (response.ticketId !== undefined) {
        setTicketId(response.ticketId);
      }
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

  const initDataSocket = () => {
    socket.emit(
      "join_feedback_screen",
      {
        counterId: counterIdSelected,
      },
      (response: any) => {
        handleListenSocket(response);
      }
    );
  };

  const handleSubmit = async () => {
    if (selectedStars === 0) {
      popupRef.current?.showMessage({ description: "Bạn chưa đánh giá" });
      return;
    }

    const res = await apiPost("/tickets/rating", {
      ticketId,
      rating: selectedStars,
      comment: feedback.trim(),
    });

    if (res.status === 201) {
      setSubmitted(true);
      showAdsRef.current(60000);
    } else {
      popupRef.current?.showMessage({
        description: "Mất kết nối",
      });
    }
  };

  const toggleFullscreen = async () => {
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
      `feedback_screen_selectedCounterId_${accountId}`,
      counterIdSelected.toString()
    );
  };

  const removeRememberChoice = () => {
    const accountId = globalParams.user.id;
    localStorage.removeItem(`feedback_screen_selectedCounterId_${accountId}`);
  };

  useEffect(() => {
    if (!counters || counters.length === 0) {
      return;
    }

    const accountId = globalParams.user.id;
    const rememberedCounterId = localStorage.getItem(
      `feedback_screen_selectedCounterId_${accountId}`
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
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 to-white"
    >
      {/* FULLSCREEN BUTTON */}
      <button
        onClick={toggleFullscreen}
        title="Toàn màn hình"
        className="absolute z-50 p-2 text-gray-600 transition-all border border-gray-200 rounded-lg shadow-sm opacity-10 top-1 right-1 bg-white/80 hover:bg-gray-100 active:scale-90 backdrop-blur-sm"
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
          className="absolute z-50 p-2 text-gray-600 transition-all border border-gray-200 rounded-lg shadow-sm opacity-10 top-1 right-13 bg-white/80 hover:bg-gray-100 active:scale-90 backdrop-blur-sm"
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
        <div className="min-h-screen min-w-screen flex items-center justify-center p-5 bg-[linear-gradient(135deg,#f5f7fa_0%,#c3cfe2_100%)] text-[1vmin]">
          <div className="max-w-[120em] max-h-[78em] aspect-[20/13] w-full h-full bg-white rounded-[1.5em] shadow-[0_1em_2em_rgba(0,0,0,0.15)] overflow-hidden flex">
            {/* LEFT */}
            <div className="flex-1 bg-[linear-gradient(to_bottom,#4a6bdf,#2a4ac0)] text-white p-[2em] flex flex-col items-center justify-center">
              <div className="mb-[6em] text-center">
                <div
                  className={` font-semibold mb-2 uppercase ${
                    serviceName ? "text-[5em]" : "text-[12em]"
                  }`}
                >
                  {counterNameSelected}
                </div>
                {serviceName && (
                  <div className="text-[3em] opacity-90">{serviceName}</div>
                )}
              </div>

              {serviceName && (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-[16em] h-[16em] rounded-full border-[0.6em] border-[rgba(255,255,255,0.3)] overflow-hidden mb-[1em]">
                    <img
                      src={`${API_BASE}/accounts/avatar/${
                        staffAvatarUrl
                          ? `${staffAvatarUrl}`
                          : staffGender === 0
                          ? "avatar_default_female.png"
                          : "avatar_default_male.png"
                      }`}
                      alt="Nhân viên"
                      className="object-cover w-full h-full bg-white"
                    />
                  </div>
                  <div className="text-[3.2em] font-medium mb-1">
                    {staffName}
                  </div>
                  <div className="text-[2.6em] opacity-90">{StaffPosition}</div>
                </div>
              )}
            </div>

            {/* RIGHT */}
            {serviceName && (
              <div className="flex-[1.5] p-[4em] flex flex-col">
                <div className="text-center">
                  <h1 className="text-[4em] text-[#333] font-medium mt-[0.2em]">
                    MỜI CÔNG DÂN SỐ
                  </h1>
                  <div className="text-[15em] font-extrabold text-[#2a4ac0] leading-[1.2em]">
                    {currentNumber || "?"}
                  </div>

                  {/* Stars */}
                  <div className="mb-[2em] mt-[3em]">
                    <div className="flex justify-center gap-[2em]">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const active = value <= selectedStars;
                        return (
                          <button
                            key={value}
                            aria-label={`rate-${value}`}
                            className={`text-[6em] transition-transform ${
                              active
                                ? "text-[#ffc107] scale-110"
                                : "text-[#ddd]"
                            }`}
                            onClick={() => setSelectedStars(value)}
                            disabled={submitted}
                          >
                            <FontAwesomeIcon icon={faStar} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-[2em]">
                    <textarea
                      placeholder="Bạn có góp ý gì thêm không? (Không bắt buộc)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full h-[7.5em] p-[0.8em] border-2 border-[#ddd] rounded-[0.6em] resize-none text-[2.2em] focus:outline-none focus:border-[#4a6bdf] transition-colors"
                      disabled={submitted}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !currentNumber || submitted || selectedStars === 0
                    }
                    className="bg-[#4a6bdf] text-white border-0 px-[1.6em] py-[0.6em] text-[2.5em] rounded-full font-semibold transition-all active:translate-y-0 disabled:opacity-20 disabled:bg-gray-700"
                  >
                    GỬI ĐÁNH GIÁ
                  </button>
                  <p
                    className={`text-blue-700 text-[2.8em] font-semibold text-center mt-[1.2vw] ${
                      submitted ? "" : "invisible"
                    }`}
                  >
                    🎉 Cảm ơn bạn đã phản hồi!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
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
              className="absolute text-2xl text-gray-400 top-3 right-4"
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
                className="px-6 py-2 text-lg font-semibold text-white transition bg-blue-600 rounded-xl"
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
