import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import ValueProposition from "@/components/value-proposition"
import VenueSection from "@/components/venue-section"
import ConsultationSection from "@/components/consultation-section"
import ProjectGallery from "@/components/project-gallery"
import FAQ from "@/components/faq"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ValueProposition />
      <VenueSection />
      <ConsultationSection />
      <ProjectGallery />
      <FAQ />
      <Footer />
    </main>
  )
}