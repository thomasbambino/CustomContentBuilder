// NEW SIMPLIFIED LOGO COMPONENT
import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface LogoProps {
  className?: string;
  fallbackText?: string;
  height?: string;
}

interface PublicSettings {
  companyName?: string;
  logoPath?: string;
  primaryColor?: string;
  theme?: string;
  radius?: number;
  siteTitle?: string;
  siteDescription?: string;
  favicon?: string;
}

// This implementation is completely rewritten from scratch to be as simple as possible
export function Logo({ className = "h-10 w-auto", fallbackText = "SD Tech Pros", height = "40px" }: LogoProps) {
  // Directly query the public settings API to avoid any potential context issues
  const { data: settings, isLoading } = useQuery<PublicSettings>({
    queryKey: ['/api/settings/public'],
  });

  // Show loading state while fetching 
  if (isLoading) {
    console.log("Logo: Loading settings...");
    return <span className="font-bold text-xl text-primary">...</span>;
  }

  // Hard-coded fallback if no settings
  if (!settings) {
    console.log("Logo: No settings data");
    return <span className="font-bold text-xl text-primary">{fallbackText}</span>;
  }

  // Log what we have
  console.log("Logo: Received settings", settings);
  console.log("Logo: Logo path is", settings.logoPath);

  // Display text if no logo path
  if (!settings.logoPath) {
    console.log("Logo: No logo path in settings");
    return <span className="font-bold text-xl text-primary">{fallbackText}</span>;
  }

  // HARD-CODED PATH TEST - this is identical to what worked in our test page
  // This is just for testing - we'll replace this with the actual path from settings once it works
  const hardCodedPath = "/uploads/logo-1741979910954.png";
  
  console.log("Logo: Using hardcoded test path:", hardCodedPath);
  
  return (
    <img 
      src={hardCodedPath}
      alt={fallbackText}
      className={className}
      style={{ height }}
      onError={(e) => {
        console.error("Logo load error with hardcoded path", e);
      }}
    />
  );
}