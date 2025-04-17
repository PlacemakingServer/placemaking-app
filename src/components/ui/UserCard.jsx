// components/ui/UserCard.jsx
import Button from "@/components/ui/Button_og";
import { VARIANTS } from "@/config/colors";

export default function UserCard({ user, onViewDetails }) {
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
    <div className="rounded-lg shadow p-4 flex flex-col justify-between transition transform hover:scale-105 hover:shadow-xl">
      <div className="space-y-2 text-sm">
        <h3 className="text-lg font-semibold truncate">{user.name}</h3>
        <p className="text-gray-600 truncate">Email: {user.email}</p>
        <p className="text-gray-600 truncate">Papel: {user.role}</p>
        <p className="text-gray-600 truncate">Status: {user.status}</p>
      </div>
      <div className="flex items-center gap-2 mt-4">
        {user._syncStatus && (
          <span
            className={`flex-shrink-0 truncate max-w-[100px] px-2 py-1 text-xs font-semibold rounded ${getBadgeVariant(
              user._syncStatus
            )}`}
          >
            {user._syncStatus}
          </span>
        )}
        <Button
          variant="transparent_cinza"
          className="p-1 flex-shrink-0"
          onClick={onViewDetails}
        >
          <span className="material-symbols-outlined">info</span>
        </Button>
      </div>
    </div>
  );
}
