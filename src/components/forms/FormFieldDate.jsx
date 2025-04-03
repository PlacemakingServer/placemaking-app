import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Converte um objeto Date para uma string no formato YYYY-MM-DD (usando valores locais)
function formatDateToLocalYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Formata uma string no formato YYYY-MM-DD para DD/MM/YYYY, sem criar novo objeto Date
function formatDateToDDMMYY(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

// Converte a string "YYYY-MM-DD" em um objeto Date usando os componentes locais
function parseDateString(dateString) {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

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
  const ref = useRef(null);

  // Fecha o calendário ao clicar fora do componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Exibe a data no formato DD/MM/YYYY
  const displayValue = value ? formatDateToDDMMYY(value) : "__/__/__";

  return (
    <motion.div
      className="relative w-fit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="relative" ref={ref}>
        {/* Label */}
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-medium text-gray-700">{legend}</label>
          {tooltip && (
            <span className="text-gray-400 text-xs cursor-help" title={tooltip}>
              ⓘ
            </span>
          )}
        </div>

        {/* Botão que exibe a data e abre o calendário */}
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

        {/* Popover do calendário */}
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
                  // Cria um objeto Date a partir dos valores locais (ano, mês e dia)
                  const localDate = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                  );
                  const formatted = formatDateToLocalYYYYMMDD(localDate);
                  onChange({ target: { value: formatted } });
                  setCalendarOpen(false);
                }}
                // Converte a string de valor para um objeto Date com a função parseDateString
                value={value ? parseDateString(value) : new Date()}
                className="rounded-lg p-2 [&_.react-calendar__tile--active]:!bg-black [&_.react-calendar__tile--active]:text-white"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exibe mensagem de erro ou helper */}
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
