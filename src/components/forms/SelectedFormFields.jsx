import { motion, AnimatePresence } from "framer-motion";
import SelectedFormFieldCard from "./SelectedFormFieldCard";
import FieldMoveButtons from "./FieldMoveButtons";
import { useEffect } from "react";

export default function SelectedFormFields({
  fields = [],
  setFields,
  onEditQuestion,
  onRemoveQuestion,
}) {
  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= fields.length) return;
    const newArr = [...fields];
    [newArr[toIndex], newArr[fromIndex]] = [newArr[fromIndex], newArr[toIndex]];
    setFields(newArr);
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
            <div className="flex-1 rounded-xl bg-white border shadow-sm p-5 flex flex-col justify-between">
              <SelectedFormFieldCard
                field={field}
                index={index}
                total={fields.length}
                onEdit={onEditQuestion}
                onRemove={onRemoveQuestion}
                onMoveUp={() => moveItem(index, index - 1)}
                onMoveDown={() => moveItem(index, index + 1)}
              />
            </div>

            <div className="flex flex-col sm:flex-col gap-2 justify-between h-full sm:h-auto sm:justify-between">
              <FieldMoveButtons
                index={index}
                total={fields.length}
                onMoveUp={() => moveItem(index, index - 1)}
                onMoveDown={() => moveItem(index, index + 1)}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
