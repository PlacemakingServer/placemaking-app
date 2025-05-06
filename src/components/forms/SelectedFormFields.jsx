import { motion, AnimatePresence } from "framer-motion";
import SelectedFormFieldCard from "./SelectedFormFieldCard";
import FieldMoveButtons from "./FieldMoveButtons";

/**
 * props
 * - fields:   array de fields já ordenados
 * - onEditQuestion(index)
 * - onRemoveQuestion(index)
 * - onReorder(newList)  ← callback emitido quando a ordem muda
 */
export default function SelectedFormFields({
  fields = [],
  onEditQuestion,
  onRemoveQuestion,
  onReorder,
}) {
  /* move um item e devolve lista nova -------------------------------- */
  const moveItem = (from, to) => {
    if (to < 0 || to >= fields.length) return;

    const next = [...fields];
    [next[to], next[from]] = [next[from], next[to]];

    // recalcula a propriedade order = índice
    const withPos = next.map((f, idx) => ({ ...f, position: idx }));
    onReorder(withPos);
  };

  return (
    <div className="mt-8 max-w-4xl mx-auto space-y-6 px-4">
      <h3 className="text-lg font-semibold text-gray-800">Perguntas:</h3>

      <AnimatePresence>
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="flex gap-3 items-center justify-between"
          >
            {/* cartão */}
            <div className="flex-1 rounded-xl bg-white border shadow-sm p-5">
              <SelectedFormFieldCard
                field={field}
                index={index}
                total={fields.length}
                onEdit={onEditQuestion}
                onRemove={onRemoveQuestion}
              />
            </div>

            {/* botões de mover */}
            <FieldMoveButtons
              index={index}
              total={fields.length}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
