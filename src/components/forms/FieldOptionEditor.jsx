import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import FormField from "@/components/forms/FormField";
import { useFieldOptions } from "@/hooks/useFieldOptions";

export default function FieldOptionEditor({ fieldId }) {
  const { options, addOption, updateOption, deleteOption, loading, error } =
    useFieldOptions(fieldId);

  /* ————————————————————————————————————————— */
  /* State local                               */
  /* ————————————————————————————————————————— */
  const [draft, setDraft] = useState({ id: null, text: "" });
  const [editingId, setEditingId] = useState(null);

  // limpa tudo ao trocar de field
  useEffect(() => {
    setDraft({ id: null, text: "" });
    setEditingId(null);
  }, [fieldId]);

  /* ————————————————————————————————————————— */
  /* Handlers                                  */
  /* ————————————————————————————————————————— */
  const handleSave = async () => {
    const txt = draft.text.trim();
    if (!txt) return;

    if (draft.id) {
      await updateOption(draft.id, { option_text: txt });
    } else {
      await addOption({ option_text: txt, option_value: txt });
    }
    setDraft({ id: null, text: "" });
    setEditingId(null);
  };

  const startEdit = (opt) => {
    setEditingId(opt.id);
    setDraft({ id: opt.id, text: opt.option_text });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ id: null, text: "" });
  };

  /* ————————————————————————————————————————— */
  /* Memo para skeleton vs lista real          */
  /* ————————————————————————————————————————— */
  const skeletonArray = useMemo(() => Array.from({ length: 3 }), []);

  if (!fieldId) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700">Opções</h4>

      {/* Lista */}
      <ul className="max-h-56 overflow-auto scroll-smooth snap-y snap-mandatory space-y-2 pr-1">
        <AnimatePresence initial={false}>
          {loading && !options.length
            ? skeletonArray.map((_, i) => (
                <li
                  key={i}
                  className="h-10 rounded-lg bg-gray-200 animate-pulse"
                />
              ))
            : options.map((o) => (
                <motion.li
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="snap-start"
                >
                  <div className="flex items-center px-3 py-2 rounded-lg shadow-sm bg-white">
                    {editingId === o.id ? (
                      <>
                        <input
                          autoFocus
                          value={draft.text}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, text: e.target.value }))
                          }
                          className="flex-1 bg-transparent outline-none text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSave}
                          aria-label="confirmar"
                        >
                          <Check size={18} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={cancelEdit}
                          aria-label="cancelar"
                        >
                          <X size={18} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm truncate">
                          {o.option_text}
                        </span>
                        {/* <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(o)}
                          aria-label="editar"
                        >
                          <Pencil size={16} />
                        </Button> */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteOption(o.id)}
                          aria-label="excluir"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.li>
              ))}
        </AnimatePresence>
      </ul>

      {/* Adicionar nova */}
      <div className="flex gap-2">
        <FormField
          type="text"
          placeholder="Nova opção…"
          value={draft.text}
          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
          className="flex-1"
        />

        {/* bot ão verde compacto */}
        <Button
          variant="verde"
          size="icon" /* <= 40 × 40 px por padrão no shadcn */
          className="flex-none" /* impede de esticar */
          onClick={handleSave}
          disabled={loading || !draft.text.trim()}
          aria-label="adicionar"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
