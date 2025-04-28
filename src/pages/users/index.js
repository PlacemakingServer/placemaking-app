import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import ModalUser from "@/components/ui/ModalUser";
import ModalRegisterUser from "@/components/ui/ModalRegisterUser";
import FiltersComponent from "@/components/ui/FiltersComponent";
import UserCard from "@/components/ui/UserCard";
import { useUsers } from "@/hooks/useUsers"; // agora usa seu hook
import { useMessage } from "@/context/MessageContext";
import { VARIANTS } from "@/config/colors";
import { USER_ROLES, USER_STATUS } from "@/config/data_types";
import UserCardSkeleton from "@/components/ui/UserCardSkeleton";

export default function Users() {
  const { users, addUser, updateUser, loading } = useUsers();
  const { showMessage } = useMessage();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm)
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (filterStatus)
      filtered = filtered.filter((u) => u.status === filterStatus);
    if (filterRole) filtered = filtered.filter((u) => u.role === filterRole);

    if (order === "desc")
      filtered = filtered.sort((a, b) =>
        b.created_at.localeCompare(a.created_at)
      );
    else
      filtered = filtered.sort((a, b) =>
        a.created_at.localeCompare(b.created_at)
      );

    return filtered;
  }, [users, searchTerm, filterStatus, filterRole, order]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredUsers.slice(start, start + perPage);
  }, [filteredUsers, page, perPage]);

  const totalPages = Math.ceil(filteredUsers.length / perPage);

  const handleUserCreated = async (newUser) => {
    try {
      await addUser(newUser);
      showMessage("Usuário criado com sucesso!", "verde");
    } catch (err) {
      console.error(err);
      showMessage("Erro ao criar usuário.", "vermelho_claro");
    }
  };

  const handleUserUpdated = async (updatedUser) => {
    try {
      console.log("Atualizando usuário:", updatedUser);
      await updateUser(updatedUser.id, updatedUser);
      showMessage("Usuário atualizado!", "verde");
    } catch (err) {
      console.error(err);
      showMessage("Erro ao atualizar usuário.", "vermelho_claro");
    }
  };

  const handleUserDeleted = async (userId) => {
    try {
      await removeUser(userId);
      showMessage("Usuário deletado!", "verde");
    } catch (err) {
      console.error(err);
      showMessage("Erro ao deletar usuário.", "vermelho_claro");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-2 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setIsRegisterOpen(true)}
            variant="dark"
            className="flex px-4 py-2 gap-2 items-center"
          >
            <span className="material-symbols-outlined">person_add</span>
            Cadastrar usuário
          </Button>
        </div>

        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-2xl font-bold mb-2 md:mb-0">
              Usuários Cadastrados
            </h2>
          </div>

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
              setPage(1); // Resetar para página 1 ao mudar filtros
            }}
            onClear={() => {
              setSearchTerm("");
              setOrder("desc");
              setFilterStatus("");
              setFilterRole("");
              setPage(1);
            }}
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <UserCardSkeleton key={idx} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedUsers.map((u) => (
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
              onClick={() => page > 1 && setPage(page - 1)}
              disabled={page === 1}
              variant="dark"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-700">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={() => page < totalPages && setPage(page + 1)}
              disabled={page === totalPages}
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
        onUserCreated={handleUserCreated}
        showMessage={showMessage}
      />
    </div>
  );
}

Users.pageName = "Gerenciar Usuários";
Users.layout = "private";
