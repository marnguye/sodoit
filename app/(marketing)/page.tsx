import { Hero } from "./_sections/Hero";
import { CommunityStrip } from "./_sections/CommunityStrip";
import { HowItWorks } from "./_sections/HowItWorks";
// import { ExperiencePreview } from "./_sections/ExperiencePreview";
// import { FinalCta } from "./_sections/FinalCta";
import { Footer } from "./_sections/Footer";

export default function LandingPage() {
  return (
    <div className="w-full">
      <Hero />
      <CommunityStrip />
      <HowItWorks />
      {/* <ExperiencePreview /> */}
      {/* <FinalCta /> */}
      <Footer />
    </div>
  );
}
