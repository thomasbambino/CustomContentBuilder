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

  // Handle image load errors
  const handleImageError = () => {
    console.error("Logo image failed to load");
    setHasError(true);
  };

  // If there's no logo path in settings or there was an error loading the image, show fallback text
  if (!settings?.logoPath || hasError) {
    return <span className="font-bold text-xl text-primary">{fallbackText}</span>;
  }

  // Add cache busting parameter
  const timestamp = Date.now();
  const logoUrl = `${settings.logoPath}?t=${timestamp}`;

  // Show the image directly
  return (
    <img
      src={logoUrl}
      alt="Company Logo"
      className={className}
      style={{ height }}
      onError={handleImageError}
    />
  );
}