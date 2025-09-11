"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "../globals.css";
import SidebarCentralMenu from "@/components/menus/SidebarCentralMenu";
import { useGlobalParams } from "@/components/ClientWrapper";
import { API_BASE, apiPost } from "@/lib/api";
import PopupChangePassword from "@/components/popup/PopupChangePassword";
import { useRouter } from "next/navigation";
import SidebarAgencyMenu from "@/components/menus/SidebarAgencyMenu";
import SidebarDeviceMenu from "@/components/menus/SidebarDeviceMenu";
import { RoleEnum } from "@/constants/Enum";
import PopupManager, { PopupManagerRef } from "@/components/popup/PopupManager";

function applyDropdownToggle() {
  const avatar = document.getElementById("avatarBtn");
  const menu = document.getElementById("profileMenu");

  const toggleMenu = (e: MouseEvent) => {
    if (!menu || !avatar) return;

    if (avatar.contains(e.target as Node)) {
      if (menu.classList.contains("visible")) {
        hideProfileMenu();
      } else {
        showProfileMenu();
      }
    } else if (!menu.contains(e.target as Node)) {
      hideProfileMenu();
    }
  };

  document.addEventListener("click", toggleMenu);
  return () => document.removeEventListener("click", toggleMenu);
}

function showProfileMenu() {
  const menu = document.getElementById("profileMenu");

  menu?.classList.remove(
    "opacity-0",
    "scale-95",
    "invisible",
    "pointer-events-none"
  );
  menu?.classList.add(
    "opacity-100",
    "scale-100",
    "visible",
    "pointer-events-auto"
  );
}

function hideProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu?.classList.remove(
    "opacity-100",
    "scale-100",
    "visible",
    "pointer-events-auto"
  );
  menu?.classList.add(
    "opacity-0",
    "scale-95",
    "invisible",
    "pointer-events-none"
  );
}

function applyEventBtnLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  const handleLogout = (e: MouseEvent) => {
    e.preventDefault();

    hideProfileMenu();

    // // Xoá cookie client (nếu không phải httpOnly)
    document.cookie =
      "authorization=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    apiPost("/auth/logout", null);

    // Redirect về trang login
    window.location.href = "/login";
  };

  logoutBtn?.addEventListener("click", handleLogout);

  return () => {
    logoutBtn?.removeEventListener("click", handleLogout);
  };
}

export default function ManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { globalParams, loading, setGlobalFunctions } = useGlobalParams();
  const [host, setHost] = useState("");
  const [isHideMenu, setHideMenu] = useState<boolean>(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const popupRef = useRef<PopupManagerRef>(null);

  useEffect(() => {
    setHideMenu(() => {
      return (
        globalParams.user.role_id === RoleEnum.DEVICE &&
        typeof localStorage !== "undefined" &&
        localStorage.getItem("isHideMenu") === "true"
      );
    });

    setHost(API_BASE);

    const cleanup1 = applyDropdownToggle();
    const cleanup2 = applyEventBtnLogout();

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  const showMenuByPassword = () => {
    setPasswordInput("");
    setShowPasswordModal(true);
  };

  const hideMenu = () => {
    if (globalParams.user.role_id !== RoleEnum.DEVICE) {
      return;
    }

    setHideMenu(true);
    localStorage.setItem("isHideMenu", "true");
  };

  const showMenu = () => {
    if (globalParams.user.role_id !== RoleEnum.DEVICE) {
      return;
    }

    setHideMenu(false);
    localStorage.setItem("isHideMenu", "false");
  };

  useEffect(() => {
    setGlobalFunctions((prev: any) => ({
      ...prev,
      hideMenu,
      showMenu,
      showMenuByPassword,
    }));
  }, []);

  return (
    <>
      <div
        className={`relative grid h-screen transition-all duration-200 ease-in-out ${
          isHideMenu
            ? "grid-rows-[0_minmax(0,1fr)]"
            : "grid-rows-[4rem_minmax(0,1fr)]"
        }`}
      >
        {/* Header */}
        <header
          className={`relative z-50 flex items-center justify-between w-full h-16 px-10 transition-all duration-200 ease-in-out ${
            isHideMenu
              ? "-translate-y-full"
              : "translate-y-0 shadow-md backdrop-blur border-b border-blue-200  bg-white/90"
          }`}
        >
          <div className="flex items-center gap-4 select-none">
            <div className="p-2 shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Quản lý xếp hàng
            </h1>
          </div>
          <div className="relative flex items-center gap-3">
            <span className="inline font-medium text-blue-700">
              Xin chào, <b>{globalParams.user.full_name}</b>
            </span>
            <button
              id="avatarBtn"
              className="flex items-center justify-center w-10 h-10 overflow-hidden border-2 border-blue-200 rounded-full shadow select-none focus:ring-2 focus:ring-blue-400"
            >
              {host && (
                <img
                  src={`${host}/accounts/avatar/${
                    globalParams.user.avatar_url
                      ? `${globalParams.user.avatar_url}`
                      : globalParams.user.gender === 0
                      ? "avatar_default_female.png"
                      : "avatar_default_male.png"
                  }`}
                  alt="Avatar"
                  className="object-cover w-full h-full rounded-full"
                />
              )}
            </button>

            <div
              id="profileMenu"
              className={`absolute right-0 top-14 z-50 w-56 bg-white rounded-2xl shadow-xl border border-blue-100 py-3 px-2 transition-all duration-100 origin-top-right scale-95 opacity-0 pointer-events-none invisible`}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  hideProfileMenu();
                  router.push("/management/profile");
                }}
                className="flex items-center gap-3 px-3 py-2 font-semibold text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21v-2a4 4 0 014-4h0a4 4 0 014 4v2" />
                </svg>
                Hồ sơ cá nhân
              </a>
              <a
                href="#"
                onClick={() => {
                  hideProfileMenu();
                  setShowChangePassword(true);
                }}
                className="flex items-center gap-3 px-3 py-2 font-semibold text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17v-7m0 0a2 2 0 10-4 0 2 2 0 004 0zm0 0a2 2 0 104 0 2 2 0 00-4 0z" />
                  <path d="M5 21h14" />
                </svg>
                Đổi mật khẩu
              </a>
              <a
                href="#"
                id="logoutBtn"
                className="flex items-center gap-3 px-3 py-2 font-semibold text-red-600 rounded-lg hover:bg-red-100"
              >
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  <rect x="3" y="5" width="4" height="14" rx="2" />
                </svg>
                Đăng xuất
              </a>
            </div>
          </div>
        </header>

        <div
          className={`
    row-[2] grid min-h-0
    ${isHideMenu ? "grid-cols-[0_1fr]" : "grid-cols-[18rem_1fr]"}
    transition-[grid-template-columns] duration-200 ease-in-out
  `}
        >
          <aside
            className={`min-w-[18rem] bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 border-r border-blue-700 shadow-lg px-3 py-6 overflow-y-auto select-none transition-all duration-200 ease-in-out ${
              isHideMenu ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <nav className="flex flex-col gap-8">
              <SidebarCentralMenu />
              <SidebarAgencyMenu />
              <SidebarDeviceMenu />
            </nav>
          </aside>
          <main className="w-full overflow-y-auto transition-all bg-blue-100">
            {children}
            {loading.visible && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center select-none bg-white/80 backdrop-blur-sm">
                <div className="border-blue-500 rounded-full border-6 w-15 h-15 border-t-transparent animate-spin" />
                <div className="mt-3 text-[1.2rem] font-medium text-blue-700">
                  {loading.progress !== null
                    ? `${loading.message} ${Math.round(loading.progress)}%`
                    : loading.message}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* popup đổi pass */}
        {showChangePassword && (
          <PopupChangePassword onClose={() => setShowChangePassword(false)} />
        )}

        <PopupManager ref={popupRef} />
        {showPasswordModal && (
          <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
            <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-[30rem]">
              {/* Nút đóng */}
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute text-2xl text-gray-400 top-3 right-4 hover:text-red-500"
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
                      showMenu();
                    } else {
                      popupRef.current?.showMessage({
                        description: "Sai mật khẩu",
                      });
                    }
                    setShowPasswordModal(false);
                  }}
                  className="px-6 py-2 text-lg font-semibold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
