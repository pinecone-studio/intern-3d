import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  LandingFooter,
  LandingNav,
  UseCasesSection,
} from './components';

export default function Page() {
  return (
    <main className="landing-page">
      <LandingNav />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
