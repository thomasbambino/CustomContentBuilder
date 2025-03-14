import React, { useState } from 'react';
import { useSettings } from '@/hooks/use-settings';

interface LogoProps {
  className?: string;
  fallbackText?: string;
  height?: string;
}

export function Logo({ className = "h-10 w-auto", fallbackText = "SD Tech Pros", height = "40px" }: LogoProps) {
  const { settings } = useSettings();
  const [hasError, setHasError] = useState(false);

  // Super simple approach - just like our test page that works
  if (!settings?.logoPath || hasError) {
    console.log("Using fallback text for logo");
    return <span className="font-bold text-xl text-primary">{fallbackText}</span>;
  }

  // Direct approach - use the full path exactly as set in settings without modification
  // This is the same approach that worked in our test page
  console.log("Using logo path:", settings.logoPath);
  return (
    <img
      src={settings.logoPath}
      alt="Company Logo"
      className={className}
      style={{ height }}
      onError={(e) => {
        console.error("Logo image failed to load:", e);
        setHasError(true);
      }}
    />
  );
}