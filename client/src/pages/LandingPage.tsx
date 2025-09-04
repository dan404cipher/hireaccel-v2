import { CTA } from "@/components/landingpage/CtA";
import { Features } from "@/components/landingpage/Features";
import { Footer } from "@/components/landingpage/Footer";
import { Header } from "@/components/landingpage/Header";
import { Hero } from "@/components/landingpage/Hero";
import { HowItWorks } from "@/components/landingpage/HowItWorks";
import { Stats } from "@/components/landingpage/Stats";
import { TalentPool } from "@/components/landingpage/TalentPool";
import { Testimonials } from "@/components/landingpage/Testimonials";

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
    <Header />
    <main>
      <Hero />
      <section id="features">
        <Features />
      </section>
      <TalentPool />
      <section id="why-choose">
        <HowItWorks />
      </section>
      <Stats />
      <section id="testimonials">
        <Testimonials />
      </section>
      <CTA />
    </main> 
    <Footer />
  </div>
  );
};

export default LandingPage;