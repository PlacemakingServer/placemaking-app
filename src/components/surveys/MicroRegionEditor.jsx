import { useState } from "react";
import FormField from "@/components/forms/FormField";
import { Trash2, Plus, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Switch from "@/components/ui/Switch";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function MicroRegionEditor({
  regions = [],
  setRegions,
  form,
  setForm,
}) {
  const [showMicroRegions, setShowMicroRegions] = useState(false);

  const handleAdd = () => {
    if (!form.new_region?.trim()) return;
    setRegions((prev) => [...prev, form.new_region.trim()]);
    setForm((prev) => ({ ...prev, new_region: "" }));
  };

  const handleDelete = (indexToRemove) => {
    setRegions((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const toggleUseMicroRegions = () => {
    setForm((prev) => ({
      ...prev,
      use_micro_regions: !prev.use_micro_regions,
    }));
  };

  return (
    <div className="rounded-lg space-y-4">
      {/* Cabeçalho com tooltip e switch */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Micro-regiões
            </h2>
            <Tooltip.Provider delayDuration={100}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button>
                    <MapPin
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
                    Divida a coleta em regiões como “Entrada Leste”, “Praça Central”, etc.
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <p className="text-sm text-gray-600 leading-snug">
            Organize a coleta por áreas específicas da localização observada.
          </p>
        </div>
        <Switch
          checked={showMicroRegions}
          onChange={setShowMicroRegions}
          type="arrow"
        />
      </div>

      <AnimatePresence>
        {showMicroRegions && (
          <motion.div
            key="microregion-toggle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="space-y-5 bg-white border border-gray-100 rounded-lg shadow-sm px-4 py-5"
          >
            {/* Ativar toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Ativar micro-regiões
                </h3>
                <p className="text-xs text-gray-600">
                  Permite organizar a coleta por pontos distintos do território.
                </p>
              </div>
              <Switch
                checked={!!form.use_micro_regions}
                onChange={toggleUseMicroRegions}
              />
            </div>

            {/* Campo e botão */}
            {form.use_micro_regions && (
              <>
                <div className="flex justify-auto flex-col sm:flex-row gap-8 sm:items-end">
                  <FormField
                    legend="Nome da Região"
                    type="text"
                    value={form.new_region || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        new_region: e.target.value,
                      }))
                    }
                    placeholder="Ex: Entrada Sul, Ponto 3..."
                  />
                  <motion.button
                    onClick={handleAdd}
                    disabled={!form.new_region?.trim()}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-row gap-4 justify-center items-center h-10 px-4 rounded-md bg-green-600 text-white text-sm font-medium shadow hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} className="inline" />
                    Adicionar
                  </motion.button>
                </div>

                {/* Lista */}
                {regions.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {regions.map((region, idx) => (
                      <motion.li
                        key={region + idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-800 shadow-sm"
                      >
                        {region}
                        <button
                          onClick={() => handleDelete(idx)}
                          className="text-red-500 hover:text-red-600 transition"
                          aria-label={`Remover ${region}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 text-center">
                    Nenhuma micro-região criada ainda.
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
