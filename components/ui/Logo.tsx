const sizes = {
  sm: "20px",
  md: "28px",
  lg: "40px",
} as const;

export function Logo({
  size = "md",
  showDot = true,
}: {
  size?: keyof typeof sizes;
  showDot?: boolean;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-jomhuria)",
        fontSize: sizes[size],
        lineHeight: 1,
      }}
    >
      SODOIT
      {showDot && (
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            marginLeft: "2px",
            background: "#F97316",
            borderRadius: "50%",
            verticalAlign: "baseline",
          }}
        />
      )}
    </span>
  );
}
