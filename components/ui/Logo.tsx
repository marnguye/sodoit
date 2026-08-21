import Image from "next/image";

const sizes = {
  sm: { width: 64, height: 22 },
  md: { width: 88, height: 30 },
  lg: { width: 112, height: 38 },
} as const;

interface LogoProps {
  size?: keyof typeof sizes;
}

export function Logo({ size = "md" }: LogoProps) {
  const dimensions = sizes[size];

  return (
    <span
      className="relative block shrink-0"
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      <Image
        src="/logo.png"
        alt="Sodoit"
        fill
        priority
        sizes={`${dimensions.width}px`}
        className="object-contain object-left"
      />
    </span>
  );
}
