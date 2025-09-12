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
import { AnimatePresence, motion } from "framer-motion";
import PopupContextMenuDevice, {
  ContextMenuItem,
} from "@/components/popup/PopupContextMenuDevice";

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
  const [serviceNames, setServiceNames] = useState<string[]>([]);
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
  const [passwordMode, setPasswordMode] = useState(0); // 1: toggle fullscreen - 2: chọn lại quầy
  const [autoConnect, setAutoConnect] = useState(false);
  const popupRef = useRef<PopupManagerRef>(null);

  const [adsData, setAdsData] = useState<AdsData>();
  const [isShowAds, setShowAds] = useState<boolean>(false);

  const [serviceIndex, setServiceIndex] = useState(0);

  const { globalFunctions } = useGlobalParams();
  const [listContextMenu, setListContextMenu] = useState<ContextMenuItem[]>([]);

  useEffect(() => {
    if (!globalFunctions) return;
    if (!globalFunctions.hideMenu) return;
    if (!globalFunctions.showMenuByPassword) return;

    const listContextMenu: ContextMenuItem[] = [
      {
        name1: "Chọn quầy khác",
        action1: backAuth,
        hidden: !isReady,
      },
      {
        name1: "Phóng to màn hình",
        action1: toggleFullscreen,
        name2: "Thu nhỏ màn hình",
        action2: toggleFullscreen,
        checkSwitch: () => {
          return !!document.fullscreenElement;
        },
      },
      {
        name1: "Ẩn menu",
        action1: globalFunctions.hideMenu,
        name2: "Hiện menu",
        action2: globalFunctions.showMenuByPassword,
        checkSwitch: () => {
          return localStorage.getItem("isHideMenu") === "true";
        },
      },
    ];

    setListContextMenu(listContextMenu);
  }, [globalFunctions.hideMenu, globalFunctions.showMenuByPassword, isReady]);

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

  // vòng lặp hiển thị serviceNames
  useEffect(() => {
    if (!serviceNames || serviceNames.length === 0) return;

    const intervalServiceNames = setInterval(() => {
      setServiceIndex((prev) => (prev + 1) % serviceNames.length);
    }, 2000);

    return () => {
      clearInterval(intervalServiceNames);
    };
  }, [serviceNames]);

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
      setServiceNames([]);
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
      if (response.serviceNames !== undefined) {
        setServiceNames(response.serviceNames);
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
      target.requestFullscreen?.();
    } else {
      setPasswordInput("");
      setShowPasswordModal(true);
      setPasswordMode(1);
    }
  };

  const backAuth = () => {
    setPasswordInput("");
    setShowPasswordModal(true);
    setPasswordMode(2);
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

  return (
    <div ref={parentRef} className="w-full h-full overflow-hidden">
      {isReady ? (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 to-white">
          {!isShowAds ? (
            <div className="[container-type:size] h-full w-full flex items-center justify-center p-5 bg-[linear-gradient(135deg,#f5f7fa_0%,#c3cfe2_100%)]">
              <div className="[container-type:size] flex aspect-[20/13] [width:min(95cqw,calc(95cqh*20/13))] [height:min(95cqh,calc(95cqw*13/20))] shadow-[0_1em_2em_rgba(0,0,0,0.15)] rounded-[1.5em] bg-white overflow-hidden text-[0.8cqw]">
                {/* LEFT */}
                <div className="relative flex-1 bg-[linear-gradient(to_bottom,#4a6bdf,#2a4ac0)] text-white p-[2em] flex flex-col items-center justify-center text-[0.8cqw]">
                  <div className="mb-[3em] text-center">
                    <div
                      className={` font-semibold mb-2 uppercase ${
                        serviceNames && serviceNames.length !== 0
                          ? "text-[5em]"
                          : "text-[12em]"
                      }`}
                    >
                      {counterNameSelected}
                    </div>
                    {serviceNames && serviceNames.length !== 0 && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={serviceIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-[3em] opacity-90 line-clamp-2 min-h-[3em]"
                        >
                          {serviceNames[serviceIndex] || ""}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>

                  {serviceNames && serviceNames.length !== 0 && (
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
                          alt="Ảnh đại diện"
                          className="object-cover w-full h-full bg-white"
                          onClick={() => setShowAvatarPreview(true)}
                        />
                      </div>
                      <div className="text-[3.2em] font-medium mb-1">
                        {staffName}
                      </div>
                      <div className="text-[2.6em] opacity-90">
                        {StaffPosition}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT */}
                {serviceNames && serviceNames.length !== 0 && (
                  <div className="flex-[1.5] p-[4em] flex flex-col text-[0.82cqw]">
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
                        className={`text-blue-700 text-[2.8em] font-semibold text-center mt-[0.5em] ${
                          submitted ? "" : "invisible"
                        }`}
                      >
                        🎉 Cảm ơn bạn đã phản hồi!
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {showAvatarPreview && (
                <div
                  onClick={() => setShowAvatarPreview(false)}
                  className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center"
                >
                  <img
                    src={`${API_BASE}/accounts/avatar/${
                      staffAvatarUrl
                        ? `${staffAvatarUrl}`
                        : staffGender === 0
                        ? "avatar_default_female.png"
                        : "avatar_default_male.png"
                    }`}
                    alt="Avatar full"
                    className="max-w-full max-h-[90vh] rounded-xl shadow-2xl bg-white"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAvatarPreview(false);
                    }}
                    className="absolute text-3xl font-bold text-white top-4 right-6 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <section className="w-full h-full bg-black">
                <AdsDisplay ads={adsData} />
              </section>
            </>
          )}
        </div>
      ) : (
        <div className="w-full h-full px-4 py-8 bg-gradient-to-br from-blue-100 to-white">
          <div className="w-full max-w-xl p-8 mx-auto space-y-6 text-center bg-white border border-blue-200 shadow-xl rounded-3xl">
            <h2 className="text-2xl font-bold text-blue-800">
              Màn hình tại quầy
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
                    if (passwordMode === 1) {
                      document.exitFullscreen?.();
                    } else if (passwordMode === 2) {
                      handleBack();
                    }
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
      <PopupContextMenuDevice listContextMenu={listContextMenu} />
    </div>
  );
}
