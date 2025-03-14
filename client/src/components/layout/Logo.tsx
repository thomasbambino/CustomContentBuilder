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
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Log the entire settings object for debugging
    console.log("📊 Logo component - settings:", settings);
    
    if (settings?.logoPath) {
      // First use our debug API to check if the file actually exists
      const debugUrl = `/api/debug/file-check?path=${encodeURIComponent(settings.logoPath)}`;
      console.log("🔍 Logo component - checking file with debug API:", debugUrl);
      
      fetch(debugUrl)
        .then(response => response.json())
        .then(data => {
          console.log("🔍 File check results:", data);
          setDebugInfo(data);
          
          if (data.clientFileExists || data.serverFileExists) {
            // File exists somewhere, try to load it with cache busting
            const timestamp = Date.now();
            const logoUrl = `${settings.logoPath}?t=${timestamp}`;
            console.log("✅ File exists, attempting to load with URL:", logoUrl);
            
            // After confirming file exists, try to load the image
            const img = new Image();
            img.onload = () => {
              console.log("✅ Logo component - image loaded successfully");
              setLogoSrc(logoUrl);
              setIsLoading(false);
              setError(false);
            };
            img.onerror = (e) => {
              console.error("❌ Logo component - image load error after file confirmed to exist:", e);
              // Try a different URL pattern
              const altLogoUrl = `/uploads/${data.cleanPath.split('/').pop()}?t=${timestamp}`;
              console.log("🔄 Trying alternative URL pattern:", altLogoUrl);
              
              const altImg = new Image();
              altImg.onload = () => {
                console.log("✅ Logo component - alternative URL loaded successfully");
                setLogoSrc(altLogoUrl);
                setIsLoading(false);
                setError(false);
              };
              altImg.onerror = () => {
                console.error("❌ Logo component - alternative URL also failed");
                setError(true);
                setIsLoading(false);
                setLogoSrc(null);
              };
              altImg.src = altLogoUrl;
            };
            img.src = logoUrl;
          } else {
            console.error("❌ Logo file not found in either location");
            setError(true);
            setIsLoading(false);
            setLogoSrc(null);
          }
        })
        .catch(error => {
          console.error("❌ Logo component - debug API error:", error);
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
    // Only show debug info in development environment
    if (process.env.NODE_ENV === 'development' && debugInfo) {
      console.log('Logo Debug Info:', debugInfo);
    }
    return <span className="font-bold text-xl text-primary">{fallbackText}</span>;
  }

  return (
    <img
      src={logoSrc}
      alt="Company Logo"
      className={className}
      onError={(e) => {
        console.error("❌ Logo component - render error:", e);
        console.log("Failed image URL:", logoSrc);
        setError(true);
        setLogoSrc(null);
      }}
    />
  );
}