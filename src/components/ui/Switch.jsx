import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import React from "react";

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  type = "toggle", // "toggle", "arrow", "checkbox", "eye"
}) {
  const baseBtn =
    "flex items-center gap-2 px-3 py-1 text-sm rounded-md border transition-all duration-200 shadow-sm " +
    "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500";

  const interactive = !disabled
    ? "hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
    : "opacity-50 cursor-not-allowed";

  if (type === "arrow") {
    return (
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-transparent shadow-sm hover:bg-gray-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {checked ? (
            <motion.div
              key="up"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="w-4 h-4 text-green-600" />
            </motion.div>
          ) : (
            <motion.div
              key="down"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-green-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  if (type === "eye") {
    return (
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`${baseBtn} ${interactive}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {checked ? (
            <motion.div
              key="eye"
              className="flex items-center gap-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              Exibir <Eye className="w-4 h-4 text-green-600" />
            </motion.div>
          ) : (
            <motion.div
              key="eyeoff"
              className="flex items-center gap-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              Ocultar <EyeOff className="w-4 h-4 text-gray-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  if (type === "checkbox") {
    return (
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`flex items-center justify-center w-5 h-5 rounded border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
          checked
            ? "bg-green-600 border-green-700"
            : "bg-white border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  // toggle switch padrão
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
        checked
          ? "bg-green-600 border-green-700"
          : "bg-gray-300 border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
    >
      <motion.div
        className="absolute left-1 flex items-center justify-center h-4 w-4 rounded-full bg-white shadow-md"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </button>
  );
}
