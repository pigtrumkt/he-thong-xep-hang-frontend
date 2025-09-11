import { cookies } from "next/headers";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { API_BASE } from "@/lib/api";
config.autoAddCss = false;

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
      const res = await fetch(`${API_BASE}/accounts/me`, {
        headers: {
          Cookie: `authorization=${token}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const userRes = await res.json();
        user = {
          ...userRes,
          token,
        };
      }
    } catch (err) {}
  }

  const globalFunctionsInit = {};

  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body className="text-[18px] min-h-[100vh] md:min-w-[800px]">
        <ClientWrapper
          globalParamsInit={{ user }}
          globalFunctionsInit={globalFunctionsInit}
        >
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
