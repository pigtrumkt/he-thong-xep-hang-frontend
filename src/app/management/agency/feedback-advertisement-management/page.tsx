"use client";

import { useEffect, useRef, useState } from "react";
import NoAdvertisementComponent from "./component/NoAdvertisementComponent";
import ImagesAdvertisementComponent from "./component/ImagesAdvertisementComponent";
import VideoAdvertisementComponent from "./component/VideoAdvertisementComponent";
import { apiGet } from "@/lib/api";
type Mode = 0 | 1 | 2;

type Handles = {
  handleSubmit: () => void;
};

export default function FeedbackScreenAdvertisementManagementPage() {
  const [mode, setMode] = useState<Mode>(0);
  const handlesRef = useRef<Handles>(null);

  const [imageInitialConfig, setImageInitialConfig] = useState<{
    slideDuration: number;
    objectFit: number;
    filenames: string[];
  } | null>(null);

  const [videoInitialConfig, setVideoInitialConfig] = useState<{
    objectFit: number;
    filename: string;
  } | null>(null);

  const fetchInitialConfig = async () => {
    const res = await apiGet("/advertising/getFeedbackScreenAdvertising");
    if (res.status === 200) {
      const data = res.data;
      setMode(data.feedback_screen_type);

      // Hình ảnh
      setImageInitialConfig({
        slideDuration: data.feedback_screen_images_duration ?? 5,
        objectFit: data.feedback_screen_images_object_fit ?? 1,
        filenames: (data.feedback_screen_images_url || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
      });

      // Video
      setVideoInitialConfig({
        objectFit: data.feedback_screen_video_object_fit ?? 1,
        filename: data.feedback_screen_video_url,
      });
    }
  };

  useEffect(() => {
    fetchInitialConfig();
  }, []);

  // Handlers
  const handleChangeMode = (newMode: Mode) => {
    setMode(newMode);
  };

  return (
    <>
      <div className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 mt-6 lg:min-w-[55rem]">
        <div className="relative z-10 mx-auto">
          {/* Mode Selection */}
          <div className="grid grid-cols-3 gap-6">
            {/* No Ads */}
            <button
              onClick={() => handleChangeMode(0)}
              className={`group relative overflow-hidden rounded-xl p-4 text-left border transform ${
                mode === 0
                  ? "bg-gradient-to-br bg-blue-500 to-indigo-600 border-blue-400 text-white shadow-xl"
                  : "bg-white/80 border-blue-300 hover:border-blue-600 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl shadow-lg  ${
                    mode === 0
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  }`}
                >
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.9 4.9 14.2 14.2" />
                  </svg>
                </div>
                <div className="mb-1 text-xl font-bold">Không quảng cáo</div>
              </div>
            </button>

            {/* Image */}
            <button
              onClick={() => handleChangeMode(1)}
              className={`group relative overflow-hidden rounded-xl p-4 text-left border transform ${
                mode === 1
                  ? "bg-gradient-to-br bg-blue-500 to-indigo-600 border-blue-400 text-white shadow-xl"
                  : "bg-white/80 border-blue-300 hover:border-blue-400 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl shadow-lg ${
                    mode === 1
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  }`}
                >
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="14" rx="3" />
                    <path d="m9 12 2 2 4-4" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                  </svg>
                </div>
                <div className="mb-1 text-xl font-bold">Hình ảnh</div>
              </div>
            </button>

            {/* Video */}
            <button
              onClick={() => handleChangeMode(2)}
              className={`group relative overflow-hidden rounded-xl p-4 text-left border transform ${
                mode === 2
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 text-white shadow-xl"
                  : "bg-white/80 border-blue-300 hover:border-blue-400 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl shadow-lg ${
                    mode === 2
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  }`}
                >
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="5" width="14" height="14" rx="2" />
                    <path d="M17 8.5L21 5v14l-4-3.5V8.5z" />
                  </svg>
                </div>
                <div className="mb-1 text-xl font-bold">Video</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 pt-8 mx-4 mt-4 lg:min-w-[55rem]">
        <div className="relative z-10 mx-auto">
          {/* Uploads + Preview */}
          {mode === 0 && (
            <NoAdvertisementComponent
              onHandlesRef={handlesRef}
              onSuccessSubmit={fetchInitialConfig}
            />
          )}
          {mode === 1 && (
            <ImagesAdvertisementComponent
              onHandlesRef={handlesRef}
              initialConfig={imageInitialConfig}
              onSuccessSubmit={fetchInitialConfig}
            />
          )}
          {mode === 2 && (
            <VideoAdvertisementComponent
              onHandlesRef={handlesRef}
              initialConfig={videoInitialConfig}
              onSuccessSubmit={fetchInitialConfig}
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col justify-end gap-6 pt-6 mt-8 border-t sm:flex-row border-slate-300">
            <button
              onClick={() => handlesRef.current?.handleSubmit()}
              className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
