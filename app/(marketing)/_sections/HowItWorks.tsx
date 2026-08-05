"use client";

import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Browse the list",
    body: "Pick from hundreds of real-life experiences — travel, food, creativity, adventure, and more. Or add your own.",
  },
  {
    n: "02",
    title: "Check it off",
    body: "Mark it done whenever you're ready. Add a photo if you want. It's never required — just optional proof.",
  },
  {
    n: "03",
    title: "See the community",
    body: "A live feed of what people around you are completing. Real moments, real people, real inspiration.",
  },
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-card py-[100px]">
      <div className="max-w-[1000px] mx-auto px-6">
        <p className="text-center text-accent text-xs font-bold uppercase tracking-[0.1em]">
          How it works
        </p>
        <h2
          className="text-center font-extrabold text-ink mt-3"
          style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
        >
          Three steps. That's it.
        </h2>

        <div className="mt-[60px] max-w-[560px] mx-auto flex flex-col gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              className="flex gap-6"
              initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-xs font-black">
                    {step.n.replace("0", "")}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-2 mb-2 min-h-[40px]" />
                )}
              </div>
              <div className="pb-10 pt-0.5 flex-1">
                <h3 className="text-xl font-extrabold text-ink">
                  {step.title}
                </h3>
                <p className="text-[15px] text-muted leading-[1.6] mt-2">
                  {step.body}
                </p>
                {i === 1 && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-[4px] border-2 border-accent flex items-center justify-center">
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="#F97316"
                          strokeWidth="2"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <span className="text-[12px] text-muted">
                      Swim in the open ocean
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
