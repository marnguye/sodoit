"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  isValid: boolean;
  onInvalidClick: () => void;
}

export function SubmitButton({ isValid, onInvalidClick }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={!isValid || pending}
      onClick={(event) => {
        if (!isValid) {
          event.preventDefault();
          onInvalidClick();
        }
      }}
      className={`h-11 rounded-md px-5 text-sm font-bold transition-colors ${
        isValid && !pending
          ? "bg-accent text-white hover:bg-accent-dark"
          : "bg-border text-muted"
      }`}
    >
      {pending ? "Posting…" : "Post to Feed"}
    </button>
  );
}
