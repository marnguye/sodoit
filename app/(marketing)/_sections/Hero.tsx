"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HeroPhrases } from "./HeroPhrases";

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="max-w-[840px] mx-auto text-center pt-[140px] pb-24 px-6">
      <h1
        className="font-black text-ink tracking-tight"
        style={{
          fontSize: "clamp(48px, 6.5vw, 80px)",
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
        }}
      >
        <span className="block">Hundreds of</span>
        <span className="block">moments worth</span>
        <span className="relative inline-block mt-1">
          <span className="relative inline-block text-orange-600">
            living{" "}
            <svg
              viewBox="0 0 140 24"
              className="absolute left-0 -bottom-3 w-full h-5 pointer-events-none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M2 14 Q 35 2, 70 14 T 138 12"
                fill="none"
                stroke="#F97316"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: reduceMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { delay: 0.5, duration: 0.8, ease: "easeInOut" }
                }
              />
            </svg>
          </span>{" "}
          for.
        </span>
      </h1>

      <HeroPhrases />

      <div className="mt-8">
        <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          What are you waiting for?{" "}
          <span className="text-orange-600">So do it.</span>
        </span>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/browse"
          className="w-full sm:w-auto bg-accent hover:bg-accent-dark text-white rounded-xl px-9 py-4 text-base font-bold transition-all shadow-lg shadow-orange-600/20"
        >
          Explore all experiences
        </Link>
      </div>
    </section>
  );
}
