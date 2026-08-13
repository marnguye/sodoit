import Image from "next/image";

const colors = [
  "#FED7AA",
  "#FDE68A",
  "#BBF7D0",
  "#BAE6FD",
  "#E9D5FF",
  "#FECACA",
] as const;

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

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const { box, font } = sizes[size];

  if (src) {
    return (
      <span
        className="relative block shrink-0 overflow-hidden rounded-full"
        style={{ width: box, height: box }}
      >
        <Image src={src} alt={name} fill sizes={box} className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-ink"
      style={{
        width: box,
        height: box,
        backgroundColor: colorForName(name),
        fontSize: font,
      }}
    >
      {initialsForName(name)}
    </span>
  );
}
