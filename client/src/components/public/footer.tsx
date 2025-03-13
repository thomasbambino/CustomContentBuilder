import { useSettings } from "@/hooks/use-settings";
import { 
  Linkedin, 
  Twitter, 
  Facebook, 
  Github, 
  MapPin, 
  Phone, 
  Mail 
} from "lucide-react";
import { useContent } from "@/hooks/use-content";

export default function Footer() {
  const { settings } = useSettings();
  const { content } = useContent();
  
  // Extract content values with fallbacks
  const companyName = settings?.["company.name"] || "SD Tech Pros";
  const companyLogo = settings?.["company.logo"] || "";
  const address = content?.contact?.address || "123 Tech Boulevard, Suite 456\nSan Diego, CA 92101";
  const phone = content?.contact?.phone || "(619) 555-1234";
  const email = content?.contact?.email || "info@sdtechpros.com";

  return (
    <footer className="bg-secondary-800 text-white py-10 border-t border-secondary-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              {companyLogo ? (
                <img src={companyLogo} className="h-10 w-10 rounded bg-white p-1" alt="Company Logo" />
              ) : (
                <div className="h-10 w-10 rounded bg-white p-1 flex items-center justify-center text-primary-700 font-bold">
                  {companyName.charAt(0)}
                </div>
              )}
              <span className="text-white font-bold text-lg">{companyName}</span>
            </div>
            <p className="text-secondary-300 text-sm">Empowering businesses through innovative technology solutions since 2012.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-secondary-300 hover:text-white">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white">
                <Github size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#services" className="text-secondary-300 hover:text-white">Custom Software Development</a></li>
              <li><a href="#services" className="text-secondary-300 hover:text-white">Cloud Solutions</a></li>
              <li><a href="#services" className="text-secondary-300 hover:text-white">Cybersecurity Services</a></li>
              <li><a href="#services" className="text-secondary-300 hover:text-white">IT Consulting</a></li>
              <li><a href="#services" className="text-secondary-300 hover:text-white">Managed Services</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-secondary-300 hover:text-white">About Us</a></li>
              <li><a href="#about" className="text-secondary-300 hover:text-white">Our Team</a></li>
              <li><a href="#" className="text-secondary-300 hover:text-white">Careers</a></li>
              <li><a href="#testimonials" className="text-secondary-300 hover:text-white">Testimonials</a></li>
              <li><a href="#" className="text-secondary-300 hover:text-white">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-2 text-secondary-300" />
                <span className="text-secondary-300 whitespace-pre-line">{address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-secondary-300" />
                <span className="text-secondary-300">{phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-secondary-300" />
                <span className="text-secondary-300">{email}</span>
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
