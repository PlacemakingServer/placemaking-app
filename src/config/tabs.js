// src/config/tabs.js
export const TABS = {
  Dashboard: {
    link: "/",
    icon: "",
  },
  Pesquisas: {
    link: "/researches",
    icon: "",
  },
  // Configurações: {
  //   link: "/settings",
  //   icon: "",
  // },
  Usuários: {
    link: "/users",
    icon: "",
  },
  
};

export const PERMISSION_TABS = {
  admin: ["Usuários"],
  research: [],
};


export const TABSTYLES = {
  active: "text-white bg-black border-gray-800 hover:bg-gray-800",
  inactive: "text-gray-700 border-gray-200 hover:bg-gray-100 shadow-sm transition-colors",
};
