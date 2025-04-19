// components/forms/FieldActionButtons.jsx
import { ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";

export default function FieldActionButtons({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
}) {
  return (
    <div className="flex sm:flex-row flex-col justify-end gap-4 sm:items-center w-full sm:w-auto">
      <div className="flex flex-row sm:flex-col justify-center items-center gap-2">
        <button
          onClick={() => onEdit(index)}
          aria-label="Editar pergunta"
          className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
        >
          <Edit size={15} />
        </button>
        <button
          onClick={() => onRemove(index)}
          aria-label="Remover pergunta"
          className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
