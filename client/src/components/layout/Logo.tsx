import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';

interface LogoProps {
  className?: string;
  fallbackText?: string;
  height?: string;
}

export function Logo({ className = "h-10 w-auto", fallbackText = "SD Tech Pros", height = "40px" }: LogoProps) {
  const { settings } = useSettings();
  const [hasError, setHasError] = useState(false);
  
  // Detailed logging to debug the logo settings
  useEffect(() => {
    console.log("Logo component - settings:", settings);
    console.log("Logo component - logoPath:", settings?.logoPath);
    
    // Check if file exists with a simple fetch
    if (settings?.logoPath) {
      fetch(settings.logoPath)
        .then(response => {
          console.log(`Logo file fetch status: ${response.status} ${response.ok ? 'OK' : 'Failed'}`);
        })
        .catch(error => {
          console.error("Logo file fetch error:", error);
        });
    }
  }, [settings]);

  // Super simple approach - just like our test page that works
  if (!settings?.logoPath || hasError) {
    console.log("Using fallback text for logo");
    return <span className="font-bold text-xl text-primary">{fallbackText}</span>;
  }

  // Let's try a direct approach with the most explicit path possible
  const logoUrl = settings.logoPath.startsWith('/') 
    ? settings.logoPath 
    : `/${settings.logoPath}`;
    
  console.log("Rendering logo with path:", logoUrl);
  
  return (
    <img
      src={logoUrl}
      alt="Company Logo"
      className={className}
      style={{ height }}
      onError={(e) => {
        console.error("Logo image failed to load:", e.target);
        setHasError(true);
      }}
    />
  );
}