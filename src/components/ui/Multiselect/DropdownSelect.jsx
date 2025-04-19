import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function DropdownSelect({
  options = [],
  selected = null,
  onChange,
  placeholder = "Selecionar...",
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === selected)?.label;

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 flex justify-between items-center text-sm text-zinc-700 dark:text-zinc-200 shadow-sm hover:border-zinc-400"
      >
        <span>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto text-sm"
          >
            {options.map((option) => (
              <li
                key={option.value}
                className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between"
                onClick={() => handleSelect(option.value)}
              >
                <span className="text-zinc-700 dark:text-zinc-200">{option.label}</span>
                {selected === option.value && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
