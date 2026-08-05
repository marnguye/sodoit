"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const categories = [
  {
    emoji: "🏔",
    name: "Adventure",
    example: "Climb something that scares you",
    count: 24,
  },
  {
    emoji: "✈️",
    name: "Travel",
    example: "Get lost in a city you've never visited",
    count: 31,
  },
  {
    emoji: "🍜",
    name: "Food",
    example: "Eat street food in a country you've never been to",
    count: 18,
  },
  {
    emoji: "🎨",
    name: "Creative",
    example: "Make something with your hands from scratch",
    count: 22,
  },
  {
    emoji: "🤝",
    name: "Social",
    example: "Talk to a stranger and learn their story",
    count: 15,
  },
  {
    emoji: "🧘",
    name: "Wellness",
    example: "Spend a full day completely offline",
    count: 19,
  },
];

export function ExperiencePreview() {
  const reduceMotion = useReducedMotion();

  return (
    <section style={{ background: "#F5F5F4" }} className="py-[100px]">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        <p className="text-accent text-xs font-bold uppercase tracking-[0.1em]">
          Explore by category
        </p>
        <h2
          className="font-extrabold text-ink mt-3"
          style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
        >
          Something for everyone.
        </h2>

        <div className="mt-12 max-w-[960px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.name}
              className="group"
              initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                href="/browse"
                className="block bg-card border border-border rounded-[20px] p-6 md:p-7 text-left hover:border-accent transition-colors duration-200"
              >
                <div style={{ fontSize: 28, lineHeight: 1 }} className="mb-4">
                  {category.emoji}
                </div>
                <h3 className="text-xl font-extrabold text-ink">
                  {category.name}
                </h3>
                <p
                  className="text-sm text-muted mt-1.5 italic"
                  style={{ lineHeight: 1.5 }}
                >
                  {category.example}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="bg-accent-light text-accent-dark text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {category.count} experiences
                  </span>
                  <span className="text-accent text-base font-bold transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          href="/browse"
          className="inline-block mt-10 text-accent font-semibold text-[15px] hover:text-accent-dark transition-colors"
        >
          Browse all experiences →
        </Link>
      </div>
    </section>
  );
}
