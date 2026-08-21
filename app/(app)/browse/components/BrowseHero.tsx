import Image from "next/image";
import type { ReactNode } from "react";

interface BrowseHeroProps {
  children: ReactNode;
}

export function BrowseHero({ children }: BrowseHeroProps) {
  return (
    <section className="relative overflow-hidden pb-5 pt-0 sm:py-6 lg:py-8">
      <div className="relative">
        <div className="relative -mx-4 h-[130px] overflow-hidden sm:hidden">
          <Image
            src="/illustrations/browse-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="select-none scale-[1.12] object-contain object-center"
          />
        </div>

        <div className="grid items-center gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:gap-8">
          <div className="relative z-10">
            <div className="max-w-[560px]">
              <h1 className="text-[34px] font-extrabold leading-[0.98] tracking-[-0.035em] text-ink sm:text-[42px] lg:text-[56px]">
                Things worth doing.
              </h1>

              <p className="mt-3 max-w-[500px] text-[15px] leading-6 text-secondary sm:text-base lg:text-lg">
                Find something worth experiencing, save it, and make it part of
                your Life List.
              </p>

              <div className="mt-5 max-w-[560px]">{children}</div>
            </div>
          </div>

          <div className="relative hidden h-[240px] sm:block lg:hidden">
            <Image
              src="/illustrations/browse-hero.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="select-none object-contain object-center"
            />
          </div>

          <div className="pointer-events-none relative hidden h-[330px] lg:block">
            <Image
              src="/illustrations/browse-hero.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1440px) 760px, 55vw"
              className="select-none object-contain object-right"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
