import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authorization")?.value;

  // Nếu không có token → chuyển hướng về /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Cho phép truy cập
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|take-number-mobile).*)",
  ], // bỏ qua login, static, favicon
};
