import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import ModalUser from "@/components/ui/ModalUser";
import ModalRegisterUser from "@/components/ui/ModalRegisterUser";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import UserCard from "@/components/ui/UserCard";
import {
  getCachedData,
  syncLocalToServer,
  syncServerToCache,
} from "@/services/cache";
import { VARIANTS } from "@/config/colors";
import { USER_ROLES, USER_STATUS } from "@/config/data_types";
import { useAuth } from "@/context/AuthContext";
import FiltersComponent from "@/components/ui/FiltersComponent";

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

      const filtered = result.filter((user) => user.id !== userData?.id);

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
        <div className="flex justify-end mb-4">
          {/* Botão completo para desktop */}
          <Button
            onClick={() => setIsRegisterOpen(true)}
            variant="dark"
            className="flex px-4 py-2 gap-2 items-center"
          >
            <span className="material-symbols-outlined">person_add</span>
            Cadastrar usuário
          </Button>
        </div>

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

          {/* Filtros expandíveis com animação leve */}
          <FiltersComponent
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            variants={VARIANTS}
            mobilePosition="right"
            filters={[
              {
                key: "searchTerm",
                label: "Buscar por nome ou e-mail",
                icon: "search",
                type: "text",
                value: searchTerm,
                defaultValue: "",
              },
              {
                key: "order",
                label: "Ordem de cadastro",
                icon: "sort",
                type: "button-group",
                value: order,
                defaultValue: "desc",
                options: [
                  { label: "Mais novo", value: "desc" },
                  { label: "Mais velho", value: "asc" },
                ],
              },
              {
                key: "filterStatus",
                label: "Filtrar por status",
                icon: "flag",
                type: "button-group",
                value: filterStatus,
                defaultValue: "",
                options: [
                  { label: "Todos", value: "" },
                  ...USER_STATUS.map((s) => ({ label: s, value: s })),
                ],
              },
              {
                key: "filterRole",
                label: "Filtrar por papel",
                icon: "groups",
                type: "button-group",
                value: filterRole,
                defaultValue: "",
                options: [
                  { label: "Todos", value: "" },
                  ...USER_ROLES.map((r) => ({ label: r, value: r })),
                ],
              },
            ]}
            onChange={(key, value) => {
              if (key === "searchTerm") setSearchTerm(value);
              if (key === "order") setOrder(value);
              if (key === "filterStatus") setFilterStatus(value);
              if (key === "filterRole") setFilterRole(value);
            }}
            onClear={() => {
              setSearchTerm("");
              setOrder("desc");
              setFilterStatus("");
              setFilterRole("");
            }}
          />

          {users.length === 0 ? (
            <p className="text-gray-500">
              Nenhum usuário encontrado. Tente alterar os filtros ou clique em
              “Atualizar”.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {users.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  onViewDetails={() => setSelectedUser(u)}
                />
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
