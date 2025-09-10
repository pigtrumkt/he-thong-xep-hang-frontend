"use client";

import { PermissionEnum, RoleEnum } from "@/constants/Enum";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGlobalParams } from "../ClientWrapper";
export default function SidebarAgencyMenu() {
  const pathname = usePathname();
  const { hasAccess, globalParams } = useGlobalParams();

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

  const showGroupReport = hasAccess({
    allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
    allowedPermissions: [
      PermissionEnum.DAILY_REPORT,
      PermissionEnum.STAFF_REPORT,
      PermissionEnum.SERVICE_REPORT,
      PermissionEnum.DETAIL_STAFF_REPORT,
    ],
  });

  const showAdvertisementManagement = hasAccess({
    allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
    allowedPermissions: [
      PermissionEnum.GENERAL_SCREEN_ADVERTISEMENT_MANAGEMENT,
      PermissionEnum.COUNTER_SCREEN_ADVERTISEMENT_MANAGEMENT,
      PermissionEnum.FEEDBACK_SCREEN_ADVERTISEMENT_MANAGEMENT,
    ],
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
      {showGroupOperate && (
        <div>
          <div className="flex items-center mb-2">
            <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
            <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
              Vận hành
            </span>
          </div>
          <ul className="flex flex-col gap-1 font-semibold text-white">
            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [PermissionEnum.CALL],
            }) &&
              [RoleEnum.AGENCY_ADMIN, RoleEnum.AGENCY_ADMIN_ROOT].includes(
                globalParams.user.role_id
              ) && (
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

            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [PermissionEnum.CALL],
            }) &&
              [RoleEnum.AGENCY_STAFF].includes(globalParams.user.role_id) && (
                <li>
                  <Link
                    href="/management/agency/staff-call"
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                      pathname === "/management/agency/staff-call"
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
                        <path d="M22 16.92V19a2 2 0 01-2.18 2A19.72 19.72 0 013 5.18 2 2 0 015 3h2.09a2 2 0 012 1.72c.13 1.13.39 2.23.78 3.29a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006.58 6.58l1.27-1.27a2 2 0 012.11-.45c1.06.39 2.16.65 3.29.78a2 2 0 011.72 2V19z" />
                      </svg>
                    </span>
                    Gọi
                  </Link>
                </li>
              )}
          </ul>
        </div>
      )}

      {/* Báo cáo */}
      {showGroupReport && (
        <div>
          <div className="flex items-center mb-2">
            <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
            <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
              Báo cáo
            </span>
          </div>

          <ul className="flex flex-col gap-1 font-semibold text-white">
            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [PermissionEnum.DAILY_REPORT],
            }) && (
              <li>
                <Link
                  href="/management/agency/daily-report"
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                    pathname === "/management/agency/daily-report"
                      ? "active"
                      : ""
                  }`}
                >
                  <span className="p-2 text-blue-200 bg-blue-800 rounded-full shadow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  Báo cáo hàng ngày
                </Link>
              </li>
            )}
            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [PermissionEnum.STAFF_REPORT],
            }) && (
              <li>
                <Link
                  href="/management/agency/staff-report"
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                    pathname === "/management/agency/staff-report"
                      ? "active"
                      : ""
                  }`}
                >
                  <span className="p-2 text-blue-200 bg-blue-800 rounded-full shadow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a7.5 7.5 0 0113 0" />
                    </svg>
                  </span>
                  Báo cáo nhân viên
                </Link>
              </li>
            )}
            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [PermissionEnum.SERVICE_REPORT],
            }) && (
              <li>
                <Link
                  href="/management/agency/service-report"
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                    pathname === "/management/agency/service-report"
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
                  Báo cáo dịch vụ
                </Link>
              </li>
            )}
            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [PermissionEnum.DETAIL_STAFF_REPORT],
            }) && (
              <li>
                <Link
                  href="/management/agency/detail-staff-report"
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                    pathname === "/management/agency/detail-staff-report"
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
                      <circle cx="7" cy="8" r="3" />
                      <path d="M4 18c0-2 2-4 3-4s3 2 3 4" />

                      <line x1="14" y1="7" x2="21" y2="7" />
                      <line x1="14" y1="12" x2="21" y2="12" />
                      <line x1="14" y1="17" x2="21" y2="17" />
                    </svg>
                  </span>
                  Báo cáo chi tiết theo nhân viên
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Quảng cáo */}
      {showAdvertisementManagement && (
        <div>
          <div className="flex items-center mb-2">
            <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
            <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
              Quảng cáo
            </span>
          </div>

          <ul className="flex flex-col gap-1 font-semibold text-white">
            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [
                PermissionEnum.GENERAL_SCREEN_ADVERTISEMENT_MANAGEMENT,
              ],
            }) && (
              <li>
                <Link
                  href="/management/agency/general-advertisement-management"
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                    pathname ===
                    "/management/agency/general-advertisement-management"
                      ? "active"
                      : ""
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
            )}
            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [
                PermissionEnum.COUNTER_SCREEN_ADVERTISEMENT_MANAGEMENT,
              ],
            }) && (
              <li>
                <Link
                  href="/management/agency/counters-advertisement-management"
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                    pathname ===
                    "/management/agency/counters-advertisement-management"
                      ? "active"
                      : ""
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
            )}
            {hasAccess({
              allowedRoles: [RoleEnum.AGENCY_ADMIN_ROOT],
              allowedPermissions: [
                PermissionEnum.FEEDBACK_SCREEN_ADVERTISEMENT_MANAGEMENT,
              ],
            }) && (
              <li>
                <Link
                  href="/management/agency/feedback-advertisement-management"
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-600/40 transition-all ${
                    pathname ===
                    "/management/agency/feedback-advertisement-management"
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
            )}
          </ul>
        </div>
      )}

      {/* Quản lý */}
      {showGroupManagement && (
        <div>
          <div className="flex items-center mb-2">
            <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-full mr-2"></span>
            <span className="text-[0.8rem] font-bold text-blue-200 uppercase tracking-wider">
              Quản lý
            </span>
          </div>

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
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a7.5 7.5 0 0113 0" />
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
      )}
    </>
  );
}
