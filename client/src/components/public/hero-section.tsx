import { useContent } from "@/hooks/use-content";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { content, isLoading } = useContent();

  if (isLoading) {
    return (
      <section id="home" className="bg-gradient-to-r from-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-primary-600 rounded mb-6 w-3/4"></div>
            <div className="h-8 bg-primary-600 rounded mb-8 w-1/2"></div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="h-12 bg-white/20 rounded w-40"></div>
              <div className="h-12 bg-white/20 rounded w-40"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Extract content values with fallbacks
  const title = content?.hero?.title || "Technology Solutions for Growing Businesses";
  const subtitle = content?.hero?.subtitle || "Customized IT consulting and development services to help your business thrive in the digital landscape.";

  return (
    <section id="home" className="bg-gradient-to-r from-primary-700 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild variant="secondary" size="lg">
                <a href="#contact">Get Started</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-primary-600">
                <a href="#services">Our Services</a>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
              className="rounded-lg shadow-xl"
              alt="Technology Consultation"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
