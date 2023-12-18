import type { HTMLInputTypeAttribute } from "react";

type Options = {
  autoComplete?: string;
  className?: string;
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
  className,
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
      <p>
        <label htmlFor={name}>{label}</label>
        <span
          className="text-end text-sm text-red-500 float-right leading-6"
          id={`${name}-error`}
        >
          {error}
        </span>
      </p>
      <input
        key={name}
        aria-invalid={Boolean(error)}
        aria-describedby={`${name}-error`}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
        className={
          "bg-neutral-100 rounded dark:bg-neutral-600 w-full " + className ?? ""
        }
      />
    </>
  );
}
