"use client";

import { RoleEnum } from "@/constants/Enum";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGlobalParams } from "../ClientWrapper";
import { useEffect, useRef, useState } from "react";
import { usePopup } from "../popup/PopupContext";
import { Socket } from "socket.io-client";

export default function SidebarDeviceMenu() {
  const { popupMessage } = usePopup();
  const { socketSound, globalParams } = useGlobalParams() as {
    socketSound: Socket;
    globalParams: any;
  };
  const pathname = usePathname();
  const { hasAccess } = useGlobalParams();
  const { popupConfirm } = usePopup();
  const [voices, setVoices] = useState<any[] | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  const voice = (message: string) => {
    if (!message) return;

    const chosenVoice =
      voices?.find((v) => v.voiceURI === selectedVoice) || null;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "vi-VN";
    utterance.volume = 1;
    utterance.rate = rate || 1;
    utterance.voice = chosenVoice;
    speechSynthesis.speak(utterance);
  };

  const voiceRef = useRef(voice);
  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  useEffect(() => {
    if (!socketSound) return;

    setSelectedVoice(localStorage.getItem("voice-uri") || "");
    setRate(Number(localStorage.getItem("voice-rate") ?? 1));
    setIsAudioEnabled(localStorage.getItem("audio-enabled") === "true");

    if (localStorage.getItem("audio-enabled") === "true") {
      socketSound.removeAllListeners();
      socketSound.disconnect();

      socketSound.on("connect", onConnect);
      socketSound.on("connect_error", onConnectError);
      socketSound.on("ListingServer", (res) => voiceRef.current(res.message));
      if (!socketSound.connected) {
        socketSound.connect();
      }
    }
  }, [socketSound]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(
        speechSynthesis.getVoices().filter((v) => /(vi|vn)/i.test(v.lang || ""))
      );
    };

    speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, []);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value);
    localStorage.setItem("voice-uri", e.target.value);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRate(Number(e.target.value));
    localStorage.setItem("voice-rate", String(e.target.value));
  };

  const initDataSocket = () => {
    socketSound.emit("join_sound", {}, (response: any) => {});
  };

  const onConnect = () => {
    initDataSocket();
  };

  const onConnectError = () => {
    popupMessage({
      title: "Mất kết nối",
      description: "Vui lòng thử lại sau.",
    });
  };

  const handleSound = async () => {
    const nextValue = !isAudioEnabled;
    const confirm = await popupConfirm({
      title: nextValue ? "Bật phát âm thanh" : "Tắt phát âm thanh",
    });

    if (!confirm) {
      return;
    }
    localStorage.setItem("audio-enabled", String(nextValue));
    socketSound.removeAllListeners();
    socketSound.disconnect();

    setIsAudioEnabled(nextValue);
    if (nextValue) {
      socketSound.on("connect", onConnect);
      socketSound.on("connect_error", onConnectError);
      socketSound.on("ListingServer", (res) => voiceRef.current(res.message));
      if (!socketSound.connected) {
        socketSound.connect();
      }
    }
  };

  if (
    !hasAccess({
      allowedRoles: [RoleEnum.DEVICE],
      allowedPermissions: [],
    })
  ) {
    return null;
  }

  return (
    <>
      <div>
        <div className="flex items-center mb-2">
          <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
          <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
            Màn hình
          </span>
        </div>
        <ul className="flex flex-col gap-1 font-semibold text-white">
          <li>
            <Link
              href="/management/device/take-number"
              className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                pathname === "/management/device/take-number" ? "active" : ""
              }`}
            >
              <span className="p-2 text-blue-200 bg-blue-800 rounded-full shadow">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M4 4h16v16H4z" />
                </svg>
              </span>
              Màn hình lấy số
            </Link>
          </li>
          <li>
            <Link
              href="/management/device/general-status"
              className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                pathname === "/management/device/general-status" ? "active" : ""
              }`}
            >
              <span className="p-2 text-blue-200 bg-blue-800 rounded-full shadow">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {/* khung màn hình */}
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  {/* chân + đế */}
                  <path d="M12 16v4M8 20h8" />
                </svg>
              </span>
              Màn hình chung
            </Link>
          </li>
          <li>
            <Link
              href="/management/device/counter-status"
              className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                pathname === "/management/device/counter-status" ? "active" : ""
              }`}
            >
              <span className="p-2 text-blue-200 bg-blue-800 rounded-full shadow">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Overhead monitor */}
                  <rect x="14" y="3" width="7" height="4" rx="0.8" />
                  <path d="M17.5 7v6" /> {/* giá treo xuống quầy */}
                  {/* Counter desk */}
                  <rect x="3" y="13" width="18" height="5" rx="1" />
                  {/* Staff (head + shoulders) phía sau quầy */}
                  <circle cx="7" cy="10" r="2" />
                  <path d="M5.2 13a3.8 3.8 0 0 1 3.6 0" />
                </svg>
              </span>
              Màn hình quầy
            </Link>
          </li>
          <li>
            <Link
              href="/management/device/service-feedback"
              className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                pathname === "/management/device/service-feedback"
                  ? "active"
                  : ""
              }`}
            >
              <span className="p-2 text-blue-200 bg-blue-800 rounded-full shadow">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 17 7 20 8.5 14 4 10.5 10 10 12 4 14 10 20 10.5 15.5 14 17 20 12 17" />
                </svg>
              </span>
              Màn hình đánh giá
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <div className="flex items-center mb-2">
          <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
          <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
            Phát âm thanh
          </span>
        </div>
        <ul className="flex flex-col gap-1 font-semibold text-white select-none">
          {/* Bật/Tắt âm thanh - KHÔNG đổi phần này của bạn */}
          <li className="relative overflow-hidden transition-all duration-300 ease-out border group rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 backdrop-blur-sm border-slate-600/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20">
            <label className="flex items-center px-4 py-4 transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isAudioEnabled}
                  onChange={handleSound}
                  className="sr-only peer"
                />
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isAudioEnabled
                      ? "bg-green-500/20 text-green-400"
                      : "bg-slate-600/30 text-slate-400 group-hover:text-slate-300"
                  }`}
                >
                  {/* icon loa */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.788L4.036 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.036l4.347-3.788a1 1 0 011.617.788zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <span
                  className={`text-lg transition-all duration-300 ${
                    isAudioEnabled
                      ? "text-green-400 font-semibold"
                      : "text-slate-200 group-hover:text-white"
                  }`}
                >
                  Phát âm thanh
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isAudioEnabled
                      ? "bg-green-400 animate-pulse"
                      : "bg-slate-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-all duration-300 ${
                    isAudioEnabled
                      ? "text-green-300"
                      : "text-slate-400 group-hover:text-slate-300"
                  }`}
                >
                  {isAudioEnabled ? "BẬT" : "TẮT"}
                </span>
              </div>
            </label>
          </li>

          {/* Dropdown chọn giọng */}
          <li className="relative overflow-hidden transition-all duration-300 ease-out border rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 backdrop-blur-sm border-slate-600/30">
            <div className={`flex flex-col gap-4 px-4 py-4`}>
              {/* Chọn giọng đọc */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-600/30 text-slate-300">
                  {/* icon user-voice */}
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 14a5 5 0 005-5V7a5 5 0 10-10 0v2a5 5 0 005 5zm-7 6a7 7 0 0114 0v1H5v-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm text-slate-300">
                    Chọn giọng đọc
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={handleVoiceChange}
                    className="w-full px-1 py-1 border rounded-lg outline-none text-slate-100 bg-slate-800/60 border-slate-600/40 focus:ring-2 focus:ring-blue-500/60 text-[1rem]"
                  >
                    {voices?.length === 0 && (
                      <option value="">(Không có)</option>
                    )}
                    {voices?.map((v, i) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {`Giọng ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slider tốc độ đọc */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-600/30 text-slate-300">
                  {/* icon speed */}
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 3a9 9 0 00-9 9h2a7 7 0 1111.9 5.1l1.4 1.4A9 9 0 0012 3zm0 6a1 1 0 00-1 1v4l3 3 1.4-1.4-2.4-2.4V10a1 1 0 00-1-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm text-slate-300">
                    Tốc độ đọc:{" "}
                    <span className="font-medium text-slate-200">
                      {rate.toFixed(2)}x
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={rate}
                    onChange={handleRateChange}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </div>
              {/* Nút phát thử */}
              <button
                type="button"
                onClick={() =>
                  voice("Mời công dân có số, 1...2...3 ,đến quầy số 1")
                }
                className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Phát thử
              </button>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}
