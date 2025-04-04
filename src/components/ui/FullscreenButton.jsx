import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const isDesktop = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
};

export default function FullscreenButton({ expanded, hovered, setHovered }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isDesktop()) setVisible(true);

    const handleResize = () => {
      setVisible(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setVisible(false);
    } catch (err) {
      console.error("Erro ao tentar entrar em fullscreen:", err);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (!expanded) setHovered("Fullscreen");
      }}
      onMouseLeave={() => {
        if (!expanded) setHovered(null);
      }}
    >
      <button
        onClick={enterFullscreen}
        className={`group flex items-center gap-2 px-4 py-2 rounded-md transition-all w-full hover:bg-gray-100 ${
          !expanded ? "justify-center" : ""
        } text-black`}
      >
        <span className="material-symbols-outlined text-xl">fullscreen</span>
        {expanded && (
          <span className="text-sm font-medium whitespace-nowrap">
            Tela cheia
          </span>
        )}
      </button>

      {!expanded && hovered === "Fullscreen" && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10"
          >
            Tela cheia
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
