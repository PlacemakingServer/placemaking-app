export const TABS = {
  Dashboard: {
    link: "/",
    icon: "dashboard",
  },
  Usuários: {
    link: "/users",
    icon: "group",
  },
  Pesquisas: {
    icon: "app_registration",
    // Link principal opcional – neste caso, usamos como container de dropdown
    subTabs: {
      "Gerenciar Pesquisas": {
        link: "/researches/manage",
        icon: "pending_actions",
      },
      "Criar pesquisa": {
        link: "/researches/create-research",
        icon: "add",
      },
    },
  },
  Relatórios: {
    link: "/reports",
    icon: "analytics",
  },
};

export const PERMISSION_TABS = {
  admin: ["Usuários", "Criar pesquisa"],
  research: [],
};

export const TABSTYLES = {
  active: "text-white bg-black border-gray-800 hover:bg-gray-800",
  inactive: "text-gray-700 border-gray-200 hover:bg-gray-100 shadow-sm transition-colors",
};
