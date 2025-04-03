import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * SideBarSectionsFilter
 * Componente de navegação entre seções via ícones e labels.
 * - Aparece como um botão flutuante (bolinha) para abrir/fechar
 * - Exibe menu fixo à direita ao abrir, com animação
 *
 * Props:
 *  - sections: [{ id: string, label: string, icon: string }]
 */
export default function SideBarSectionsFilter({ sections }) {
  const [visible, setVisible] = useState(false);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setVisible(false); // fecha o menu após clique
  };

  return (
    <>
      {/* Botão flutuante para abrir/fechar */}
      <button
        onClick={() => setVisible((prev) => !prev)}
        className="fixed bottom-4 right-4 bg-gray-400 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl z-50 hover:scale-105 transition"
      >
        <span className="material-symbols-outlined">
          {visible ? "close" : "menu"}
        </span>
      </button>

      {/* Navbar lateral direita animada */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed right-0 top-1/3 -translate-y-1/2 bg-white border-l border-gray-200 rounded-l-xl shadow-2xl p-4 flex flex-col gap-5 z-40"
          >
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleScrollTo(section.id)}
                className="flex flex-col items-center text-xs text-gray-700 hover:text-indigo-600 transition"
              >
                <span className="material-symbols-outlined text-xl">
                  {section.icon}
                </span>
                <span className="text-[10px] mt-1">{section.label}</span>
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
