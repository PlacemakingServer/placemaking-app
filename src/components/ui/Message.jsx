import { motion, AnimatePresence } from "framer-motion";

const variantStyles = {
  verde: "text-black bg-[rgb(114,227,173)] border-[rgb(80,180,130)] hover:brightness-95",
  vermelho: "text-white bg-red-600 border-transparent hover:bg-red-700",
  vermelho_claro: "text-red-700 bg-red-100 border-red-400 hover:bg-red-200",
  azul_claro: "text-black bg-blue-200 border-blue-600 hover:bg-blue-300",
  cinza: "text-black bg-gray-300 border-gray-800 hover:bg-gray-400",
  azul_escuro: "text-white bg-blue-600 border-transparent hover:bg-blue-700"
};

export default function Message({ message, variant = "info", show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`
            fixed top-4 inset-x-0 z-50
            w-fit max-w-[90%] mx-auto
            px-4 py-3 rounded-xl shadow-lg text-center
            text-sm font-medium
            ${variantStyles[variant] || variantStyles.info}
          `}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
