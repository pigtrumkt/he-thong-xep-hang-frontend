"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect vào menu đầu tiên
export default function CentralHomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Lấy tất cả các thẻ <a> trong sidebar
    const firstMenuLink = document.querySelector(
      'aside nav a[href]:not([href="#"])'
    ) as HTMLAnchorElement | null;

    if (firstMenuLink && firstMenuLink.href) {
      const fullUrl = new URL(firstMenuLink.href);
      router.replace(fullUrl.pathname); // redirect nội bộ
    }
  }, [router]);

  return null;
}
