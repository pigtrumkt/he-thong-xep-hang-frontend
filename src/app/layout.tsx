import { cookies } from "next/headers";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import ClientWrapper from "@/components/ClientWrapper";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const inter = Inter({
  subsets: ["vietnamese"], // hoặc ['latin'] nếu không cần Tiếng Việt
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hệ thống xếp hàng",
  description: "",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  const token = (await cookieStore).get("authorization")?.value;
  let user = {};
  if (token) {
    try {
      const res = await fetch(`http://localhost:3001/accounts/me`, {
        headers: {
          Cookie: `authorization=${token}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        user = await res.json();
      }
    } catch (err) {
      console.error("Lỗi gọi API /accounts/me:", err);
    }
  }

  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body
        className={`${inter.className} text-[18px] min-h-[100vh] min-w-[800px]`}
      >
        <ClientWrapper globalParams={{ user }}>{children}</ClientWrapper>
      </body>
    </html>
  );
}
