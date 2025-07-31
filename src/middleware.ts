import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authorization")?.value;
  const role = request.cookies.get("role")?.value;
  const path = request.nextUrl.pathname;

  // Nếu không có token → chuyển hướng về /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🚪 Điều hướng trang chủ theo role
  if (path === "/") {
    if (role === "1" || role === "2") {
      return NextResponse.redirect(new URL("/central", request.url));
    }

    if (role === "11" || role === "12" || role === "21") {
      return NextResponse.redirect(new URL("/agency", request.url));
    }

    if (role === "31") {
      return NextResponse.redirect(new URL("/device", request.url));
    }
  }

  // 🚫 Nếu là superadmin (role 1 hoặc 2) mà truy cập nhầm /agency
  if ((role === "1" || role === "2") && !path.startsWith("/central")) {
    return NextResponse.redirect(new URL("/central", request.url));
  }

  // 🚫 Nếu là agency/admin/staff (role 11,12,21) mà truy cập nhầm /central
  if (
    (role === "11" || role === "12" || role === "21") &&
    !path.startsWith("/agency")
  ) {
    return NextResponse.redirect(new URL("/agency", request.url));
  }

  // 🚫 Nếu là thiết bị mà truy cập sai vùng khác
  if (role === "31" && !path.startsWith("/device")) {
    return NextResponse.redirect(new URL("/device", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login).*)"],
};
