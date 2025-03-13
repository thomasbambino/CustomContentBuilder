import { useEffect } from "react";
import Navbar from "@/components/public/navbar";
import HeroSection from "@/components/public/hero-section";
import ServicesSection from "@/components/public/services-section";
import AboutSection from "@/components/public/about-section";
import TestimonialsSection from "@/components/public/testimonials-section";
import ContactSection from "@/components/public/contact-section";
import Footer from "@/components/public/footer";

export default function HomePage() {
  // Handle smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.hash && link.hash.startsWith("#")) {
        e.preventDefault();
        const id = link.hash.substring(1);
        const element = document.getElementById(id);
        
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80, // Offset for fixed header
            behavior: "smooth",
          });
          
          // Update URL without page reload
          history.pushState(null, "", link.hash);
        }
      }
    };
    
    document.addEventListener("click", handleAnchorClick);
    
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  // Handle initial scroll to hash on load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      const element = document.getElementById(id);
      
      if (element) {
        setTimeout(() => {
          window.scrollTo({
            top: element.offsetTop - 80,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow w-full">
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
