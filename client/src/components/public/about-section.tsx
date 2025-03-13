import { useContent } from "@/hooks/use-content";
import { CheckCircle } from "lucide-react";

export default function AboutSection() {
  const { content, isLoading } = useContent();

  if (isLoading) {
    return (
      <section id="about" className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10 animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-6 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-6 w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
            </div>
            <div className="lg:w-1/2 animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-48 mt-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Extract content values with fallbacks
  const title = content?.about?.title || "About SD Tech Pros";
  const description = content?.about?.description || 
    "With over 10 years of experience in the technology industry, SD Tech Pros specializes in delivering innovative solutions to businesses of all sizes. Our team of experts is committed to understanding your unique challenges and providing tailored solutions that drive growth and efficiency.";
  const mission = content?.about?.mission || 
    "Our mission is to empower businesses through technology, making complex solutions accessible and manageable for our clients.";

  return (
    <section id="about" className="py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-6">
              {title}
            </h2>
            <p className="text-lg text-secondary-600 mb-6">
              {description}
            </p>
            <p className="text-lg text-secondary-600 mb-6">
              {mission}
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <div className="text-primary-600 mr-2">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-secondary-700">Certified Experts</span>
              </div>
              <div className="flex items-center">
                <div className="text-primary-600 mr-2">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-secondary-700">24/7 Support</span>
              </div>
              <div className="flex items-center">
                <div className="text-primary-600 mr-2">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-secondary-700">Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80" alt="Team working together" className="rounded-lg shadow-md" />
              <img src="https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80" alt="Office space" className="rounded-lg shadow-md mt-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
