import clsx from "clsx";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch"; // não esqueça de importar o componente!


export default function FiltersComponent({
  showFilters,
  setShowFilters,
  filters,
  onChange,
  onClear,
  variants = {},
}) {
  return (
    <div>
      {/* Botão para expandir/recolher filtros */}
      <div className="flex justify-start mb-2">
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

      {/* Conteúdo dos filtros */}
      <div
        className={clsx(
          "transition-all overflow-hidden",
          showFilters ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <section className="mb-6 border border-gray-200 rounded-xl shadow-sm p-4 bg-white space-y-5">
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
                            ? variants.secondary || "bg-indigo-600 text-white"
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
                    <span className="material-symbols-outlined text-base">visibility</span>
                    {filter.label}
                  </label>
                  <div className="space-y-2">
                    {filter.options.map((opt) => (
                      <div key={opt.value} className="flex items-center justify-between border border-gray-200 p-3 rounded-lg">
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

          {/* Botão de limpar filtros */}
          {filters.some(
            (f) => f.value !== "" && f.value !== f.defaultValue
          ) && (
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
      </div>
    </div>
  );
}
