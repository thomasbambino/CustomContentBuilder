import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Content } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type ContentContextType = {
  content: Record<string, Record<string, any>>;
  isLoading: boolean;
  error: Error | null;
  updateContent: (section: string, identifier: string, content: any) => Promise<void>;
};

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { 
    data: contentItems, 
    error, 
    isLoading 
  } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ section, identifier, content }: { section: string, identifier: string, content: any }) => {
      await apiRequest('PUT', '/api/content', { section, identifier, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      toast({
        title: 'Content updated',
        description: 'The content has been successfully updated.',
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

  // Transform content items into a nested structure for easier access
  const organizedContent: Record<string, Record<string, any>> = {};
  
  if (contentItems) {
    contentItems.forEach(item => {
      if (!organizedContent[item.section]) {
        organizedContent[item.section] = {};
      }
      organizedContent[item.section][item.identifier] = item.content;
    });
  }

  const updateContent = async (section: string, identifier: string, content: any) => {
    await updateMutation.mutateAsync({ section, identifier, content });
  };

  return (
    <ContentContext.Provider
      value={{
        content: organizedContent,
        isLoading,
        error,
        updateContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
