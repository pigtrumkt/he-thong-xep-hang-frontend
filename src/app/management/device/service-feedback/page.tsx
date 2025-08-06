"use client";

import { useEffect, useRef, useState } from "react";

export default function RatingScreen() {
  const [selectedStars, setSelectedStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [serviceName, setServiceName] = useState("-");
  const ratingBoxRef = useRef<HTMLDivElement>(null);
  const thankYouRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Mô phỏng đổi tên dịch vụ sau 1 giây
    setTimeout(() => {
      setServiceName("Đăng ký cư trú");
    }, 1000);
  }, []);

  const handleSubmit = () => {
    if (selectedStars === 0) {
      alert("Vui lòng chọn số sao.");
      return;
    }

    setSubmitted(true);
    if (thankYouRef.current) {
      thankYouRef.current.classList.remove("invisible");
      thankYouRef.current.classList.add("zoom-in");
    }

    setTimeout(() => {
      if (ratingBoxRef.current) {
        ratingBoxRef.current.classList.add("zoom-out");
        setTimeout(() => {
          if (ratingBoxRef.current) {
            ratingBoxRef.current.style.display = "none";
            ratingBoxRef.current.classList.remove("zoom-out");
          }
        }, 400);
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen text-gray-800 bg-gradient-to-br from-sky-50 to-white">
      {/* Header */}
      <header className="w-full px-5 pt-2 pb-10 tracking-wide text-center text-white bg-gradient-to-br from-blue-700 to-blue-500">
        <h1 className="font-bold text-9xl leading-[1.4]">QUẦY SỐ 2</h1>
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
          <div className="w-[30rem] p-8 bg-blue-100 flex flex-col items-center justify-center border-b border-blue-100">
            <p className="text-[2.5rem] font-semibold text-blue-700 text-center">
              MỜI CÔNG DÂN CÓ SỐ
            </p>
            <div className="text-[10rem] text-blue-800 font-extrabold tracking-widest leading-[10rem] zoom-loop">
              1001
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
  );
}
