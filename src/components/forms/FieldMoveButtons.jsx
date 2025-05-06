import { ArrowUp, ArrowDown } from "lucide-react";

export default function FieldMoveButtons({ index, total, onMoveUp, onMoveDown }) {
  return (
    <div className="flex sm:flex-col gap-2">
      <button
        onClick={onMoveUp}
        disabled={index === 0}
        aria-label="Mover para cima"
        className="p-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg transition"
      >
        <ArrowUp size={15} />
      </button>

      <button
        onClick={onMoveDown}
        disabled={index === total - 1}
        aria-label="Mover para baixo"
        className="p-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg transition"
      >
        <ArrowDown size={15} />
      </button>
    </div>
  );
}
