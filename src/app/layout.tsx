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
  const roleId = Number((await cookieStore).get("roleId")?.value ?? 0);

  return (
    <html lang="vi">
      <body
        className={`${inter.className} bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200`}
      >
        <ClientWrapper globalParams={{ roleId }}>{children}</ClientWrapper>
      </body>
    </html>
  );
}
