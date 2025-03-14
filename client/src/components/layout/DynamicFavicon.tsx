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
      // Get the favicon path from settings, using the correct property name
      // The server returns 'favicon' field, not 'faviconPath'
      let faviconPath = settings.favicon || defaultFavicon;
      
      // Ensure the favicon path is absolute
      if (faviconPath && !faviconPath.startsWith('http') && !faviconPath.startsWith('/')) {
        faviconPath = `/${faviconPath}`;
      }
      
      // Add timestamp to bust cache
      // This forces the browser to load the latest version of the favicon
      const timestamp = Date.now();
      const faviconWithTimestamp = faviconPath.includes('?') 
        ? `${faviconPath}&t=${timestamp}` 
        : `${faviconPath}?t=${timestamp}`;
      
      // Get existing links
      const existingLink = document.querySelector('link[rel="icon"]');
      const existingAppleLink = document.querySelector('link[rel="apple-touch-icon"]');
      
      // If favicon path is available, update it
      if (faviconPath) {
        console.log('Setting favicon to:', faviconWithTimestamp);
        
        // Update or create favicon link
        if (existingLink) {
          existingLink.setAttribute('href', faviconWithTimestamp);
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = faviconWithTimestamp;
          document.head.appendChild(link);
        }
        
        // Update or create apple-touch-icon link
        if (existingAppleLink) {
          existingAppleLink.setAttribute('href', faviconWithTimestamp);
        } else {
          const appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          appleLink.href = faviconWithTimestamp;
          document.head.appendChild(appleLink);
        }
      }
    }
  }, [settings, isLoading, defaultFavicon]);

  // This component doesn't render anything visible
  return null;
}