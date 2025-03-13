import { useContent } from "@/hooks/use-content";
import { 
  LaptopCode, 
  Cloud, 
  ShieldCheck, 
  Server, 
  Globe, 
  Database,
  Terminal,
  LineChart,
  ChevronRight
} from "lucide-react";

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

export default function ServicesSection() {
  const { content, isLoading } = useContent();

  if (isLoading) {
    return (
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-secondary-50 rounded-lg shadow-md overflow-hidden border border-secondary-100">
                <div className="p-6 animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Extract content values with fallbacks
  const title = content?.services?.title || "Our Services";
  const subtitle = content?.services?.subtitle || "Comprehensive technology solutions tailored to meet your business needs.";
  const services: ServiceItem[] = content?.services?.items || [
    {
      title: "Custom Software Development",
      description: "Tailored applications designed to streamline your business processes and enhance productivity.",
      icon: "laptop-code"
    },
    {
      title: "Cloud Solutions",
      description: "Secure, scalable cloud infrastructure and migration services for modern business operations.",
      icon: "cloud"
    },
    {
      title: "Cybersecurity Services",
      description: "Comprehensive protection for your digital assets with advanced threat detection and prevention.",
      icon: "shield-alt"
    }
  ];

  // Map icon names to Lucide icons
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'laptop-code':
        return <LaptopCode className="text-xl" />;
      case 'cloud':
        return <Cloud className="text-xl" />;
      case 'shield-alt':
      case 'shield':
        return <ShieldCheck className="text-xl" />;
      case 'server':
        return <Server className="text-xl" />;
      case 'globe':
        return <Globe className="text-xl" />;
      case 'database':
        return <Database className="text-xl" />;
      case 'terminal':
        return <Terminal className="text-xl" />;
      case 'chart':
      case 'chart-line':
        return <LineChart className="text-xl" />;
      default:
        return <LaptopCode className="text-xl" />;
    }
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-4">
            {title}
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-secondary-500">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-secondary-50 rounded-lg shadow-md overflow-hidden border border-secondary-100 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  {getIcon(service.icon)}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-secondary-800">
                  {service.title}
                </h3>
                <p className="text-secondary-600 mb-4">
                  {service.description}
                </p>
                <a 
                  href="#contact" 
                  className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                >
                  Learn more
                  <ChevronRight className="ml-1 w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
