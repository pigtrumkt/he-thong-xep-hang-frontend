"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { PopupProvider } from "./popup/PopupContext";

const UserContext = createContext<any>(null);

// Hook để dùng params global
export const useGlobalParams = () => {
  const ctx = useContext(UserContext);
  if (ctx === null) {
    throw new Error("useGlobalParams must be used inside ClientWrapper");
  }
  return ctx;
};

export default function ClientWrapper({
  value,
  children,
}: {
  value: any;
  children: ReactNode;
}) {
  const router = useRouter();
  const [globalParams, setGlobalParams] = useState(value ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!globalParams.user) return;

    const path = window.location.pathname;
    const roleId = globalParams.user["role_id"];
    if (path === "/") {
      if ([1, 2].includes(roleId)) {
        router.replace("/management/central");
        return;
      }
      if ([11, 12, 21].includes(roleId)) {
        router.replace("/management/agency");
        return;
      }
      if (roleId === 31) {
        router.replace("/management/device");
        return;
      }
    }

    if ([1, 2].includes(roleId) && !path.startsWith("/management/central")) {
      router.replace("/management/central");
      return;
    }

    if (
      [11, 12, 21].includes(roleId) &&
      !path.startsWith("/management/agency")
    ) {
      router.replace("/management/agency");
      return;
    }

    if (roleId === 31 && !path.startsWith("/management/device")) {
      router.replace("/management/device");
      return;
    }
  }, [globalParams, router]);

  return (
    <UserContext.Provider value={{ globalParams, setGlobalParams }}>
      <PopupProvider>{children}</PopupProvider>
    </UserContext.Provider>
  );
}
