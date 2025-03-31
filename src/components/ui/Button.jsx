import React from "react";
import clsx from "clsx";
import { VARIANTS } from "@/config/colors";

export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const baseStyle = "py-2 px-2 rounded font-medium transition";


  return (
    <button
      className={clsx(baseStyle, VARIANTS[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
