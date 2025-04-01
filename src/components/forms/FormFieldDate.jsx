import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatDateToDDMMYY } from "@/utils/formatDate";

export default function FormFieldDate({
  legend,
  value,
  onChange,
  disabled = false,
  bgColor = "bg-white",
  error = false,
  helperText = "",
  tooltip = "",
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filled, setFilled] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setFilled(!!value);
  }, [value]);

  // Fecha o calendário ao clicar fora do popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Formata a data para exibir no botão
  const displayValue = value ? formatDateToDDMMYY(value) : "__/__/__";

  return (
    <motion.div
      className="relative w-fit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="relative" ref={ref}>
        {/* Label + Tooltip */}
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-medium text-gray-700">{legend}</label>
          {tooltip && (
            <span className="text-gray-400 text-xs cursor-help" title={tooltip}>
              ⓘ
            </span>
          )}
        </div>

        {/* Botão que abre o calendário */}
        <button
          type="button"
          onClick={() => setCalendarOpen((prev) => !prev)}
          disabled={disabled}
          className={`w-40 px-4 py-2 border ${
            error
              ? "border-red-500"
              : disabled
              ? "border-gray-200"
              : "border-gray-400"
          } rounded-md text-sm flex justify-between items-center ${bgColor} ${
            disabled ? "cursor-not-allowed text-gray-400" : "hover:border-black"
          }`}
        >
          <span className="text-left">{displayValue}</span>
          <span className="material-symbols-outlined text-base text-gray-500 ml-2">
            calendar_month
          </span>
        </button>

        {/* Calendário popover */}
        <AnimatePresence>
          {calendarOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-2 rounded-lg shadow-xl bg-white border border-gray-200"
            >
              <Calendar
                onChange={(date) => {
                  // value armazenado continua em ISO (YYYY-MM-DD)
                  onChange({ target: { value: date.toISOString().split("T")[0] } });
                  setCalendarOpen(false);
                }}
                value={value ? new Date(value) : new Date()}
                className="rounded-lg p-2 [&_.react-calendar__tile--active]:!bg-black [&_.react-calendar__tile--active]:text-white"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensagem de erro ou texto auxiliar */}
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
