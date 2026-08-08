"use client";

import { useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { createComment } from "./actions";

const MAX_LENGTH = 2000;

interface CommentFormProps {
  postId: string;
  signedIn: boolean;
}

export function CommentForm({ postId, signedIn }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const content = body.trim();
  const canSubmit =
    signedIn && content.length > 0 && body.length <= MAX_LENGTH && !isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await createComment(postId, body);

      if (!result.success) {
        setError(result.error ?? "Could not post comment.");
        return;
      }

      setBody("");
      formRef.current?.reset();
    });
  }

  if (!signedIn) {
    return (
      <div className="rounded-xl border border-border bg-white px-4 py-4">
        <p className="text-sm text-muted">Log in to join the conversation.</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-white p-4"
    >
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder="Write a comment..."
        aria-label="Write a comment"
        className="w-full resize-none bg-transparent text-sm leading-6 text-ink outline-none placeholder:text-muted"
      />

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted">
          {body.length} / {MAX_LENGTH}
        </span>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />

          {isPending ? "Posting..." : "Comment"}
        </button>
      </div>
    </form>
  );
}
