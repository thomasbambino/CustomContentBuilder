import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

type ThemeProviderProps = {
  children: ReactNode;
};

type ThemeProviderState = {
  primaryColor: string;
  companyName: string;
  theme: "light" | "dark";
  logoUrl: string | null;
  faviconUrl: string | null;
};

// Define the shape of the settings data returned from the API
interface SettingsData {
  companyName?: string;
  logoPath?: string;
  primaryColor?: string;
  theme?: string;
  radius?: number;
  siteTitle?: string;
  siteDescription?: string;
  favicon?: string;
}

const initialState: ThemeProviderState = {
  primaryColor: "#3b82f6", // Default blue
  companyName: "SD Tech Pros",
  theme: "light",
  logoUrl: null,
  faviconUrl: null
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [state, setState] = useState<ThemeProviderState>(initialState);

  // Fetch settings from the API with proper type
  const { data: settings } = useQuery<SettingsData>({
    queryKey: ["/api/settings/public"],
  });

  // Process settings data when it changes
  useEffect(() => {
    if (settings) {
      console.log("Theme provider received settings:", settings);
      console.log("Logo path from API:", settings.logoPath);
      console.log("Favicon path from API:", settings.favicon);
      
      // Apply cache busting for logo URL
      let processedLogoUrl = null;
      if (settings.logoPath) {
        const timestamp = Date.now();
        processedLogoUrl = settings.logoPath.includes('?') 
          ? `${settings.logoPath}&t=${timestamp}` 
          : `${settings.logoPath}?t=${timestamp}`;
        console.log("Processed logo URL with cache busting:", processedLogoUrl);
      }
      
      setState({
        primaryColor: settings.primaryColor || state.primaryColor,
        companyName: settings.companyName || state.companyName,
        theme: (settings.theme as "light" | "dark") || state.theme,
        logoUrl: processedLogoUrl,
        faviconUrl: settings.favicon || null
      });
      
      console.log("Updated state with logoUrl:", processedLogoUrl, "and faviconUrl:", settings.favicon);
    }
  }, [settings]);

  // Apply theme changes when state updates
  useEffect(() => {
    // Convert hex to HSL for the CSS variables
    const applyPrimaryColor = (hexColor: string) => {
      // Add inline style to get HSL values from hex
      const tempElement = document.createElement("div");
      tempElement.style.color = hexColor;
      document.body.appendChild(tempElement);
      
      const rgbColor = window.getComputedStyle(tempElement).color;
      document.body.removeChild(tempElement);
      
      // Extract RGB values
      const rgbMatch = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch.map(Number);
        
        // Convert RGB to HSL
        const r1 = r / 255;
        const g1 = g / 255;
        const b1 = b / 255;
        
        const max = Math.max(r1, g1, b1);
        const min = Math.min(r1, g1, b1);
        
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r1:
              h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
              break;
            case g1:
              h = (b1 - r1) / d + 2;
              break;
            case b1:
              h = (r1 - g1) / d + 4;
              break;
          }
          
          h = h * 60;
        }
        
        // Set the CSS variables
        document.documentElement.style.setProperty("--primary", `${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`);
        
        // Adjust foreground color based on luminance
        const foreground = l > 0.6 ? "0 0% 10%" : "0 0% 98%";
        document.documentElement.style.setProperty("--primary-foreground", foreground);
      }
    };
    
    // Apply the theme
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Apply the primary color
    applyPrimaryColor(state.primaryColor);
    
    // Update document title
    document.title = state.companyName;
    
  }, [state]);

  return (
    <ThemeProviderContext.Provider value={state}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  return useContext(ThemeProviderContext);
};
