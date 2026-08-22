"use client";

import { useRouter } from "next/navigation";

import type { BrowseSort, BrowseView, StatusFilter } from "../types";

interface BrowseState {
  q: string;
  category: string | null;
  difficulty: string | null;
  status: StatusFilter;
  sort: BrowseSort;
  view: BrowseView;
}

function buildBrowseHref(state: BrowseState) {
  const params = new URLSearchParams();

  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.difficulty) params.set("difficulty", state.difficulty);
  if (state.status !== "all") params.set("status", state.status);
  if (state.sort !== "recommended") params.set("sort", state.sort);
  if (state.view !== "grid") params.set("view", state.view);

  const query = params.toString();

  return query ? `/?${query}` : "/";
}

export function useBrowseNavigation(state: BrowseState) {
  const router = useRouter();

  function navigate(patch: Partial<BrowseState>) {
    router.push(
      buildBrowseHref({
        ...state,
        ...patch,
      }),
    );
  }

  return {
    navigate,
    clear: () => router.push("/"),
  };
}
