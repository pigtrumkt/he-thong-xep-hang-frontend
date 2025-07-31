import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`${inter.className} bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200`}
      >
        {children}
      </body>
    </html>
  );
}
