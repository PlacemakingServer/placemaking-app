// components/forms/SelectedFormFieldCard.jsx
import { motion } from "framer-motion";

export default function SelectedFormFieldCard({ field }) {
  return (
    <motion.div
      layout
      className="flex-1 min-w-0 space-y-1"
    >
      <p className="font-semibold text-gray-900 text-base sm:text-lg break-words">
        {field.title}
      </p>
      <p className="text-sm text-gray-500">
        Respostas do tipo:{" "}
        <span className="font-medium text-gray-700">
          {field.input_type_name}
        </span>
      </p>
      <p className="text-xs text-gray-400">ID Tipo: {field.input_type}</p>
    </motion.div>
  );
}
