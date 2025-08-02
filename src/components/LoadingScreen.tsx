"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <motion.div
        className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <motion.div
        className="absolute text-lg font-semibold text-blue-600 top-2/3"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        Đang tải dữ liệu...
      </motion.div>
    </div>
  );
}
