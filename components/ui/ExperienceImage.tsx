import Image from "next/image";
import { getTaskMeta } from "@/app/(app)/browse/types";

interface ExperienceImageProps {
  id: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  className?: string;
  sizes?: string;
}

export function ExperienceImage({
  id,
  title,
  imageUrl,
  imageAlt,
  className = "",
  sizes = "128px",
}: ExperienceImageProps) {
  if (!imageUrl) {
    const { thumbnail } = getTaskMeta(id);

    return (
      <span
        aria-hidden="true"
        className={`block shrink-0 ${className}`}
        style={{ backgroundColor: thumbnail }}
      />
    );
  }

  return (
    <span className={`relative block shrink-0 overflow-hidden ${className}`}>
      <Image
        src={imageUrl}
        alt={imageAlt ?? title}
        fill
        sizes={sizes}
        className="object-cover"
      />
    </span>
  );
}
