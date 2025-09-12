"use client";

import { RoleEnum } from "@/constants/Enum";
import { useEffect, useState } from "react";
import { useGlobalParams } from "../ClientWrapper";

export type ContextMenuItem = {
  name1: string;
  action1: () => void | Promise<void>;
  name2?: string;
  action2?: () => void | Promise<void>;
  checkSwitch?: () => boolean;
  hidden?: boolean;
};

interface PopupContextMenuDeviceProps {
  listContextMenu: ContextMenuItem[];
}

export default function PopupContextMenuDevice({
  listContextMenu,
}: PopupContextMenuDeviceProps) {
  const { globalParams } = useGlobalParams();
  const [showContextMenu, setShowContextMenu] = useState(false);

  useEffect(() => {
    if (globalParams.user.role_id !== RoleEnum.DEVICE) return;

    let timer: NodeJS.Timeout | null = null;

    const startHold = () => {
      timer = setTimeout(() => {
        setShowContextMenu(true);
      }, 3000); // 3 giây
    };

    const endHold = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    document.addEventListener("mousedown", startHold);
    document.addEventListener("mouseup", endHold);
    document.addEventListener("touchstart", startHold);
    document.addEventListener("touchend", endHold);

    return () => {
      document.removeEventListener("mousedown", startHold);
      document.removeEventListener("mouseup", endHold);
      document.removeEventListener("touchstart", startHold);
      document.removeEventListener("touchend", endHold);
      if (timer) clearTimeout(timer);
    };
  }, [globalParams.user.role_id]);

  return showContextMenu ? (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-[25rem] text-center">
        <button
          onClick={() => setShowContextMenu(false)}
          className="absolute text-2xl text-gray-400 top-3 right-4 hover:text-red-500"
        >
          ×
        </button>
        <h2 className="mb-6 text-2xl font-bold text-blue-800"></h2>
        <div className="flex flex-col gap-4">
          {listContextMenu.map(
            (item, idx) =>
              !item.hidden && (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.checkSwitch?.()) {
                      item.action2?.();
                    } else {
                      item.action1();
                    }

                    setShowContextMenu(false);
                  }}
                  className="px-6 py-3 text-lg font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600"
                >
                  {item.checkSwitch?.() ? item.name2 : item.name1}
                </button>
              )
          )}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
