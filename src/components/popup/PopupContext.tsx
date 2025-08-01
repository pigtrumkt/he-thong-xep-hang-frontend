"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type ConfirmType = "default" | "red";

type AlertType = "green" | "red";

type PopupContextType = {
  alertMessageGreen: (msg: string, duration?: number) => void;
  alertMessageRed: (msg: string, duration?: number) => void;
  popupMessage: (options: {
    title?: string;
    description?: string;
  }) => Promise<void>;
  popupConfirm: (options: {
    title?: string;
    description?: string;
  }) => Promise<boolean>;
  popupConfirmRed: (options: {
    title?: string;
    description?: string;
  }) => Promise<boolean>;
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<{
    message: string;
    type: AlertType;
  } | null>(null);

  const [messagePopup, setMessagePopup] = useState<{
    title?: string;
    description?: string;
    resolve: () => void;
  } | null>(null);

  const [confirmPopup, setConfirmPopup] = useState<{
    title?: string;
    description?: string;
    type: ConfirmType;
    resolve: (result: boolean) => void;
  } | null>(null);

  const alertMessageGreen = useCallback((msg: string, duration = 3000) => {
    setAlert({ message: msg, type: "green" });
    setTimeout(() => setAlert(null), duration);
  }, []);

  const alertMessageRed = useCallback((msg: string, duration = 3000) => {
    setAlert({ message: msg, type: "red" });
    setTimeout(() => setAlert(null), duration);
  }, []);

  const popupMessage = useCallback(
    (options: { title?: string; description?: string }) => {
      return new Promise<void>((resolve) => {
        setMessagePopup({ ...options, resolve });
      });
    },
    []
  );

  const popupConfirm = useCallback(
    (options: { title?: string; description?: string }) => {
      return new Promise<boolean>((resolve) => {
        setConfirmPopup({ ...options, type: "default", resolve });
      });
    },
    []
  );

  const popupConfirmRed = useCallback(
    (options: { title?: string; description?: string }) => {
      return new Promise<boolean>((resolve) => {
        setConfirmPopup({ ...options, type: "red", resolve });
      });
    },
    []
  );

  const closePopupMessage = () => {
    messagePopup?.resolve();
    setMessagePopup(null);
  };

  const handleConfirm = (result: boolean) => {
    confirmPopup?.resolve(result);
    setConfirmPopup(null);
  };

  return (
    <PopupContext.Provider
      value={{
        alertMessageGreen,
        alertMessageRed,
        popupMessage,
        popupConfirm,
        popupConfirmRed,
      }}
    >
      {children}

      {/* Alert Message */}
      {alert && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-out-popup text-sm font-semibold
          ${alert.type === "green" ? "bg-green-400" : "bg-red-400"}`}
        >
          {alert.message}
        </div>
      )}

      {/* Popup Message (OK button) */}
      {messagePopup && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm text-center space-y-2">
            {messagePopup.title && (
              <h2 className="text-lg font-bold text-slate-800">
                {messagePopup.title}
              </h2>
            )}
            {messagePopup.description && (
              <p className="text-base text-slate-600">
                {messagePopup.description}
              </p>
            )}

            <button
              onClick={closePopupMessage}
              className="mt-4 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Popup Confirm */}
      {confirmPopup && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm text-center space-y-2">
            {confirmPopup.title && (
              <h2 className="text-lg font-bold text-slate-800">
                {confirmPopup.title}
              </h2>
            )}
            {confirmPopup.description && (
              <p className="text-base text-slate-600">
                {confirmPopup.description}
              </p>
            )}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-slate-700 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className={`cursor-pointer px-4 py-2 text-white rounded-lg ${
                  confirmPopup.type === "red"
                    ? "bg-red-400 hover:bg-red-500"
                    : "bg-blue-400 hover:bg-blue-500"
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) throw new Error("usePopup must be used within PopupProvider");
  return context;
}
