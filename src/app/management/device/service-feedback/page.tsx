"use client";

import { useGlobalParams } from "@/components/ClientWrapper";
import { usePopup } from "@/components/popup/PopupContext";
import { apiGet } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

const host =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "";

export default function RatingScreen() {
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
  const [ticketId, setTicketId] = useState(null);
  const [staffName, setStaffName] = useState(null);
  const [staffGender, setStaffGender] = useState(null);
  const [StaffPosition, setStaffPosition] = useState(null);
  const [staffAvatarUrl, setStaffAvatarUrl] = useState(null);
  const [statusTicket, setStatusTicket] = useState(null);

  const [selectedStars, setSelectedStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const ratingBoxRef = useRef<HTMLDivElement>(null);
  const thankYouRef = useRef<HTMLParagraphElement>(null);

  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

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
    if (response.status === "joined") {
      initDataSocket();
    }

    if (response.status === "update") {
      setTicketId(response.ticketId);
      setCurrentServingNumber(response.currentServingNumber);
      setStatusTicket(response.statusTicket);
    }

    if (response.status === "empty") {
      setTicketId(null);
      setCurrentServingNumber(null);
      setServiceName(null);
      setStaffName(null);
      setStaffGender(null);
      setStaffPosition(null);
      setStaffAvatarUrl(null);
      setStatusTicket(null);
    }
  };

  const initDataSocket = () => {
    socket.emit(
      "join_feedback_screen",
      {
        counterId: counterIdSelected,
      },
      (response: any) => {
        if (response.status === "success") {
        } else if (response.status === "empty") {
          showRatingModal();
          setIsReady(true);
          setTicketId(null);
          setCurrentServingNumber(null);
          setServiceName(null);
          setStaffName(null);
          setStaffGender(null);
          setStaffPosition(null);
          setStaffAvatarUrl(null);
          setStatusTicket(null);
        } else if (response.status === "update") {
          showRatingModal();
          setIsReady(true);
          setTicketId(response.ticketId);
          setCurrentServingNumber(response.currentServingNumber);
          setServiceName(response.serviceName);
          setStaffGender(response.gender);
          setStaffName(response.staffName);
          setStaffPosition(response.staffPosition);
          setStaffAvatarUrl(response.staffAvatarUrl);
          setStatusTicket(null);
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
  }, []);

  const handleSubmit = () => {
    if (selectedStars === 0) {
      popupMessage({ description: "Bạn chưa đánh giá" });
      return;
    }

    setSubmitted(true);
    if (thankYouRef.current) {
      thankYouRef.current.classList.remove("invisible");
      thankYouRef.current.classList.add("zoom-in");
    }

    // hideRatingModal();
  };

  const showRatingModal = () => {
    if (thankYouRef.current) {
      thankYouRef.current.classList.add("invisible");
      thankYouRef.current.classList.remove("zoom-in");
    }

    setSubmitted(false);
  };

  const hideRatingModal = () => {
    if (ratingBoxRef.current) {
      ratingBoxRef.current.classList.add("zoom-out");
      setTimeout(() => {
        if (ratingBoxRef.current) {
          ratingBoxRef.current.style.display = "none";
          ratingBoxRef.current.classList.remove("zoom-out");
        }
      }, 400);
    }
  };

  return isReady ? (
    <div className="flex flex-col items-center justify-start min-h-screen text-gray-800 bg-gradient-to-br from-sky-50 to-white">
      {/* Header */}
      <header className="w-full px-5 pt-2 pb-10 tracking-wide text-center text-white bg-gradient-to-br from-blue-700 to-blue-500">
        <h1 className="font-bold text-9xl leading-[1.4] uppercase">
          {counterNameSelected}
        </h1>
        <p className="transition-opacity duration-300 opacity-100 text-7xl">
          {serviceName}
        </p>
      </header>

      {/* Main content */}
      <main className="flex items-center justify-center flex-1 w-full p-8">
        <div
          ref={ratingBoxRef}
          className="h-[45rem] bg-white rounded-3xl shadow-xl border border-blue-200 overflow-hidden flex animate-zoom-in"
        >
          {/* Số thứ tự */}
          <div className="w-[32rem] p-8 bg-blue-100 flex flex-col items-center justify-center border-b border-blue-100">
            {serviceName && (
              <div className="flex flex-col items-center justify-center ">
                <img
                  src={`${host}/accounts/avatar/${
                    staffAvatarUrl
                      ? `${staffAvatarUrl}?v=${Date.now()}`
                      : staffGender === 0
                      ? "avatar_default_female.png"
                      : "avatar_default_male.png"
                  }`}
                  alt="Avatar"
                  className="object-cover w-32 h-32 mb-3 border-2 shadow-md cursor-pointer border-slate-400"
                  onClick={() => setShowAvatarPreview(true)}
                />
                <p>{staffName}</p>
                <p>{StaffPosition}</p>
              </div>
            )}
            <p className="text-[2.5rem] font-semibold text-blue-700 text-center">
              {currentServingNumber && "MỜI CÔNG DÂN CÓ SỐ"}
            </p>
            <div className="text-[10rem] text-blue-800 font-extrabold tracking-widest leading-[10rem] zoom-loop">
              {currentServingNumber}
            </div>
          </div>
          {/* Đánh giá */}
          <div className="w-[60rem] p-8 flex flex-col items-center justify-center bg-white">
            <h2 className="text-6xl font-bold text-center text-blue-700">
              ĐÁNH GIÁ DỊCH VỤ
            </h2>
            <p className="text-[1.6rem] text-gray-600 pt-10">
              Bạn có hài lòng với chất lượng dịch vụ không?
            </p>

            <div className="flex pb-8 mt-4 gap-x-4 text-7xl">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  className={`transition ${
                    selectedStars >= val ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedStars(val);
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Bạn có góp ý thêm không? (Không bắt buộc)"
              className="w-full rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 text-[1.5rem] focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
              rows={3}
              disabled={submitted}
            />

            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="w-full my-4 bg-blue-600 text-white py-4 rounded-xl font-bold text-[1.5rem] hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gửi phản hồi
            </button>

            <p
              ref={thankYouRef}
              className="invisible text-blue-700 text-xl font-semibold text-center text-[2rem] mt-2"
            >
              🎉 Cảm ơn bạn đã phản hồi!
            </p>
          </div>
        </div>
        {showAvatarPreview && (
          <div
            onClick={() => setShowAvatarPreview(false)}
            className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center"
          >
            <img
              src={`${host}/accounts/avatar/${
                staffAvatarUrl
                  ? `${staffAvatarUrl}?v=${Date.now()}`
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
      </main>

      <style jsx global>{`
        html {
          font-size: 1.2vmin;
        }

        * {
          user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          -webkit-touch-callout: none;
        }

        @keyframes zoomIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes zoomOutFade {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.9);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
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

        .animate-zoom-in {
          animation: zoomIn 0.3s ease-out;
        }

        .zoom-in {
          animation: zoomIn 0.3s ease-out;
        }

        .zoom-out {
          animation: zoomOutFade 0.3s ease-out forwards;
        }

        .zoom-loop {
          animation: zoomLoop 1.8s ease-in-out infinite;
        }

        .animate-press {
          animation: bounce 0.25s ease;
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
