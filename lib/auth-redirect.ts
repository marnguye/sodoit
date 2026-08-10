export function getSafeNextPath(value: string | null | undefined): string {
  if (!value) return "/";

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return "/";
  }

  if (
    !value.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(decoded) ||
    /^\/app(?:[/?#]|$)/.test(decoded)
  ) {
    return "/";
  }
  return value;
}

export function loginHrefWithNext(pathname: string): string {
  return `/login?next=${encodeURIComponent(pathname)}`;
}
