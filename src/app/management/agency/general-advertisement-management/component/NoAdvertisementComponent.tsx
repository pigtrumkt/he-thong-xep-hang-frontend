"use client";

import { usePopup } from "@/components/popup/PopupContext";
import { apiPost } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NoAdvertisementComponent({
  onHandlesRef,
  onSuccessSubmit,
}: {
  onHandlesRef: any;
  onSuccessSubmit?: () => void;
}) {
  const router = useRouter();
  const { popupMessage } = usePopup();

  const handleSubmit = async () => {
    const res = await apiPost("/advertising/general-status/disable", {});
    if (![201, 400].includes(res.status)) {
      handleApiError(res, popupMessage, router);
      return;
    }

    if (res.status === 201) {
      onSuccessSubmit?.();
      popupMessage({
        description: "Cập nhật thành công",
      });
    } else {
      popupMessage({
        description: "Cập nhật thất bại",
      });
    }
  };

  useEffect(() => {
    if (onHandlesRef) onHandlesRef.current = { handleSubmit };
    return () => {
      if (onHandlesRef) onHandlesRef.current = null;
    };
  }, []);

  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full shadow-lg bg-gradient-to-br from-gray-100 to-gray-200">
        <svg
          className="w-12 h-12 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m4.9 4.9 14.2 14.2" />
        </svg>
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-600">
        Không có quảng cáo
      </h3>
    </div>
  );
}
