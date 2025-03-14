import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Setting {
  id: number;
  key: string;
  value: any;
  updatedBy: number | null;
  updatedAt: string;
}

type SettingsContextType = {
  settings: Record<string, any>;
  isLoading: boolean;
  error: Error | null;
  updateSetting: (key: string, value: any) => Promise<void>;
  uploadLogo: (file: File) => Promise<{ url: string }>;
  uploadFavicon: (file: File) => Promise<{ url: string }>;
  refreshSettings: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const { 
    data: settingsData, 
    error, 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/settings'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      await apiRequest('PUT', '/api/settings', { key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Setting updated',
        description: 'The setting has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const logoUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      console.log("Uploading logo file:", file.name, "Type:", file.type);
      
      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Logo upload successful:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/public'] });
      toast({
        title: 'Logo uploaded',
        description: 'The company logo has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      console.error("Logo upload failed:", error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const faviconUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('favicon', file);
      
      console.log("Uploading favicon file:", file.name, "Type:", file.type);
      
      const response = await fetch('/api/settings/favicon', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Favicon upload successful:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/public'] });
      toast({
        title: 'Favicon uploaded',
        description: 'The site favicon has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      console.error("Favicon upload failed:", error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create an empty settings object
  const settingsObject: Record<string, any> = {};
  
  if (settingsData) {
    console.log("Settings data received:", JSON.stringify(settingsData, null, 2));
    
    // Safely extract properties from settingsData
    if (typeof settingsData === 'object' && settingsData !== null) {
      // Copy all properties from settingsData to settingsObject
      Object.entries(settingsData).forEach(([key, value]) => {
        settingsObject[key] = value;
      });
    }
  }

  const updateSetting = async (key: string, value: any) => {
    await updateMutation.mutateAsync({ key, value });
  };

  const uploadLogo = async (file: File) => {
    return await logoUploadMutation.mutateAsync(file);
  };
  
  const uploadFavicon = async (file: File) => {
    return await faviconUploadMutation.mutateAsync(file);
  };

  const refreshSettings = () => {
    refetch();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings: settingsObject,
        isLoading,
        error,
        updateSetting,
        uploadLogo,
        uploadFavicon,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
