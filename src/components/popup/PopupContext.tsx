"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
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
  popupMessageMobile: (options: {
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
  const [alertVisible, setAlertVisible] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: AlertType;
  } | null>(null);

  const [messageVisible, setMessageVisible] = useState(false);
  const [messagePopup, setMessagePopup] = useState<{
    title?: string;
    description?: string;
    resolve: () => void;
  } | null>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState<{
    title?: string;
    description?: string;
    type: ConfirmType;
    resolve: (result: boolean) => void;
  } | null>(null);

  const [messageMobileVisible, setMessageMobileVisible] = useState(false);
  const [messageMobilePopup, setMessageMobilePopup] = useState<{
    title?: string;
    description?: string;
    resolve: () => void;
  } | null>(null);

  // Refs để quản lý timeout
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alertFadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showAlert = useCallback(
    (type: AlertType, msg: string, duration = 3000) => {
      // Clear các timeout trước
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      if (alertFadeTimeoutRef.current)
        clearTimeout(alertFadeTimeoutRef.current);

      const show = () => {
        setAlert({ message: msg, type });
        setAlertVisible(true);
        alertTimeoutRef.current = setTimeout(() => {
          setAlertVisible(false);
          setTimeout(() => {
            setAlert(null);
            alertTimeoutRef.current = null;
          }, 200);
        }, duration - 200);
      };

      if (alertVisible) {
        setAlertVisible(false);
        alertFadeTimeoutRef.current = setTimeout(show, 200);
      } else {
        show();
      }
    },
    [alertVisible]
  );

  const alertMessageRed = useCallback(
    (msg: string, duration?: number) => {
      showAlert("red", msg, duration);
    },
    [showAlert]
  );

  const alertMessageGreen = useCallback(
    (msg: string, duration?: number) => {
      showAlert("green", msg, duration);
    },
    [showAlert]
  );

  const popupMessage = useCallback(
    (options: { title?: string; description?: string }) => {
      return new Promise<void>((resolve) => {
        setMessagePopup({ ...options, resolve });
        setTimeout(() => setMessageVisible(true), 10);
      });
    },
    []
  );

  const popupMessageMobile = useCallback(
    (options: { title?: string; description?: string }) => {
      return new Promise<void>((resolve) => {
        setMessageMobilePopup({ ...options, resolve });
        setTimeout(() => setMessageMobileVisible(true), 10);
      });
    },
    []
  );

  const popupConfirm = useCallback(
    (options: { title?: string; description?: string }) => {
      return new Promise<boolean>((resolve) => {
        setConfirmPopup({ ...options, type: "default", resolve });
        setTimeout(() => setConfirmVisible(true), 10);
      });
    },
    []
  );

  const popupConfirmRed = useCallback(
    (options: { title?: string; description?: string }) => {
      return new Promise<boolean>((resolve) => {
        setConfirmPopup({ ...options, type: "red", resolve });
        setTimeout(() => setConfirmVisible(true), 10);
      });
    },
    []
  );

  const closePopupMessage = () => {
    setMessageVisible(false);
    setTimeout(() => {
      messagePopup?.resolve();
      setMessagePopup(null);
    }, 100);
  };

  const closePopupMessageMobile = () => {
    setMessageMobileVisible(false);
    setTimeout(() => {
      messageMobilePopup?.resolve();
      setMessageMobilePopup(null);
    }, 100);
  };

  const handleConfirm = (result: boolean) => {
    setConfirmVisible(false);
    setTimeout(() => {
      confirmPopup?.resolve(result);
      setConfirmPopup(null);
    }, 100);
  };

  return (
    <PopupContext.Provider
      value={{
        alertMessageGreen,
        alertMessageRed,
        popupMessage,
        popupMessageMobile,
        popupConfirm,
        popupConfirmRed,
      }}
    >
      {children}

      {/* Alert Message */}
      {alert && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] text-white px-6 py-3 rounded-xl shadow-2xl drop-shadow-2xl text-sm font-semibold
          transition-opacity duration-100 ${
            alertVisible ? "opacity-100" : "opacity-0"
          }
          ${alert.type === "green" ? "bg-green-400" : "bg-red-400"}`}
        >
          {alert.message}
        </div>
      )}

      {/* Popup Message (OK button) */}
      {messagePopup && (
        <div
          className={`fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center transition-opacity duration-100 ${
            messageVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white p-6 rounded-xl shadow-xl min-w-[25rem] max-w-[45rem] text-center space-y-2">
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
              className="px-8 py-2 mt-4 text-white bg-blue-400 rounded-lg hover:bg-blue-500"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Popup Message Mobile */}
      {messageMobilePopup && (
        <div
          className={`fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center transition-opacity duration-100 ${
            messageMobileVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-sm text-center space-y-4">
            {messageMobilePopup.title && (
              <h2 className="text-2xl font-bold text-blue-700">
                {messageMobilePopup.title}
              </h2>
            )}
            {messageMobilePopup.description && (
              <p className="text-lg leading-relaxed text-slate-600">
                {messageMobilePopup.description}
              </p>
            )}
            <button
              onClick={closePopupMessageMobile}
              className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Popup Confirm */}
      {confirmPopup && (
        <div
          className={`fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center transition-opacity duration-100 ${
            confirmVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white p-6 rounded-xl shadow-xl min-w-[25rem] max-w-[45rem] text-center space-y-2">
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
                className="px-4 py-2 bg-gray-200 rounded-lg text-slate-700 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className={`px-4 py-2 text-white rounded-lg ${
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
