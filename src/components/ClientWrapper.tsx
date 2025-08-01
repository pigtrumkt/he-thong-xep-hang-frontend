"use client";

import { createContext, ReactNode, useContext } from "react";
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

// Wrapper truyền mọi object vào value
export default function ClientWrapper({
  globalParams,
  children,
}: {
  globalParams: any;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={globalParams}>
      <PopupProvider>{children}</PopupProvider>
    </UserContext.Provider>
  );
}
