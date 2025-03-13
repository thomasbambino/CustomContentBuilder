import { Link } from 'wouter';
import { useTheme } from '@/components/theme/theme-provider';
import { useQuery } from '@tanstack/react-query';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Github 
} from 'lucide-react';

export default function Footer() {
  const { companyName, logoUrl } = useTheme();
  
  // Fetch content data
  const { data: services } = useQuery({
    queryKey: ['/api/services'],
  });
  
  // Fetch contact information
  const { data: contactData } = useQuery({
    queryKey: ['/api/content/type/contact'],
  });
  
  // Extract contact info from settings
  const contactInfo = contactData?.[0]?.settings || {};
  const contactAddress = contactInfo.address || "123 Tech Boulevard, Suite 456\nSan Diego, CA 92101";
  const contactPhone = contactInfo.phone || "(619) 555-1234";
  const contactEmail = contactInfo.email || "info@sdtechpros.com";
  
  // Format address with line breaks
  const formattedAddress = contactAddress.split('\n').map((line, i) => (
    <span key={i} className="block">{line}</span>
  ));

  return (
    <footer className="bg-secondary-800 text-white py-10 border-t border-secondary-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              {logoUrl ? (
                <img src={logoUrl} className="h-10 w-10 rounded bg-white p-1" alt={companyName} />
              ) : (
                <div className="h-10 w-10 rounded bg-white p-1 text-primary flex items-center justify-center font-bold">
                  {companyName.substring(0, 1)}
                </div>
              )}
              <span className="text-white font-bold text-lg">{companyName}</span>
            </div>
            <p className="text-secondary-300 text-sm">
              Empowering businesses through innovative technology solutions since 2012.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-secondary-300 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              {services ? (
                services.map(service => (
                  <li key={service.id}>
                    <Link href="/#services">
                      <a className="text-secondary-300 hover:text-white">{service.title}</a>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/#services"><a className="text-secondary-300 hover:text-white">Custom Software Development</a></Link></li>
                  <li><Link href="/#services"><a className="text-secondary-300 hover:text-white">Cloud Solutions</a></Link></li>
                  <li><Link href="/#services"><a className="text-secondary-300 hover:text-white">Cybersecurity Services</a></Link></li>
                  <li><Link href="/#services"><a className="text-secondary-300 hover:text-white">IT Consulting</a></Link></li>
                  <li><Link href="/#services"><a className="text-secondary-300 hover:text-white">Managed Services</a></Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/#about"><a className="text-secondary-300 hover:text-white">About Us</a></Link></li>
              <li><Link href="/#about"><a className="text-secondary-300 hover:text-white">Our Team</a></Link></li>
              <li><a href="#" className="text-secondary-300 hover:text-white">Careers</a></li>
              <li><Link href="/#testimonials"><a className="text-secondary-300 hover:text-white">Testimonials</a></Link></li>
              <li><a href="#" className="text-secondary-300 hover:text-white">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-2 text-secondary-300 flex-shrink-0" />
                <span className="text-secondary-300">{formattedAddress}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-secondary-300 flex-shrink-0" />
                <span className="text-secondary-300">{contactPhone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-secondary-300 flex-shrink-0" />
                <span className="text-secondary-300">{contactEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-400 text-sm">&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-secondary-400 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-secondary-400 hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-secondary-400 hover:text-white text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
