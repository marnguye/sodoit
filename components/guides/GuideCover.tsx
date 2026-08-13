import Image from "next/image";

interface GuideCoverProps {
  imageUrl: string | null;
  imageAlt: string | null;
  title: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

function canOptimize(imageUrl: string) {
  if (imageUrl.startsWith("/")) return true;

  try {
    const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!configuredUrl) return false;

    const image = new URL(imageUrl);
    const configured = new URL(configuredUrl);
    return (
      image.protocol === "https:" && image.hostname === configured.hostname
    );
  } catch {
    return false;
  }
}

export function GuideCover({
  imageUrl,
  imageAlt,
  title,
  className = "",
  sizes = "100vw",
  priority = false,
}: GuideCoverProps) {
  if (!imageUrl || !canOptimize(imageUrl)) {
    return (
      <span
        aria-hidden="true"
        className={`relative block overflow-hidden bg-accent-wash ${className}`}
      >
        <span className="absolute -right-1/4 -top-1/3 h-3/4 w-3/4 rounded-full bg-accent-light/40 blur-2xl" />
        <span className="absolute -bottom-1/3 -left-1/4 h-2/3 w-2/3 rounded-full bg-accent/10 blur-2xl" />
      </span>
    );
  }

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image
        src={imageUrl}
        alt={imageAlt ?? title}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
      />
    </span>
  );
}
