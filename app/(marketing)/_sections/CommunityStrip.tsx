"use client";

export const cards = [
  {
    task: "Watch the sunrise from a summit",
    category: "Adventure",
    photo:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
  },
  {
    task: "Try authentic local street food",
    category: "Food",
    photo:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  },
  {
    task: "Explore a new city completely on foot",
    category: "Travel",
    photo:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
  },
  {
    task: "Swim in the open ocean",
    category: "Adventure",
    photo:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
  },
  {
    task: "Dance at an outdoor music festival",
    category: "Culture",
    photo:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80",
  },
  {
    task: "Cook a complex meal completely from scratch",
    category: "Food",
    photo:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80",
  },
  {
    task: "Camp and sleep under the stars",
    category: "Adventure",
    photo:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
  },
  {
    task: "Wander through a foreign city at night",
    category: "Travel",
    photo:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80",
  },
];

const loop = [...cards, ...cards];

export function CommunityStrip() {
  return (
    <section className="py-[60px]">
      <p className="text-center text-accent text-xs font-bold uppercase tracking-[0.1em]">
        What people are completing
      </p>

      <div
        className="mt-5 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, white 60px, white calc(100% - 60px), transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, white 60px, white calc(100% - 60px), transparent)",
        }}
      >
        <div className="community-scroll flex gap-4 px-[60px] w-max">
          {loop.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-[20px] border border-border w-[220px] shrink-0 overflow-hidden"
            >
              <div
                className="h-[160px] bg-cover bg-center"
                style={{ backgroundImage: `url(${card.photo})` }}
              />
              <div className="px-3.5 py-3.5 relative">
                <p className="text-[13px] font-bold text-ink pr-14">
                  {card.task}
                </p>
                <span className="absolute bottom-3 right-3.5 bg-accent-light text-accent-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {card.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .community-scroll {
          animation: sodoit-scroll 60s linear infinite;
        }
        .community-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes sodoit-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .community-scroll {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
