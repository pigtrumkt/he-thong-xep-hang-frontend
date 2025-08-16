"use client";

import { useEffect, useRef, useState } from "react";

const mockVideo =
  "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4";

export default function VideoAdvertisementComponent({
  mode,
}: {
  mode: number;
}) {
  const [objectFit, setObjectFit] = useState<string>("cover");
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const handlePickVideoFile = () => videoInputRef.current?.click();

  const onVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files || [])[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (uploadedVideo) URL.revokeObjectURL(uploadedVideo);
    setUploadedVideo(url);

    setCurrentIndex(0);
    e.target.value = "";
  };

  const clearAll = () => {
    if (uploadedVideo) URL.revokeObjectURL(uploadedVideo);
    setUploadedVideo(null);
    setCurrentIndex(0);
  };

  // Map object-fit -> class
  const objectFitClass =
    (
      {
        contain: "object-contain",
        cover: "object-cover",
        fill: "object-fill",
        none: "object-none",
        "scale-down": "object-scale-down",
      } as const
    )[objectFit] || "object-cover";

  useEffect(() => {
    return () => {
      if (uploadedVideo) URL.revokeObjectURL(uploadedVideo);
    };
  }, [uploadedVideo]);

  return (
    <>
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={onVideoSelected}
        className="hidden"
      />

      <div className="grid w-full gap-8 grid-cols-[4fr_3fr]">
        {/* Preview */}
        <div>
          <div className="p-6 border border-blue-400 bg-white/80 rounded-2xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-blue-700">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Xem trước
            </h3>

            <div className="relative w-full overflow-hidden border-2 border-blue-200 shadow-inner aspect-video rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <video
                key={uploadedVideo || mockVideo}
                src={uploadedVideo || mockVideo}
                className={`w-full h-full ${objectFitClass} bg-black`}
                autoPlay
                loop
                muted
                controls
              />
            </div>

            {/* Quick actions for video */}
            <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
              <button
                onClick={handlePickVideoFile}
                className="px-3 py-2 text-xs font-semibold border border-blue-400 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
              >
                + Chọn video
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="px-3 py-2 text-xs font-semibold border border-blue-400 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
                aria-label="Xóa tất cả"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>

        <div className="w-full">
          {/*  Settings */}
          <div className="p-6 mb-8 border border-blue-400 bg-white/90 rounded-2xl">
            <h4 className="flex items-center gap-2 mb-4 font-bold text-blue-700 text-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.31-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .7.4 1.31 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .7.4 1.31 1 1.51h.09a2 2 0 0 1 0 4h-.09c-.7 0-1.31.4-1.51 1z" />
              </svg>
              Cài đặt
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-3 text-sm font-semibold text-blue-700">
                  Kiểu hiển thị
                </label>
                <select
                  value={objectFit}
                  onChange={(e) => setObjectFit(e.target.value)}
                  className="w-full px-4 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="contain">Contain - Hiện toàn bộ</option>
                  <option value="cover">Cover - Phủ đầy khung</option>
                  <option value="fill">Fill - Kéo giãn đầy khung</option>
                  <option value="none">None - Kích thước gốc</option>
                  <option value="scale-down">
                    Scale Down - Tự động co lại
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
