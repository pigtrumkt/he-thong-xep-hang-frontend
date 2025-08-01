"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
export default function SidebarCentralMenu({ roleId }: { roleId: number }) {
  const pathname = usePathname();

  if (![1, 2].includes(roleId)) return null;

  return (
    <div>
      <div className="flex items-center mb-2">
        <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
        <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
          Quản lý
        </span>
      </div>
      <ul className="flex flex-col gap-1 font-semibold text-white">
        <li>
          <Link
            href="/management/central/services-management"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
              pathname === "/management/central/services-management"
                ? "active"
                : ""
            }`}
          >
            <span className="bg-blue-800 text-blue-200 p-2 rounded-full shadow">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <rect x="4" y="7" width="16" height="11" rx="2" />
                <rect x="9" y="4" width="6" height="3" rx="1" />
                <rect
                  x="10.5"
                  y="11.5"
                  width="3"
                  height="2"
                  rx="0.5"
                  fill="currentColor"
                />
                <path d="M4 12h16" />
              </svg>
            </span>
            Dịch vụ
          </Link>
        </li>
        <li>
          <Link
            href="/management/central/agencies-management"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
              pathname === "/management/central/agencies-management"
                ? "active"
                : ""
            }`}
          >
            <span className="bg-blue-800 text-blue-200 p-2 rounded-full shadow">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21h18M9 8h6M10 12h4M11 16h2M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17"
                />
              </svg>
            </span>
            Cơ quan
          </Link>
        </li>
        <li>
          <Link
            href="/management/central/accounts-management"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
              pathname === "/management/central/accounts-management"
                ? "active"
                : ""
            }`}
          >
            <span className="bg-blue-800 text-blue-200 p-2 rounded-full shadow">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 00-3-3.87M9 21v-2a4 4 0 013-3.87m6-7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            Tài khoản
          </Link>
        </li>
      </ul>
    </div>
  );
}
