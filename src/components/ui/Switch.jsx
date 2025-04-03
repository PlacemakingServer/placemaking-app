import { color, motion } from "framer-motion";
import React from "react";

export default function Switch({ checked = false, onChange, disabled = false }) {
  const colors = [["bg-green-500 border-green-500"], ["bg-blue-500 border-blue-500"]];
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border ${
        checked
          ? colors[0][0]
          : "bg-gray-300 border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
    >
      <motion.div
        className="absolute left-1 top-1 justify-center flex items-center h-4 w-4 rounded-full bg-white shadow-md"
        animate={{
          x: checked ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <span className="inline-block h-4 w-4 rounded-full bg-white shadow-md" />
      </motion.div>
    </button>
  );
}
