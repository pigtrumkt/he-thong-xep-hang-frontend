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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { usePopup } from "@/components/popup/PopupContext";

function setLoginCookies(token: string, roleId: number, remember: boolean) {
  const days = 365;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  const options = remember ? `; expires=${expires}` : "";
  document.cookie = `authorization=Bearer ${token}; path=/${options}`;
  document.cookie = `roleId=${roleId}; path=/${options}`;
}

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { alertMessageRed, popupMessage } = usePopup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // chặn click nhiều lần
    if (submitting) return;
    setSubmitting(true);

    const res = await apiPost("/auth/login", { username, password });
    if (![200, 400, 401].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      setSubmitting(false);
      return;
    }

    if (res.status === 401 || res.status === 400) {
      alertMessageRed("Tên đăng nhập hoặc mật khẩu không đúng");
      setSubmitting(false);
      return;
    }

    if (!res.data?.accessToken || !res.data?.roleId) {
      popupMessage("Lỗi hệ thống");
      setSubmitting(false);
      return;
    }

    setLoginCookies(res.data.accessToken, res.data.roleId, rememberMe);

    // Chuyển hướng về / để middleware tự định hướng
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 font-inter">
      <div className="fixed inset-0 z-20 flex items-center justify-center px-2">
        <div className="flex flex-col md:flex-row w-[60rem] bg-white/95 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Intro trái */}
          <div className="hidden md:flex flex-col justify-center items-center flex-1 bg-gradient-to-br from-blue-600 to-blue-400 text-white px-8 py-12">
            <div className="w-24 h-24 flex items-center justify-center bg-white/20 rounded-3xl shadow-2xl mb-4">
              <FontAwesomeIcon
                icon={faPeopleGroup}
                className="text-5xl text-white"
              />
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-center drop-shadow-lg mb-7">
              Hệ Thống Xếp Hàng
            </h1>
            <ul className="space-y-4 text-lg">
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="bg-white/30 rounded-full p-2 text-xl"
                />
                Xếp hàng thông minh, tiết kiệm thời gian
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faChartPie}
                  className="bg-white/30 rounded-full p-2 text-xl"
                />
                Báo cáo, thống kê linh hoạt
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faPlug}
                  className="bg-white/30 rounded-full p-2 text-xl"
                />
                Giao diện thân thiện, dễ sử dụng
              </li>
            </ul>
          </div>

          {/* Form phải */}
          <div className="flex-1 flex items-center justify-center bg-white md:bg-transparent px-4 sm:px-10 py-12">
            <form
              className="w-full max-w-md mx-auto space-y-8"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="text-center mb-3">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <FontAwesomeIcon
                    icon={faUserShield}
                    className="text-3xl text-blue-700"
                  />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-8">
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-lg">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <input
                      type="text"
                      name="username"
                      placeholder="Nhập tên đăng nhập"
                      autoComplete="username"
                      required
                      autoFocus
                      className="w-full py-3 pl-11 pr-4 rounded-xl bg-blue-50 border border-blue-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-base text-slate-800 outline-none transition shadow"
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-lg">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <input
                      type="password"
                      name="password"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      required
                      className="w-full py-3 pl-11 pr-4 rounded-xl bg-blue-50 border border-blue-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-base text-slate-800 outline-none transition shadow"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-slate-500 text-sm select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="remember"
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base shadow-lg transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={faSignInAlt} /> Đăng Nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
