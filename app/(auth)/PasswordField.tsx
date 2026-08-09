"use client";

import { ReactNode, useState } from "react";

const INPUT_CLASS =
  "w-full h-11 border border-border rounded-md px-3.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  labelExtra,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
  labelExtra?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
        {labelExtra}
      </div>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={INPUT_CLASS}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          👁
        </button>
      </div>
    </div>
  );
}

export { INPUT_CLASS };
