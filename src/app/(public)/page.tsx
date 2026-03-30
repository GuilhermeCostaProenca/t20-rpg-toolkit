import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingGenres } from "@/components/landing/landing-genres";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingMission } from "@/components/landing/landing-mission";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingShowcase } from "@/components/landing/landing-showcase";
import { LandingToolkit } from "@/components/landing/landing-toolkit";

export default function LandingPage() {
  return (
    <main className="bg-black text-white">
      <LandingNavbar />
      <LandingHero />
      <LandingToolkit />
      <LandingGenres />
      <LandingMission />
      <LandingShowcase />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
