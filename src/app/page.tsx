"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // 👈 chuyển hướng
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center text-gray-500 text-sm">
      Đang chuyển hướng...
    </div>
  );
}
