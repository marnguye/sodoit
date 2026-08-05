const colors = [
  "#FED7AA",
  "#FDE68A",
  "#BBF7D0",
  "#BAE6FD",
  "#E9D5FF",
  "#FECACA",
];

const sizes = {
  sm: { box: "24px", font: "10px" },
  md: { box: "36px", font: "14px" },
  lg: { box: "48px", font: "18px" },
} as const;

function colorForName(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function initialsForName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof sizes;
}) {
  const { box, font } = sizes[size];
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: box,
        height: box,
        background: colorForName(name),
        fontSize: font,
        fontWeight: 700,
        color: "var(--color-ink)",
      }}
    >
      {initialsForName(name)}
    </div>
  );
}
