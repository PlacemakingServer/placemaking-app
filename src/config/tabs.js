export const TABS = {
  Dashboard: {
    link: "/",
    icon: "dashboard",
  },
  Usuários: {
    link: "/users",
    icon: "group",
  },
  // Pesquisas: {
  //   link: "/researches",
  //   icon: "science",
  // },
  // Configurações: {
  //   link: "/settings",
  //   icon: "settings",
  // },
};

export const PERMISSION_TABS = {
  admin: ["Usuários"],
  research: [],
};

export const TABSTYLES = {
  active: "text-white bg-black border-gray-800 hover:bg-gray-800",
  inactive: "text-gray-700 border-gray-200 hover:bg-gray-100 shadow-sm transition-colors",
};
