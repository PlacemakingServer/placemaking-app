import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button_og";

let debounceTimer;

export default function SearchControl({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  const fetchResults = async (searchQuery) => {
    if (!searchQuery) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (place) => {
    setQuery("");
    setResults([]);
    setExpanded(false);
    setHasSearched(false);
    onNavigate([parseFloat(place.lat), parseFloat(place.lon)]);
  };

  // Busca com debounce enquanto digita
  useEffect(() => {
    if (!expanded) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchResults(query);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    if (expanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [expanded]);

  const closeSearch = () => {
    setExpanded(false);
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="absolute z-[999] top-4 w-full max-w-md px-4">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key="icon"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Button
              onClick={() => setExpanded(true)}
              className="px-3.5 shadow-md rounded-full bg-white"
              variant="transparent_cinza"
            >
              <span className="material-symbols-outlined text-2xl">search</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <div className="flex gap-2 p-3 items-center">
              <button
                type="button"
                onClick={closeSearch}
                className="text-gray-600 hover:text-gray-800 transition"
              >
                <span className="material-symbols-outlined text-2xl">
                  arrow_back
                </span>
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar local..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
              {loading && (
                <span className="material-symbols-outlined animate-spin text-gray-500">
                  refresh
                </span>
              )}
            </div>

            <AnimatePresence>
              {(results.length > 0 || hasSearched) && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {results.length > 0 ? (
                    <>
                      <p className="text-xs text-gray-500 px-4 pt-2 pb-1">
                        Resultados para busca:{" "}
                        <span className="font-medium italic">"{query}"</span>
                      </p>
                      <ul className="max-h-64 overflow-y-auto border-t border-gray-200">
                        {results.map((place, index) => (
                          <li
                            key={`${place.place_id}-${index}`}
                            onClick={() => handleSelectResult(place)}
                            className="px-4 py-3 text-sm text-gray-800 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-all border-b border-gray-100"
                          >
                            {place.display_name}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-gray-400 text-sm">
                      <span className="material-symbols-outlined text-5xl mb-2">
                        search_off
                      </span>
                      Nenhum resultado encontrado para "{query}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
