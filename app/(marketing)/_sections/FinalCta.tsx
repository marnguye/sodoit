import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-card border-t border-border py-[120px] text-center px-6">
      <h2
        className="font-black text-ink mx-auto"
        style={{
          fontSize: "clamp(36px, 5vw, 60px)",
          letterSpacing: "-0.03em",
          maxWidth: "700px",
        }}
      >
        <span className="block">Stop scrolling.</span>
        <span className="block">Start living.</span>
      </h2>

      <div className="mt-9">
        <Link
          href="/browse"
          className="inline-block bg-accent hover:bg-accent-dark text-white rounded-xl px-9 py-3.5 text-base font-bold transition-colors"
        >
          Start your list
        </Link>
      </div>
    </section>
  );
}
