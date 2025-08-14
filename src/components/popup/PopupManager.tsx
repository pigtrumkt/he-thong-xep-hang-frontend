"use client";

import { forwardRef, useImperativeHandle, useState, useRef } from "react";

export type PopupMessageOptions = {
  title?: string;
  description?: string;
};

export type PopupConfirmOptions = {
  title?: string;
  description?: string;
};

export type PopupManagerRef = {
  showMessage: (options: PopupMessageOptions) => Promise<void>;
  showConfirm: (options: PopupConfirmOptions) => Promise<boolean>;
};

type PopupManagerProps = {
  scale?: number;
};

const PopupManager = forwardRef<PopupManagerRef, PopupManagerProps>(
  ({ scale = 1 }, ref) => {
    const [messageVisible, setMessageVisible] = useState(false);
    const [messageData, setMessageData] = useState<PopupMessageOptions | null>(
      null
    );
    const messageResolve = useRef<(() => void) | null>(null);

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmData, setConfirmData] = useState<PopupConfirmOptions | null>(
      null
    );
    const confirmResolve = useRef<((value: boolean) => void) | null>(null);

    useImperativeHandle(ref, () => ({
      showMessage(options) {
        return new Promise<void>((resolve) => {
          setMessageData(options);
          setMessageVisible(true);
          messageResolve.current = resolve;
        });
      },
      showConfirm(options) {
        return new Promise<boolean>((resolve) => {
          setConfirmData(options);
          setConfirmVisible(true);
          confirmResolve.current = resolve;
        });
      },
    }));

    const closeMessage = () => {
      setMessageVisible(false);
      messageResolve.current?.();
      messageResolve.current = null;
      setMessageData(null);
    };

    const handleConfirm = (result: boolean) => {
      setConfirmVisible(false);
      confirmResolve.current?.(result);
      confirmResolve.current = null;
      setConfirmData(null);
    };

    const transformStyle =
      scale !== 1
        ? {
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: `scale(${scale}) translate(-50%, -50%)`,
            transformOrigin: "top left",
          }
        : {
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          };

    return (
      <>
        {/* Message Popup */}
        {messageVisible && messageData && (
          <div className="fixed inset-0 z-[9999] bg-black/40">
            <div
              className="p-6 rounded-xl shadow-xl min-w-[22rem] max-w-[90vw] bg-white text-center space-y-2"
              style={transformStyle}
            >
              {messageData.title && (
                <h2 className="text-lg font-bold text-slate-800">
                  {messageData.title}
                </h2>
              )}
              {messageData.description && (
                <p className="text-base text-slate-600">
                  {messageData.description}
                </p>
              )}
              <button
                onClick={closeMessage}
                className="px-6 py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Confirm Popup */}
        {confirmVisible && confirmData && (
          <div className="fixed inset-0 z-[9999] bg-black/40">
            <div
              className="p-6 rounded-xl shadow-xl min-w-[22rem] max-w-[90vw] bg-white text-center space-y-4"
              style={transformStyle}
            >
              {confirmData.title && (
                <h2 className="text-lg font-bold text-slate-800">
                  {confirmData.title}
                </h2>
              )}
              {confirmData.description && (
                <p className="text-base text-slate-600">
                  {confirmData.description}
                </p>
              )}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => handleConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

PopupManager.displayName = "PopupManager";
export default PopupManager;
