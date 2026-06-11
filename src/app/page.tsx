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

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Assets />
        <WhyArc />
        <Security />
        <GetTestnetAssets />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
