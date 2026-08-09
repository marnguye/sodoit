export function getSafeNextPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /^\/app(?:[/?#]|$)/.test(value)
  ) {
    return "/";
  }
  return value;
}

export function loginHrefWithNext(pathname: string): string {
  return `/login?next=${encodeURIComponent(pathname)}`;
}
