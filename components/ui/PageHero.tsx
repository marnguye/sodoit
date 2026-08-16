interface PageHeroProps {
  title: string;
  subtitle: string;
}

export function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="pb-4 pt-1">
      <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.025em] text-ink sm:text-3xl">
        {title}
      </h1>

      <p className="mt-1.5 max-w-xl text-sm leading-6 text-secondary">
        {subtitle}
      </p>
    </section>
  );
}
