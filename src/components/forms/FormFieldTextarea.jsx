// components/forms/FormFieldTextarea.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FormFieldTextarea({
  legend,
  value,
  onChange,
  disabled = false,
  rows = 4,
  bgColor = "bg-white",
  error = false,
  helperText = "",
  tooltip = "",
}) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    setFilled(value !== null && value !== "");
  }, [value]);

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="relative">
        <label
          className={`absolute left-3 top-3 px-1 text-sm text-gray-500 transition-all ${bgColor} rounded-md pointer-events-none ${
            filled ? "-top-2 text-xs text-blue-500" : ""
          }`}
        >
          {legend}
        </label>

        {tooltip && (
          <span
            className="absolute right-3 top-3 text-gray-400 text-sm cursor-help"
            title={tooltip}
          >
            ⓘ
          </span>
        )}

        <textarea
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder=" "
          disabled={disabled}
          className={`peer w-full px-4 py-3 mt-5 text-sm text-gray-900 ${bgColor} border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-black transition-all resize-y ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />

        {(helperText || error) && (
          <p
            className={`mt-1 text-xs ${
              error ? "text-red-500" : "text-gray-500"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    </motion.div>
  );
}
