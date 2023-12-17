import type { HTMLInputTypeAttribute } from "react";

type Options = {
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type: HTMLInputTypeAttribute;
};

export function Field({
  autoComplete,
  defaultValue,
  error,
  label,
  name,
  placeholder,
  required,
  type,
}: Options) {
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <input
        aria-invalid={Boolean(error)}
        aria-describedby={`${name}-error`}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
        className="dark:bg-slate-600"
      />
      <div style={{ color: "red" }} id={`${name}-error`}>
        {error}
      </div>
    </>
  );
}
