import { ReactNode } from "react";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import DynamicFavicon from "@/components/layout/DynamicFavicon";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Add DynamicFavicon to handle favicon in public pages */}
      <DynamicFavicon defaultFavicon="/favicon.ico" />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
