"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPeopleGroup,
  faCheck,
  faChartPie,
  faPlug,
  faUserShield,
  faUser,
  faLock,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { usePopup } from "@/components/popup/PopupContext";

const huongDanSuDungArray = JSON.parse(
  process.env.NEXT_PUBLIC_HUONG_DAN_SU_DUNG || "[]"
);

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { alertMessageRed, popupMessage } = usePopup();
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowHelp(false);
      }
    }

    if (showHelp) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showHelp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // chặn click nhiều lần
    if (submitting) return;
    setSubmitting(true);

    const res = await apiPost("/auth/login", {
      username,
      password,
      rememberMe,
    });

    if (![200, 400, 401].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      setSubmitting(false);
      return;
    }

    if (res.status === 401 || res.status === 400) {
      if (res.data.message && res.data.message === "Unauthorized") {
        alertMessageRed("Tên đăng nhập hoặc mật khẩu không đúng");
        setSubmitting(false);
        return;
      } else {
        alertMessageRed(res.data.message);
        setSubmitting(false);
        return;
      }
    }

    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="fixed inset-0 z-20 flex items-center justify-center px-2">
        <div className="flex flex-col md:flex-row w-[60rem] bg-white/95 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Intro trái */}
          <div className="flex-col items-center justify-center flex-1 hidden px-8 py-12 text-white md:flex bg-gradient-to-br from-blue-600 to-blue-400">
            <div className="flex items-center justify-center w-24 h-24 mb-4 shadow-2xl bg-white/20 rounded-3xl">
              <FontAwesomeIcon
                icon={faPeopleGroup}
                className="text-5xl text-white"
              />
            </div>
            <h1 className="text-4xl font-bold leading-tight text-center drop-shadow-lg mb-7">
              Hệ Thống Xếp Hàng
            </h1>
            <ul className="space-y-4 text-lg">
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="p-2 text-xl rounded-full bg-white/30"
                />
                Xếp hàng thông minh, tiết kiệm thời gian
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faChartPie}
                  className="p-2 text-xl rounded-full bg-white/30"
                />
                Báo cáo, thống kê linh hoạt
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faPlug}
                  className="p-2 text-xl rounded-full bg-white/30"
                />
                Giao diện thân thiện, dễ sử dụng
              </li>
            </ul>
          </div>

          {/* Form phải */}
          <div className="flex items-center justify-center flex-1 px-4 py-12 bg-white md:bg-transparent sm:px-10">
            <form
              className="w-full max-w-md mx-auto space-y-8"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="mb-3 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-blue-100 shadow-lg rounded-xl">
                  <FontAwesomeIcon
                    icon={faUserShield}
                    className="text-3xl text-blue-700"
                  />
                </div>
                <h1 className="mb-8 text-2xl font-bold text-slate-800">
                  Đăng Nhập Hệ Thống
                </h1>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-base font-semibold text-slate-700"
                  >
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <span className="absolute text-lg text-blue-400 -translate-y-1/2 left-3 top-1/2">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <input
                      type="text"
                      name="username"
                      placeholder="Nhập tên đăng nhập"
                      autoComplete="username"
                      required
                      autoFocus
                      className="w-full py-3 pr-4 text-base transition border border-blue-200 shadow outline-none pl-11 rounded-xl bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-slate-800"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-base font-semibold text-slate-700"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="absolute text-lg text-blue-400 -translate-y-1/2 left-3 top-1/2">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <input
                      type="password"
                      name="password"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      required
                      className="w-full py-3 pr-4 text-base transition border border-blue-200 shadow outline-none pl-11 rounded-xl bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-slate-800"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-slate-500">
                    <input
                      type="checkbox"
                      name="remember"
                      className="w-4 h-4 cursor-pointer accent-blue-600"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={faSignInAlt} /> Đăng Nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Nút trợ giúp nổi góc phải dưới */}
      <div className="fixed bottom-6 right-6 z-50" ref={helpRef}>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-12 h-12 flex items-center justify-center rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white text-2xl transition"
        >
          ?
        </button>

        {showHelp && (
          <div className="absolute bottom-14 right-0 w-56 bg-white shadow-xl rounded-xl border border-slate-200 p-4 space-y-3 animate-fadeIn">
            <ul className="space-y-2 text-sm text-blue-600 font-medium">
              <ul className="space-y-2 text-sm text-blue-600 font-medium">
                {huongDanSuDungArray.map(
                  (item: { title: string; link: string }, index: number) => (
                    <li key={index}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        onClick={() => setShowHelp(false)}
                      >
                        {item.title}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
