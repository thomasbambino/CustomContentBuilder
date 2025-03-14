import { useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';

interface DynamicFaviconProps {
  defaultFavicon?: string;
}

export default function DynamicFavicon({ defaultFavicon = '/favicon.ico' }: DynamicFaviconProps) {
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    // Update the favicon when settings are loaded
    if (!isLoading && settings) {
      const faviconPath = settings.faviconPath || defaultFavicon;
      
      // Get existing links
      const existingLink = document.querySelector('link[rel="icon"]');
      const existingAppleLink = document.querySelector('link[rel="apple-touch-icon"]');
      
      // If favicon path is available, update it
      if (faviconPath) {
        console.log('Setting favicon to:', faviconPath);
        
        // Update or create favicon link
        if (existingLink) {
          existingLink.setAttribute('href', faviconPath);
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = faviconPath;
          document.head.appendChild(link);
        }
        
        // Update or create apple-touch-icon link
        if (existingAppleLink) {
          existingAppleLink.setAttribute('href', faviconPath);
        } else {
          const appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          appleLink.href = faviconPath;
          document.head.appendChild(appleLink);
        }
      }
    }
  }, [settings, isLoading, defaultFavicon]);

  // This component doesn't render anything visible
  return null;
}