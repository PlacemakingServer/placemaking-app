import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function FormField({ legend, type = "text", value, onChange, disabled = false, bgColor = "bg-white" }) {
  const [filled, setFilled] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    setFilled(!!value);
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
          className={`absolute left-3 px-1 text-gray-500 text-sm transition-all ${bgColor} rounded-lg peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500 ${filled ? "-top-2 text-xs text-blue-500" : ""}`}
        >
          {legend}
        </label>
        {type === "date" ? (
          <div className="relative flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            >
              <span className="material-symbols-outlined text-gray-700">calendar_month</span>
            </button>
            <span className="text-gray-900 text-sm">{value || "Selecione uma data"}</span>
            {calendarOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute top-full left-0 mt-2 z-10 bg-white shadow-lg rounded-md p-2"
              >
                <Calendar 
                  onChange={(date) => {
                    onChange({ target: { value: date.toISOString().split("T")[0] } });
                    setCalendarOpen(false);
                  }}
                  value={value ? new Date(value) : new Date()}
                />
              </motion.div>
            )}
          </div>
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder=" "
            disabled={disabled}
            className={`peer w-full px-4 py-3 mt-2 text-sm text-gray-900 ${bgColor} border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
        )}
      </div>
    </motion.div>
  );
}