export default function ResearchLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Cabeçalho (imagem / título) */}
      <div className="rounded-t-lg bg-gray-200 h-28" />

      {/* Conteúdo */}
      <div className="p-6 space-y-8">
        {/* Seção: Informações Básicas */}
        <div className="space-y-2">
          {/* Título da Seção e Switch */}
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-5 w-10 bg-gray-200 rounded-full" />
          </div>
          {/* Campos */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Seção: Datas */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-5 w-10 bg-gray-200 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Seção: Localização */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-5 w-10 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-3 mt-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          {/* Mapa preview placeholder */}
          <div className="w-full h-32 bg-gray-200 rounded" />
        </div>

        <hr className="border-gray-200" />

        {/* Seção: Colaboradores */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-5 w-10 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-2 mt-2">
            {/* Linha do MultiSelect */}
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            {/* Cards placeholder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="h-16 bg-gray-200 rounded" />
              <div className="h-16 bg-gray-200 rounded" />
              <div className="h-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Botões de ação final */}
        <div className="flex justify-center gap-6 pt-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}
