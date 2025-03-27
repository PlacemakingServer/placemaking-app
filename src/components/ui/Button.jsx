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
    azul_claro: "text-blue-600 bg-blue-200 border-blue-600 hover:bg-blue-300",
    cinza: "text-black bg-gray-300 border-gray-800 hover:bg-gray-400",
    azul_escuro: "text-white bg-blue-600 border-transparent hover:bg-blue-700",
    transparent_azul: "text-blue-600 bg-transparent border-transparent hover:bg-blue-50",
    transparent_vermelho: "text-red-600 bg-transparent border-transparent hover:bg-red-50",
    transparent_verde: "text-green-600 bg-transparent border-transparent hover:bg-green-50",
    transparent_cinza: "text-gray-600 bg-transparent border-transparent hover:bg-gray-50",
    primary: "text-white bg-blue-500 border-transparent hover:bg-blue-600",
    secondary: "text-white bg-gray-500 border-transparent hover:bg-gray-600",
    danger: "text-white bg-red-600 border-transparent hover:bg-red-700",
    warning: "text-black bg-yellow-400 border-transparent hover:bg-yellow-500",
    success: "text-white bg-green-500 border-transparent hover:bg-green-600",
    info: "text-white bg-blue-400 border-transparent hover:bg-blue-500",
    light: "text-black bg-gray-100 border-transparent hover:bg-gray-200",
    dark: "text-white bg-gray-800 border-transparent hover:bg-gray-900",
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
