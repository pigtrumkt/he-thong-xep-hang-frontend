"use client";

import { PermissionEnum, RoleEnum } from "@/constants/Enum";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGlobalParams } from "../ClientWrapper";
export default function SidebarAgencyMenu() {
  const pathname = usePathname();
  const { hasAccess } = useGlobalParams();

  if (
    !hasAccess({
      allowedRoles: [
        RoleEnum.AGENCY_ADMIN,
        RoleEnum.AGENCY_ADMIN_ROOT,
        RoleEnum.AGENCY_STAFF,
      ],
      allowedPermissions: [],
    })
  ) {
    return null;
  }

  const showGroupOperate = hasAccess({
    allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
    allowedPermissions: [PermissionEnum.CALL],
  });
  const showGroupManagement = hasAccess({
    allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
    allowedPermissions: [
      PermissionEnum.COUNTER_VIEW,
      PermissionEnum.SERVICE_VIEW,
      PermissionEnum.ACCOUNT_VIEW,
      PermissionEnum.SETTINGS_VIEW,
    ],
  });

  return (
    <>
      {/* Vận hành */}
      <div>
        {showGroupOperate && (
          <div className="flex items-center mb-2">
            <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
            <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
              Vận hành
            </span>
          </div>
        )}
        <ul className="flex flex-col gap-1 font-semibold text-white">
          {hasAccess({
            allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
            allowedPermissions: [PermissionEnum.CALL],
          }) && (
            <li>
              <Link
                href="/management/agency/call"
                className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                  pathname === "/management/agency/call" ? "active" : ""
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
                    <path d="M22 16.92V19a2 2 0 01-2.18 2A19.72 19.72 0 013 5.18 2 2 0 015 3h2.09a2 2 0 012 1.72c.13 1.13.39 2.23.78 3.29a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006.58 6.58l1.27-1.27a2 2 0 012.11-.45c1.06.39 2.16.65 3.29.78a2 2 0 011.72 2V19z" />
                  </svg>
                </span>
                Gọi
              </Link>
            </li>
          )}
        </ul>
      </div>
      {/* Quản lý */}
      <div>
        {showGroupManagement && (
          <div className="flex items-center mb-2">
            <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
            <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
              Quản lý
            </span>
          </div>
        )}
        <ul className="flex flex-col gap-1 font-semibold text-white">
          {hasAccess({
            allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
            allowedPermissions: [PermissionEnum.COUNTER_VIEW],
          }) && (
            <li>
              <Link
                href="/management/agency/counters-management"
                className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                  pathname === "/management/agency/counters-management"
                    ? "active"
                    : ""
                }`}
              >
                <span className="p-2 text-blue-200 bg-blue-800 rounded-full shadow">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="11"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                    />
                    <rect
                      x="10"
                      y="17"
                      width="4"
                      height="2"
                      rx="0.5"
                      fill="currentColor"
                    />
                    <rect
                      x="8"
                      y="15"
                      width="8"
                      height="2"
                      rx="1"
                      fill="none"
                      stroke="currentColor"
                    />
                    <rect
                      x="7"
                      y="7"
                      width="10"
                      height="2"
                      rx="0.5"
                      fill="currentColor"
                    />
                    <rect
                      x="7"
                      y="10"
                      width="4"
                      height="1"
                      rx="0.5"
                      fill="currentColor"
                    />
                    <rect
                      x="13"
                      y="10"
                      width="4"
                      height="1"
                      rx="0.5"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                Quầy
              </Link>
            </li>
          )}
          {hasAccess({
            allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
            allowedPermissions: [PermissionEnum.SERVICE_VIEW],
          }) && (
            <li>
              <Link
                href="/management/agency/services-management"
                className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                  pathname === "/management/agency/services-management"
                    ? "active"
                    : ""
                }`}
              >
                <span className="p-2 text-blue-200 bg-blue-800 rounded-full shadow">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="4"
                      y="7"
                      width="16"
                      height="11"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                    />
                    <rect
                      x="9"
                      y="4"
                      width="6"
                      height="3"
                      rx="1"
                      fill="none"
                      stroke="currentColor"
                    />
                    <rect
                      x="10.5"
                      y="11.5"
                      width="3"
                      height="2"
                      rx="0.5"
                      fill="currentColor"
                    />
                    <path d="M4 12h16" stroke="currentColor" />
                  </svg>
                </span>
                Dịch vụ
              </Link>
            </li>
          )}
          {hasAccess({
            allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
            allowedPermissions: [PermissionEnum.ACCOUNT_VIEW],
          }) && (
            <li>
              <Link
                href="/management/agency/accounts-management"
                className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                  pathname === "/management/agency/accounts-management"
                    ? "active"
                    : ""
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
                    <path d="M17 21v-2a4 4 0 00-3-3.87M9 21v-2a4 4 0 013-3.87m6-7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                Tài khoản
              </Link>
            </li>
          )}
          {hasAccess({
            allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
            allowedPermissions: [PermissionEnum.SETTINGS_VIEW],
          }) && (
            <li>
              <Link
                href="/management/agency/agency-settings"
                className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                  pathname === "/management/agency/agency-settings"
                    ? "active"
                    : ""
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
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                </span>
                Cài đặt
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
