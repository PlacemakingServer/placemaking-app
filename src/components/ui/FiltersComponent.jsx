import { useState } from "react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";

export default function FiltersComponent({
  showFilters,
  setShowFilters,
  filters,
  onChange,
  onClear,
  variants = {},
  mobilePosition = "right", // default: "right"
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderFilterContent = () => (
    <section className="space-y-5">
      {filters.map((filter) => {
        if (filter.type === "text") {
          return (
            <div key={filter.key}>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-base">
                  {filter.icon}
                </span>
                {filter.label}
              </label>
              <input
                type="text"
                value={filter.value}
                onChange={(e) => onChange(filter.key, e.target.value)}
                placeholder={filter.placeholder || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          );
        }

        if (filter.type === "button-group") {
          return (
            <div key={filter.key}>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-base">
                  {filter.icon}
                </span>
                {filter.label}
              </label>
              <div className="flex gap-2 flex-wrap">
                {filter.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onChange(filter.key, opt.value)}
                    className={clsx(
                      "px-4 py-1 rounded-full text-sm border",
                      filter.value === opt.value
                        ? variants.secondary || "bg-gray-400 text-white"
                        : variants.light || "bg-gray-100"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        if (filter.type === "switch-group") {
          return (
            <div key={filter.key}>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-base">
                  visibility
                </span>
                {filter.label}
              </label>
              <div className="space-y-2">
                {filter.options.map((opt) => (
                  <div
                    key={opt.value}
                    className="flex items-center justify-between border border-gray-200 p-3 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{opt.label}</span>
                    <Switch
                      checked={opt.checked}
                      onChange={(checked) => {
                        onChange(filter.key, { [opt.value]: checked });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}

      {filters.some((f) => f.value !== "" && f.value !== f.defaultValue) && (
        <div className="pt-1">
          <Button
            onClick={onClear}
            variant="transparent_cinza"
            className="text-sm"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </section>
  );

  return (
    <div>
      {/* DESKTOP: botão de expandir/recolher */}
      <div className="hidden lg:flex justify-start mb-2">
        <Button
          variant="light"
          onClick={() => setShowFilters((prev) => !prev)}
          className="text-sm flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">
            {showFilters ? "expand_less" : "tune"}
          </span>
          {showFilters ? "Esconder filtros" : "Mostrar filtros"}
        </Button>
      </div>

      {/* DESKTOP: filtros inline */}
      <div
        className={clsx(
          "transition-all overflow-hidden hidden lg:block",
          showFilters ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <section className="mb-6 border border-gray-200 rounded-xl shadow-sm p-4 bg-white">
          {renderFilterContent()}
        </section>
      </div>

      {/* MOBILE: botão flutuante */}
      {!mobileOpen && (
        <div className="fixed bottom-4 right-4 z-50 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-14 h-14 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
          >
            <span className="material-symbols-outlined text-3xl">tune</span>
          </button>
        </div>
      )}

      {/* MOBILE: painel lateral */}
      {mobileOpen && (
        <div
          className={clsx(
            "fixed top-0 bottom-0 z-50 w-72 max-w-full bg-white shadow-2xl border border-gray-200 p-4 transition-transform duration-300 lg:hidden",
            mobilePosition === "right"
              ? "right-0 animate-slide-in-right"
              : "left-0 animate-slide-in-left"
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="overflow-y-auto h-full pr-1">
            {renderFilterContent()}
          </div>
        </div>
      )}
    </div>
  );
}
