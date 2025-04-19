import { motion } from "framer-motion";
import FieldActionButtons from "./FieldActionButtons";

export default function SelectedFormFieldCard({
  field,
  index,
  total,
  onEdit,
  onRemove
}) {
  return (
    <motion.div
      layout
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
    >
      <div className="flex-1 min-w-0 space-y-1">
        <span>
          <span className="text-sm text-gray-500">Pergunta {index + 1} </span>
        </span>
        <p className="font-semibold text-gray-900 text-base sm:text-md break-words">
          {field.title}
        </p>
        <p className="text-sm text-gray-500">
          Respostas do tipo:{" "}
          <span className="font-medium text-gray-700">
            {field.input_type_name}
          </span>
        </p>
      </div>

      <div className="flex sm:flex-col gap-2 justify-end">
        <FieldActionButtons
          index={index}
          total={total}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </div>
    </motion.div>
  );
}
