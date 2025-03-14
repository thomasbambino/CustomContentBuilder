import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';

interface LogoProps {
  className?: string;
  fallbackText?: string;
  height?: string;
}

export function Logo({ className = "h-10 w-auto", fallbackText = "SD Tech Pros", height = "40px" }: LogoProps) {
  const { settings } = useSettings();
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (settings?.logoPath) {
      // Create a fully qualified URL including the protocol and host
      const baseUrl = window.location.origin;
      const fullLogoUrl = `${baseUrl}${settings.logoPath}`;
      console.log("🔄 Logo component - setting logo URL:", fullLogoUrl);
      
      // Test image loading before setting
      const img = new Image();
      img.onload = () => {
        console.log("✅ Logo component - image preloaded successfully");
        setLogoSrc(fullLogoUrl);
        setIsLoading(false);
        setError(false);
      };
      img.onerror = (e) => {
        console.error("❌ Logo component - preload error:", e);
        setError(true);
        setIsLoading(false);
        setLogoSrc(null);
      };
      img.src = fullLogoUrl;
    } else {
      console.log("🚫 Logo component - no logo path in settings");
      setIsLoading(false);
      setError(true);
    }
  }, [settings?.logoPath]);

  if (isLoading) {
    return <div className={`skeleton ${className}`} style={{ height }}></div>;
  }

  if (error || !logoSrc) {
    return <span className="font-bold text-xl text-primary">{fallbackText}</span>;
  }

  return (
    <img
      src={logoSrc}
      alt="Company Logo"
      className={className}
      onError={(e) => {
        console.error("❌ Logo component - render error:", e);
        setError(true);
        setLogoSrc(null);
      }}
    />
  );
}