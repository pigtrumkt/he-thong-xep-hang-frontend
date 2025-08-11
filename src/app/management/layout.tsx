"use client";

import { useEffect, useState, type ReactNode } from "react";
import "../globals.css";
import SidebarCentralMenu from "@/components/menus/SidebarCentralMenu";
import { useGlobalParams } from "@/components/ClientWrapper";
import { API_BASE, apiPost } from "@/lib/api";
import PopupChangePassword from "@/components/popup/PopupChangePassword";
import { useRouter } from "next/navigation";
import SidebarAgencyMenu from "@/components/menus/SidebarAgencyMenu";
import SidebarDeviceMenu from "@/components/menus/SidebarDeviceMenu";

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
  const { globalParams } = useGlobalParams();
  const [host, setHost] = useState("");

  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    setHost(API_BASE);

    const cleanup1 = applyDropdownToggle();
    const cleanup2 = applyEventBtnLogout();

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  return (
    <>
      {/* Header */}
      <header className="relative flex items-center justify-between w-full h-16 px-10 border-b border-blue-200 shadow-md bg-white/90 backdrop-blur z-100">
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
            className="flex items-center justify-center w-10 h-10 overflow-hidden bg-blue-100 border-2 border-blue-200 rounded-full shadow select-none focus:ring-2 focus:ring-blue-400"
          >
            {host && (
              <img
                src={`${host}/accounts/avatar/${
                  globalParams.user.avatar_url
                    ? `${globalParams.user.avatar_url}?v=${Date.now()}`
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

      <div className="min-w-full flex h-[calc(100vh-4rem)]">
        <aside className="min-w-[18rem] bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 border-r border-blue-700 shadow-lg px-3 py-6 overflow-y-auto select-none">
          <nav className="flex flex-col gap-8">
            <SidebarCentralMenu />
            <SidebarAgencyMenu />
            <SidebarDeviceMenu />
          </nav>
        </aside>
        <main className="w-full h-[calc(100vh-4rem)] overflow-y-auto transition-all bg-blue-100">
          {children}
        </main>
      </div>

      {/* popup đổi pass */}
      {showChangePassword && (
        <PopupChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
}
