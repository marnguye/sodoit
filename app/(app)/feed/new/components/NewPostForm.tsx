"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { createPost } from "../../actions";
import type { PostType } from "../../types";
import { PostTypeSelector } from "./PostTypeSelector";
import { ExperienceSelector, ExperienceOption } from "./ExperienceSelector";
import { SubmitButton } from "./SubmitButton";

const TITLE_MAX = 140;

const TITLE_PLACEHOLDER: Record<PostType, string> = {
  question: "What do you want to ask?",
  tip: "What's the tip in one line?",
  experience: "What did you do?",
};

interface NewPostFormProps {
  experiences: ExperienceOption[];
}

export function NewPostForm({ experiences }: NewPostFormProps) {
  const [type, setType] = useState<PostType | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [experience, setExperience] = useState<ExperienceOption | null>(null);
  const [attempted, setAttempted] = useState(false);

  const isValid =
    Boolean(type) && title.trim().length > 0 && body.trim().length > 0;

  const showTypeError = attempted && !type;
  const showTitleError = attempted && !title.trim();
  const showBodyError = attempted && !body.trim();

  return (
    <Card className="flex flex-col gap-6">
      <form action={createPost} className="flex flex-col gap-6">
        <input type="hidden" name="type" value={type ?? ""} />
        <input type="hidden" name="experienceId" value={experience?.id ?? ""} />

        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">
            What kind of post is this?
          </label>
          <PostTypeSelector value={type} onChange={setType} />
          {showTypeError && (
            <p className="mt-1.5 text-xs text-red-600">
              Choose a post type to continue.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="experience-search"
            className="block text-[13px] font-semibold text-ink mb-1.5"
          >
            Linked experience (optional)
          </label>
          <ExperienceSelector
            experiences={experiences}
            value={experience}
            onChange={setExperience}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-ink"
            >
              Title
            </label>
            <span className="text-xs text-muted">
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={TITLE_MAX}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={
              type ? TITLE_PLACEHOLDER[type] : "Give your post a clear title"
            }
            className="w-full h-14 rounded-lg border-2 border-border bg-white px-4 text-lg font-semibold text-ink placeholder:font-normal placeholder:text-muted transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          {showTitleError && (
            <p className="mt-1.5 text-xs text-red-600">Title is required.</p>
          )}
        </div>

        <div>
          <label
            htmlFor="body"
            className="block text-[13px] font-semibold text-ink mb-1.5"
          >
            Body
          </label>
          <textarea
            id="body"
            name="body"
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share the details — what happened, what you learned, or what you need help with."
            style={{ minHeight: 240 }}
            className="w-full rounded-md border border-border bg-white p-4 text-sm leading-relaxed transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          {showBodyError && (
            <p className="mt-1.5 text-xs text-red-600">Body is required.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
          <Link
            href="/feed"
            className="h-11 rounded-md border border-border px-5 text-sm font-semibold text-ink transition-colors hover:bg-background flex items-center"
          >
            Cancel
          </Link>
          <SubmitButton
            isValid={isValid}
            onInvalidClick={() => setAttempted(true)}
          />
        </div>
      </form>
    </Card>
  );
}
