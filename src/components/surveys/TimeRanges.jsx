import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Switch from "@/components/ui/Switch";
import { Clock, Plus, Trash2 } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import TimeSelectorModal from "@/components/surveys/TimeSelectorModal";

export default function TimeRanges({ timeRanges = [], setTimeRanges }) {
  const [showTimeRanges, setShowTimeRanges] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAddTime = (selectedTime) => {
    if (!timeRanges.includes(selectedTime)) {
      const sorted = [...timeRanges, selectedTime].sort();
      setTimeRanges(sorted);
    }
    setShowModal(false);
  };

  const handleDelete = (time) => {
    setTimeRanges(timeRanges.filter((t) => t !== time));
  };

  return (
    <div className="rounded-lg space-y-4">
      {/* Cabeçalho com tooltip e switch */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Horas de Coleta
            </h2>
            <Tooltip.Provider delayDuration={100}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button>
                    <Clock
                      size={16}
                      className="text-gray-400 hover:text-gray-600 transition"
                    />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    className="z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-md shadow-lg max-w-xs"
                    sideOffset={6}
                  >
                    Defina os horários exatos de atuação dos pesquisadores em campo.
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <p className="text-sm text-gray-600 leading-snug">
            Registre os horários em que a coleta será realizada.
          </p>
        </div>
        <Switch
          checked={showTimeRanges}
          onChange={setShowTimeRanges}
          type="arrow"
        />
      </div>

      <AnimatePresence>
        {showTimeRanges && (
          <motion.div
            key="timerange-toggle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="space-y-5 bg-white border border-gray-100 rounded-lg shadow-sm px-4 py-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Registrar horários
                </h3>
                <p className="text-xs text-gray-600">
                  Exemplos: 09h00, 09h30, 10h00...
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 active:scale-95 transition shadow"
              >
                <Plus size={16} />
                Adicionar hora
              </button>
            </div>

            {/* Lista */}
            {timeRanges.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {timeRanges.map((time, idx) => (
                  <motion.li
                    key={time + idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-800 shadow-sm"
                  >
                    {time}
                    <button
                      onClick={() => handleDelete(time)}
                      className="text-red-500 hover:text-red-600 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                Nenhum horário registrado.
              </p>
            )}

            <TimeSelectorModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSelectTime={handleAddTime}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
