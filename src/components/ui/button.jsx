export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const baseStyle = "py-2 px-4 rounded-xl font-medium transition duration-200 border";

  const variants = {
    primary: "text-white bg-blue-600 border-transparent hover:bg-blue-700",
    danger: "text-white bg-red-600 border-red-700 hover:bg-red-700",
    secondary: "text-black bg-gray-200 border-gray-300 hover:bg-gray-300",
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
