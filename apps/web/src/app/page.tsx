import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";

import { PackagesSection } from "@/components/PackagesSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { AgencyCTA } from "@/components/AgencyCTA";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />

      <PackagesSection />

      <DestinationsSection />


      <FeaturesSection />

      <AgencyCTA />

      <TestimonialsSection />

      <ContactSection />


      <Footer />
    </main>
  );
}
