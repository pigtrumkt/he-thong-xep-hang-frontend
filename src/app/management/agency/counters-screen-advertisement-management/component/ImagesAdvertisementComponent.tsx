"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ImagesAdvertisementComponent({
  mode,
}: {
  mode: number;
}) {
  const mockImages = useMemo(
    () => [
      "https://picsum.photos/800/450?random=1",
      "https://picsum.photos/800/450?random=2",
      "https://picsum.photos/800/450?random=3",
    ],
    []
  );

  const [objectFit, setObjectFit] = useState<string>("cover");
  const [slideDuration, setSlideDuration] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickImageFiles = () => imageInputRef.current?.click();

  const onImagesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const urls = files.map((f) => URL.createObjectURL(f));
    // Thêm vào đầu danh sách để thấy ngay
    setUploadedImages((prev) => [...urls, ...prev]);

    // Chuyển ngay preview tới ảnh vừa thêm đầu tiên
    setCurrentIndex(0);

    // reset input để lần sau chọn lại cùng file vẫn trigger onChange
    e.target.value = "";
  };

  const removeUploadedImage = (idx: number) => {
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
    setCurrentIndex(0);
  };

  const clearAll = () => {
    uploadedImages.forEach((u) => URL.revokeObjectURL(u));
    setUploadedImages([]);
    setCurrentIndex(0);
  };

  const displayImages = useMemo(
    () => [...uploadedImages, ...mockImages],
    [uploadedImages, mockImages]
  );

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
      uploadedImages.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [uploadedImages]);

  // Auto slideshow
  useEffect(() => {
    if (mode === 1) {
      const total = uploadedImages.length + mockImages.length;
      if (total > 1) {
        const timer = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % total);
        }, slideDuration * 1000);
        return () => clearInterval(timer);
      }
    }
  }, [mode, slideDuration, uploadedImages.length, mockImages.length]);
  return (
    <>
      {/* các input ẩn để chọn file */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onImagesSelected}
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
              {displayImages.length ? (
                <>
                  <img
                    src={displayImages[currentIndex]}
                    alt="Preview"
                    className={`w-full h-full transition-all duration-500 ${objectFitClass}`}
                  />
                  {/* Progress bar */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
                      <div className="flex gap-1">
                        {displayImages.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              idx === currentIndex
                                ? "bg-white flex-1"
                                : "bg-white/50 w-1"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid w-full h-full text-blue-600 place-items-center">
                  Chưa có ảnh để hiển thị.
                </div>
              )}
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
              <div>
                <label className="block mb-3 text-sm font-semibold text-blue-700">
                  Thời gian chuyển slide (giây)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={slideDuration}
                    onChange={(e) =>
                      setSlideDuration(Math.max(1, Number(e.target.value)))
                    }
                    className="w-full px-4 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* danh sach tai len image */}
          <div className="w-full p-6 border border-blue-400 bg-white/80 rounded-2xl">
            <div className="flex items-center justify-between mb-4 text-blue-700">
              <h4 className="flex items-center gap-2 font-bold text-md">
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 17H17.01M15.6 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H8.4M12 15V4M12 4L15 7M12 4L9 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Danh sách tải lên
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-2 text-xs font-semibold border border-blue-400 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
                  aria-label="Xóa tất cả"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Uploaded images (đứng trước) */}
              {uploadedImages.map((url, idx) => {
                const globalIndex = idx; // uploaded trước
                return (
                  <div
                    key={`uploaded-${idx}`}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                      globalIndex === currentIndex
                        ? "border-blue-500 shadow-lg shadow-blue-500/25"
                        : "border-blue-200 hover:border-blue-400"
                    }`}
                    onClick={() => {
                      setCurrentIndex(globalIndex);
                    }}
                    style={{ width: 96, height: 96 }}
                    title={`Ảnh đã tải lên ${idx + 1}`}
                  >
                    <img
                      src={url}
                      alt={`Uploaded ${idx + 1}`}
                      className={`w-full h-full ${objectFitClass} bg-gray-100`}
                    />
                    {/* nút xoá nhanh */}
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        removeUploadedImage(idx);
                      }}
                      className="absolute px-1.5 py-0.5 text-xs font-bold text-white transition bg-red-500 rounded top-1 right-1 hover:bg-red-600"
                      aria-label="Xoá ảnh"
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              {/* Mock images (đứng sau) */}
              {mockImages.map((url, idx) => {
                const globalIndex = uploadedImages.length + idx; // sau uploaded
                return (
                  <div
                    key={`mock-${idx}`}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                      globalIndex === currentIndex
                        ? "border-blue-500 shadow-lg shadow-blue-500/25"
                        : "border-blue-200 hover:border-blue-400"
                    }`}
                    onClick={() => {
                      setCurrentIndex(globalIndex);
                    }}
                    style={{ width: 96, height: 96 }}
                    title={`Mẫu ${idx + 1}`}
                  >
                    <img
                      src={url}
                      alt={`Mẫu ${idx + 1}`}
                      className={`w-full h-full ${objectFitClass} bg-gray-100`}
                    />
                    <div className="absolute px-2 py-1 text-xs text-white bg-blue-500 rounded bottom-1 right-1">
                      {idx + 1}
                    </div>
                  </div>
                );
              })}

              {/* Ô cuối cùng: nút tải lên */}
              <button
                type="button"
                onClick={handlePickImageFiles}
                className="flex items-center justify-center transition-all duration-200 border-2 border-blue-300 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50"
                style={{ width: 96, height: 96 }}
                title="Tải lên ảnh"
              >
                <div className="flex flex-col items-center justify-center gap-1 text-blue-600">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-xs font-semibold">Tải lên</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
