import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const baseStyle = "py-2 px-4 rounded-xl font-medium transition duration-200 border";

  const variants = {
    verde: "text-black bg-[rgb(114,227,173)] border-[rgb(80,180,130)] hover:brightness-95",
    vermelho: "text-white bg-red-600 border-transparent hover:bg-red-700",
    vermelho_claro: "text-red-700 bg-red-100 border-red-400 hover:bg-red-200",
    azul_claro: "text-black bg-blue-200 border-blue-600 hover:bg-blue-300",
    cinza: "text-black bg-gray-300 border-gray-800 hover:bg-gray-400",
    azul_escuro: "text-white bg-blue-600 border-transparent hover:bg-blue-700"
  };

  return (
    <button
      className={clsx(baseStyle, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
