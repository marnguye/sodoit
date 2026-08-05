"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";

const CYCLE_MS = 2800;
const MUTED = "#78716C";
const ACCENT = "#F97316";

type IconProps = { isActive?: boolean; staticEnd?: boolean };

function CheckboxIcon({ isActive, staticEnd }: IconProps) {
  const boxControls = useAnimation();
  const checkControls = useAnimation();

  useEffect(() => {
    if (!isActive) return;
    boxControls.set({ borderColor: MUTED });
    checkControls.set({ pathLength: 0 });
    boxControls.start({
      borderColor: ACCENT,
      transition: { duration: 0.3, delay: 0.2 },
    });
    checkControls.start({
      pathLength: 1,
      transition: { duration: 0.4, delay: 0.3, ease: "easeOut" },
    });
  }, [isActive, boxControls, checkControls]);

  return (
    <motion.div
      animate={staticEnd ? undefined : boxControls}
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        border: `2px solid ${staticEnd ? ACCENT : MUTED}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 12 10" width={12} height={10}>
        <motion.path
          d="M1 5 L4.5 8.5 L11 1"
          stroke={ACCENT}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: staticEnd ? 1 : 0 }}
          animate={staticEnd ? undefined : checkControls}
        />
      </svg>
    </motion.div>
  );
}

function CameraIcon({ isActive }: IconProps) {
  const scaleControls = useAnimation();
  const flashControls = useAnimation();

  useEffect(() => {
    if (!isActive) return;
    scaleControls.set({ scale: 1 });
    flashControls.set({ opacity: 0 });
    scaleControls.start({
      scale: [1, 1.15, 1],
      transition: { duration: 0.2, delay: 0.4, ease: "easeInOut" },
    });
    flashControls.start({
      opacity: [0, 0.9, 0],
      transition: { duration: 0.25, delay: 0.4 },
    });
  }, [isActive, scaleControls, flashControls]);

  return (
    <motion.div
      animate={scaleControls}
      style={{ width: 22, height: 16, position: "relative", flexShrink: 0 }}
    >
      <div
        style={{
          width: 22,
          height: 16,
          background: MUTED,
          borderRadius: 4,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 8,
            height: 4,
            background: MUTED,
            borderRadius: "2px 2px 0 0",
            position: "absolute",
            top: -4,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            border: "2px solid #FAFAF9",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <motion.div
        animate={flashControls}
        style={{
          position: "absolute",
          inset: -4,
          background: "white",
          borderRadius: 6,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

const AVATAR_COLORS = ["#FED7AA", "#BAE6FD", "#BBF7D0"];

function AvatarStackIcon({ isActive, staticEnd }: IconProps) {
  const controlsA = useAnimation();
  const controlsB = useAnimation();
  const controlsC = useAnimation();
  const controls = [controlsA, controlsB, controlsC];

  useEffect(() => {
    if (!isActive) return;
    controls.forEach((c, i) => {
      c.set({ opacity: 0, scale: 0.6 });
      c.start({
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          delay: i * 0.1,
          ease: [0.34, 1.56, 0.64, 1],
        },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div style={{ display: "flex" }}>
      {AVATAR_COLORS.map((color, i) => (
        <motion.div
          key={color}
          animate={staticEnd ? undefined : controls[i]}
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid white",
            background: color,
            marginLeft: i === 0 ? 0 : -6,
            opacity: staticEnd ? 1 : undefined,
          }}
        />
      ))}
    </div>
  );
}

const PHRASES: { text: string; Icon: (props: IconProps) => ReactNode }[] = [
  { text: "Check them off.", Icon: CheckboxIcon },
  { text: "Share your memories.", Icon: CameraIcon },
  { text: "See what others are living.", Icon: AvatarStackIcon },
];

function PhraseRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {icon}
      <span className="text-lg text-muted" style={{ fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
}

export function HeroPhrases() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="mt-7 flex flex-col items-center gap-3">
        {PHRASES.map(({ text, Icon }) => (
          <PhraseRow key={text} icon={<Icon staticEnd />} text={text} />
        ))}
      </div>
    );
  }

  return <CyclingPhrase />;
}

function CyclingPhrase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const { text, Icon } = PHRASES[index];

  return (
    <div
      className="mt-7 flex items-center justify-center"
      style={{ height: 36 }}
    >
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PhraseRow icon={<Icon isActive />} text={text} />
      </motion.div>
    </div>
  );
}
