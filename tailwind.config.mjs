/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-emerald-500", "border-emerald-600", "hover:bg-emerald-600",
    "bg-rose-600", "border-rose-700", "hover:bg-rose-700",
    "bg-sky-100", "text-sky-700", "border-sky-300", "hover:bg-sky-200",
    "bg-sky-600", "border-sky-700", "hover:bg-sky-700",
    "bg-gray-200", "border-gray-300", "hover:bg-gray-300",
    "bg-gray-100", "border-gray-200", "hover:bg-gray-200",
    "bg-gray-900", "hover:bg-gray-800",
    "bg-indigo-600", "border-indigo-700", "hover:bg-indigo-700",
    "bg-amber-500", "border-amber-600", "hover:bg-amber-600",
    "text-white", "text-black", "text-gray-600", "text-gray-800",
    "text-emerald-600", "text-rose-600", "text-sky-600",
    "hover:bg-sky-50", "hover:bg-rose-50", "hover:bg-emerald-50", "hover:bg-gray-100",
  ]
};
