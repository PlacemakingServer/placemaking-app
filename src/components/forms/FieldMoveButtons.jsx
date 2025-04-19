
import { ArrowUp, ArrowDown } from "lucide-react";

export default function FieldMoveButtons({
  index,
  total,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <div className="h-full flex sm:flex-col flex-col justify-between gap-4 sm:items-center w-full sm:w-auto">
      <div className="h-full flex flex-col sm:flex-col justify-between items-center gap-2">
        <button
          onClick={() => index > 0 && onMoveUp(index)}
          aria-label="Mover para cima"
          className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
        >
          <ArrowUp size={15} />
        </button>
        <button
          onClick={() => index < total - 1 && onMoveDown(index)}
          aria-label="Mover para baixo"
          className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
        >
          <ArrowDown size={15} />
        </button>
      </div>
    </div>
  );
}
