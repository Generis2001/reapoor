import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Assets } from "@/components/landing/Assets";
import { WhyArc } from "@/components/landing/WhyArc";
import { Security } from "@/components/landing/Security";
import { GetTestnetAssets } from "@/components/landing/GetTestnetAssets";
import { FAQ } from "@/components/landing/FAQ";
import { getProtocolMetrics, METRICS_FALLBACK } from "@/lib/metrics";

// Revalidate this page every 60 seconds (ISR)
export const revalidate = 60;

export default async function LandingPage() {
  const metrics = await getProtocolMetrics().catch(() => METRICS_FALLBACK);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About metrics={metrics} />
        <HowItWorks />
        <Assets metrics={metrics} />
        <WhyArc />
        <Security />
        <GetTestnetAssets />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
