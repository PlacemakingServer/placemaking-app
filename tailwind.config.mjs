/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
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
