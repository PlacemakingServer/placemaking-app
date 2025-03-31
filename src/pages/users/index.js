import { useState, useEffect, useCallback } from "react";
import clsx from "clsx"; 
import Button from "@/components/ui/Button";
import ModalUser from "@/components/ui/ModalUser";
import ModalRegisterUser from "@/components/ui/ModalRegisterUser";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import {
  getCachedData,
  syncLocalToServer,
  syncServerToCache,
} from "@/services/cache";
import { VARIANTS } from "@/config/colors";
import { USER_ROLES, USER_STATUS } from "@/config/data_types";
import { useAuth } from "@/context/AuthContext";


export default function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const { userData } = useAuth();

  const loadCachedUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("users", {
        paginated: false,
        order,
        search: searchTerm,
        filterStatus,
        filterRole,
      });
  
      const filtered = result.filter(user => user.id !== userData?.id);

      const total = filtered.length;
      const totalPagesCalc = Math.ceil(total / perPage);
      const start = (page - 1) * perPage;
      const paginatedUsers = filtered.slice(start, start + perPage);
  
      setUsers(paginatedUsers);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      console.error("Erro ao carregar dados do cache:", err);
      showMessage("Erro ao carregar dados do cache.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    perPage,
    order,
    searchTerm,
    filterStatus,
    filterRole,
    setIsLoading,
    showMessage,
    userData?.id,
  ]);
  

  useEffect(() => {
    loadCachedUsers();
  }, [loadCachedUsers]);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncLocalToServer("users");
      await syncServerToCache("users");
      showMessage("Dados sincronizados com sucesso!", "azul_claro");
      loadCachedUsers();
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
      showMessage("Erro ao sincronizar dados.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };
  const handleUserDeleted = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case "pendingCreate":
        return VARIANTS.azul_escuro;
      case "pendingUpdate":
        return VARIANTS.warning;
      case "pendingDelete":
        return VARIANTS.vermelho;
      default:
        return VARIANTS.verde;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-2 md:p-8 max-w-7xl mx-auto">
        {/* Botão de cadastro */}
        <Button
          onClick={() => setIsRegisterOpen(true)}
          variant="dark"
          className="fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex justify-center items-center transition"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
        </Button>

        {/* Seção de Gerenciamento */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-2xl font-bold mb-2 md:mb-0">
              Usuários Cadastrados
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Os dados podem estar desatualizados. Clique em “Atualizar” para
            sincronizar com o servidor.
          </p>
          <div className="flex items-center space-x-2 mb-4">
            <Button
              onClick={handleSync}
              disabled={isLoading}
              className="px-4 py-2 transition flex justify-evenly items-center gap-2"
              variant="dark"
            >
              <span className="material-symbols-outlined">sync</span>
              <span>Atualizar</span>
            </Button>
          </div>

          {/* Botão para expandir filtros */}
          <div className="flex justify-end mb-2">
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

          {/* Filtros expandíveis com animação leve */}
          <div
            className={clsx(
              "transition-all overflow-hidden",
              showFilters ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <section className="mb-6 border border-gray-200 rounded-xl shadow-sm p-4 bg-white space-y-5">
              {/* Campo de busca */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-base">
                    search
                  </span>
                  Buscar por nome ou e-mail
                </label>
                <input
                  type="text"
                  placeholder="Digite aqui..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Ordenação */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-base">
                    sort
                  </span>
                  Ordem de cadastro
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrder("desc")}
                    className={clsx(
                      "px-4 py-1 rounded-full text-sm border",
                      order === "desc" ? VARIANTS.secondary : VARIANTS.light
                    )}
                  >
                    Mais novo
                  </button>
                  <button
                    onClick={() => setOrder("asc")}
                    className={clsx(
                      "px-4 py-1 rounded-full text-sm border",
                      order === "asc" ? VARIANTS.secondary : VARIANTS.light
                    )}
                  >
                    Mais velho
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-base">
                    flag
                  </span>
                  Filtrar por status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["", ...USER_STATUS].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={clsx(
                        "px-4 py-1 rounded-full text-sm border",
                        filterStatus === status
                          ? VARIANTS.secondary
                          : VARIANTS.light
                      )}
                    >
                      {status || "Todos"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Papel */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-base">
                    groups
                  </span>
                  Filtrar por papel
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["", ...USER_ROLES].map((role) => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={clsx(
                        "px-4 py-1 rounded-full text-sm border",
                        filterRole === role
                          ? VARIANTS.secondary
                          : VARIANTS.light
                      )}
                    >
                      {role || "Todos"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limpar filtros */}
              {(searchTerm ||
                order !== "desc" ||
                filterStatus ||
                filterRole) && (
                <div className="pt-1">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setOrder("desc");
                      setFilterStatus("");
                      setFilterRole("");
                    }}
                    variant="transparent_cinza"
                    className="text-sm"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </section>
          </div>

          {users.length === 0 ? (
            <p className="text-gray-500">
              Nenhum usuário encontrado. Tente alterar os filtros ou clique em
              “Atualizar”.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="rounded-lg shadow p-4 flex flex-col justify-between transition transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="space-y-2 text-sm">
                    <h3 className="text-lg font-semibold truncate">{u.name}</h3>
                    <p className="text-gray-600 truncate">Email: {u.email}</p>
                    <p className="text-gray-600 truncate">Papel: {u.role}</p>
                    <p className="text-gray-600 truncate">Status: {u.status}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {u._syncStatus && (
                      <span
                        className={`flex-shrink-0 truncate max-w-[100px] px-2 py-1 text-xs font-semibold rounded ${getBadgeVariant(
                          u._syncStatus
                        )}`}
                      >
                        {u._syncStatus}
                      </span>
                    )}
                    <Button
                      variant="transparent_cinza"
                      className="p-1 flex-shrink-0"
                      onClick={() => setSelectedUser(u)}
                    >
                      <span className="material-symbols-outlined">info</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handlePrevious}
              disabled={page === 1}
              className="disabled:opacity-80"
              variant="dark"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-700">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={handleNext}
              disabled={page === totalPages}
              className="disabled:opacity-80"
              variant="dark"
            >
              Próxima
            </Button>
          </div>
        </section>
      </main>

      <ModalUser
        isOpen={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
        showMessage={showMessage}
      />

      <ModalRegisterUser
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onUserCreated={(newUser) => setUsers((prev) => [...prev, newUser])}
        showMessage={showMessage}
      />
    </div>
  );
}

Users.pageName = "Gerenciar Usuários";
Users.layout = "private";
