import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function TimeSelectorModal({ isOpen, onClose, onSelectTime }) {
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");

  const handleConfirm = () => {
    const formatted = `${hour}h${minute}`;
    onSelectTime(formatted);
  };

  const hours = Array.from({ length: 17 }, (_, i) =>
    String(i + 6).padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as="div"
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          {/* Fundo escurecido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Painel modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-6"
            >
              <Dialog.Panel className="w-full space-y-6">
                {/* Botão de Fechar */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 p-1.5 rounded-full shadow text-white transition"
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>

                {/* Título */}
                <Dialog.Title className="text-lg font-semibold text-gray-800 text-center">
                  Selecione um horário
                </Dialog.Title>

                {/* Selects */}
                <div className="flex justify-center gap-3 items-center">
                  <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="w-24 rounded-md border border-gray-300 px-3 py-2 text-center shadow-sm text-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <span className="text-lg font-medium text-gray-600">:</span>
                  <select
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="w-24 rounded-md border border-gray-300 px-3 py-2 text-center shadow-sm text-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botão de Adicionar */}
                <div className="flex justify-center pt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirm}
                    className="px-5 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 active:scale-95 transition"
                  >
                    Adicionar
                  </motion.button>
                </div>
              </Dialog.Panel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
