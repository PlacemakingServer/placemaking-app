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
  active: "text-black bg-[rgb(114,227,173)] border-[rgb(80,180,130)] hover:brightness-95",
  inactive: "text-gray-700 hover:bg-[rgb(197,255,224)] transition-colors",
};
