"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoAdvertisementComponent({
  setLoading,
  setUploadProgress,
  onHandlesRef,
}: {
  setLoading: (val: boolean) => void;
  setUploadProgress: (val: number | null) => void;
  onHandlesRef: any;
}) {
  const [objectFit, setObjectFit] = useState("cover");
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickVideoFile = () => videoInputRef.current?.click();

  const onVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (uploadedVideo) URL.revokeObjectURL(uploadedVideo);
    setUploadedVideo(url);
    e.target.value = "";
  };

  const clearAll = () => {
    if (uploadedVideo) URL.revokeObjectURL(uploadedVideo);
    setUploadedVideo(null);
  };

  const objectFitClass =
    {
      contain: "object-contain",
      cover: "object-cover",
      fill: "object-fill",
      none: "object-none",
      "scale-down": "object-scale-down",
    }[objectFit] || "object-cover";

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

          <div className="relative w-full overflow-hidden border border-blue-200 shadow-inner aspect-video rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            {uploadedVideo ? (
              <video
                src={uploadedVideo}
                className={`w-full h-full ${objectFitClass} bg-black`}
                autoPlay
                loop
                muted
                controls
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-blue-500">
                <svg
                  className="w-12 h-12 mb-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <p className="text-sm font-medium text-center">
                  Chưa có video được chọn
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
            <button
              onClick={handlePickVideoFile}
              className="px-3 py-2 text-xs font-semibold border border-blue-400 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
            >
              + Chọn video
            </button>
            {uploadedVideo && (
              <button
                onClick={clearAll}
                className="px-3 py-2 text-xs font-semibold border border-blue-400 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h4 className="flex items-center gap-2 mb-4 font-bold text-blue-700 text-md">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.31-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .7.4 1.31 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .7.4 1.31 1 1.51h.09a2 2 0 0 1 0 4h-.09c-.7 0-1.31.4-1.51 1z" />
            </svg>
            Cài đặt
          </h4>
          <div>
            <label className="block mb-3 text-sm font-semibold text-blue-700">
              Kiểu hiển thị
            </label>
            <select
              value={objectFit}
              onChange={(e) => setObjectFit(e.target.value)}
              className="w-full px-4 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="contain">Contain - Hiện toàn bộ</option>
              <option value="cover">Cover - Phủ đầy khung</option>
              <option value="fill">Fill - Kéo giãn đầy khung</option>
              <option value="none">None - Kích thước gốc</option>
              <option value="scale-down">Scale Down - Tự động co lại</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
