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
import { getSocket, getSocketSound } from "@/lib/socket";
import { io, Socket } from "socket.io-client";

const UserContext = createContext<any>(null);

// Hook để dùng params global
export const useGlobalParams = () => {
  const ctx = useContext(UserContext);
  if (ctx === null) {
    throw new Error("useGlobalParams must be used inside ClientWrapper");
  }
  return ctx;
};

export interface AccessConfig {
  allowedRoles?: number[];
  allowedPermissions?: number[];
}

export default function ClientWrapper({
  value,
  children,
}: {
  value: any;
  children: ReactNode;
}) {
  const router = useRouter();
  const [globalParams, setGlobalParams] = useState(value ?? null);
  const [socket, setSocket] = useState<Socket>();
  const [socketSound, setSocketSound] = useState<Socket>();

  const hasAccess = (config: AccessConfig): boolean => {
    if (!globalParams.user && !globalParams.user.id) {
      router.replace("/login");
      return false;
    }

    const { allowedRoles = [], allowedPermissions = [] } = config;

    if (allowedRoles.includes(globalParams.user.role_id)) {
      return true;
    }

    if (
      globalParams.user.permissions &&
      allowedPermissions.some((p) => globalParams.user.permissions.includes(p))
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!globalParams.user) return;

    setSocket(getSocket(globalParams.user.token));
    setSocketSound(getSocketSound(globalParams.user.token));

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

    if (
      [1, 2].includes(roleId) &&
      !path.startsWith("/management/central") &&
      !path.startsWith("/management/profile")
    ) {
      router.replace("/management/central");
      return;
    }

    if (
      [11, 12, 21].includes(roleId) &&
      !path.startsWith("/management/agency") &&
      !path.startsWith("/management/profile")
    ) {
      router.replace("/management/agency");
      return;
    }

    if (
      roleId === 31 &&
      !path.startsWith("/management/device") &&
      !path.startsWith("/management/profile")
    ) {
      router.replace("/management/device");
      return;
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ globalParams, setGlobalParams, hasAccess, socket, socketSound }}
    >
      <PopupProvider>{children}</PopupProvider>
    </UserContext.Provider>
  );
}
