import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authorization")?.value;
  const roleId = request.cookies.get("roleId")?.value;
  const path = request.nextUrl.pathname;

  // Nếu không có token → chuyển hướng về /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🚪 Điều hướng trang chủ theo role
  if (path === "/") {
    if (roleId === "1" || roleId === "2") {
      return NextResponse.redirect(new URL("/central/dashboard", request.url));
    }

    if (roleId === "11" || roleId === "12" || role === "21") {
      return NextResponse.redirect(new URL("/agency/dashboard", request.url));
    }

    if (roleId === "31") {
      return NextResponse.redirect(new URL("/device/dashboard", request.url));
    }
  }

  // 🚫 Nếu là superadmin (role 1 hoặc 2) mà truy cập nhầm /agency
  if ((roleId === "1" || roleId === "2") && !path.startsWith("/central")) {
    return NextResponse.redirect(new URL("/central/dashboard", request.url));
  }

  // 🚫 Nếu là agency/admin/staff (role 11,12,21) mà truy cập nhầm /central
  if (
    (roleId === "11" || roleId === "12" || roleId === "21") &&
    !path.startsWith("/agency")
  ) {
    return NextResponse.redirect(new URL("/agency/dashboard", request.url));
  }

  // 🚫 Nếu là thiết bị mà truy cập sai vùng khác
  if (roleId === "31" && !path.startsWith("/device")) {
    return NextResponse.redirect(new URL("/device/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login).*)"],
};
