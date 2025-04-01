import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FormFieldDate from "@/components/forms/FormFieldDate";
import FormFieldText from "@/components/forms/FormFieldText";

export default function FormField({
  legend,
  type = "text",
  value,
  onChange,
  disabled = false,
  bgColor = "bg-white",
  error = false,
  helperText = "",
  tooltip = "",
}) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    setFilled(!!value);
  }, [value]);

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {type === "date" ? (
        <FormFieldDate
          legend={legend}
          value={value}
          onChange={onChange}
          disabled={disabled}
          bgColor={bgColor}
          error={error}
          helperText={helperText}
          tooltip={tooltip}
        />
      ) : (
        <FormFieldText
          legend={legend}
          value={value}
          onChange={onChange}
          disabled={disabled}
          bgColor={bgColor}
          error={error}
          helperText={helperText}
          tooltip={tooltip}
        />
      )}
    </motion.div>
  );
}
