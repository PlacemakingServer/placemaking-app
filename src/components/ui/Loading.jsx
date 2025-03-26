"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.div
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </motion.div>
  );
}
