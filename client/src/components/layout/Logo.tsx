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
    // Log the entire settings object for debugging
    console.log("📊 Logo component - settings:", settings);
    
    if (settings?.logoPath) {
      // Create a fully qualified URL including the protocol and host
      const baseUrl = window.location.origin;
      // Add cache-busting timestamp
      const timestamp = Date.now();
      const fullLogoUrl = `${baseUrl}${settings.logoPath}?t=${timestamp}`;
      console.log("🔄 Logo component - setting logo URL:", fullLogoUrl);
      
      // Try to fetch the image directly first
      fetch(fullLogoUrl)
        .then(response => {
          console.log(`🔍 Logo fetch response: ${response.status} ${response.statusText}`, 
            { contentType: response.headers.get('content-type') });
          
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          
          // After successful fetch, try to load the image
          const img = new Image();
          img.onload = () => {
            console.log("✅ Logo component - image preloaded successfully");
            setLogoSrc(fullLogoUrl);
            setIsLoading(false);
            setError(false);
          };
          img.onerror = (e) => {
            console.error("❌ Logo component - preload error after successful fetch:", e);
            setError(true);
            setIsLoading(false);
            setLogoSrc(null);
          };
          img.src = fullLogoUrl;
        })
        .catch(error => {
          console.error("❌ Logo component - fetch error:", error);
          setError(true);
          setIsLoading(false);
          setLogoSrc(null);
        });
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