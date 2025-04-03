import React from "react";
import Select from "react-select";

export default function MultiSelect({ options = [], value = [], onChange, placeholder = "Selecione...", isDisabled = false, isMulti = true,  closeMenuOnSelect = false }) {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDisabled ? "#f3f4f6" : "#fff", // Tailwind bg-gray-100
      borderColor: state.isFocused ? "#22c55e" : "#d1d5db", // green-500 / gray-300
      boxShadow: state.isFocused ? "0 0 0 2px rgba(34, 197, 94, 0.3)" : "none",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      padding: "2px 4px",
      transition: "all 0.2s ease",
      cursor: isDisabled ? "not-allowed" : "default",
      minHeight: "42px",
    }),
    option: (base, { isSelected, isFocused }) => ({
      ...base,
      backgroundColor: isSelected
        ? "#22c55e" // green-500
        : isFocused
        ? "#e5f9ed" // green-100-ish
        : "#fff",
      color: isSelected ? "white" : "#111827", // gray-900
      padding: "10px 12px",
      fontSize: "0.875rem",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#d1fae5", // green-100
      borderRadius: "6px",
      padding: "2px 4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#065f46", // green-800
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#047857", // green-700
      ":hover": {
        backgroundColor: "#a7f3d0", // green-200
        color: "#064e3b", // green-900
      },
    }),
  };

  return (
    <Select
      isMulti={isMulti}
      isDisabled={isDisabled}
      options={options}
      value={value}
      onChange={onChange}
      styles={customStyles}
      placeholder={placeholder}
      className="text-sm"
      closeMenuOnSelect={closeMenuOnSelect}
    />
  );
}
