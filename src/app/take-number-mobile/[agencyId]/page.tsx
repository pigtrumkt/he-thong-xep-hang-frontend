"use client";

import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const { agencyId } = useParams();
  return (
    <div>
      Trang lấy số mobile cho agency: <strong>{agencyId}</strong>
    </div>
  );
}
