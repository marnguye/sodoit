export function formatCompactCount(count: number): string {
  if (count < 1000) return String(count);
  const thousands = (count / 1000).toFixed(1).replace(/\.0$/, "");
  return `${thousands}k`;
}
