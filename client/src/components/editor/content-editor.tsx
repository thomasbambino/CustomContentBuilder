import { useState, useEffect } from "react";
import { useContent } from "@/hooks/use-content";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RefreshCw } from "lucide-react";

interface ContentEditorProps {
  section: string;
  title: string;
  description?: string;
}

export default function ContentEditor({ section, title, description }: ContentEditorProps) {
  const { content, isLoading, updateContent } = useContent();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text");
  const [localContent, setLocalContent] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local content when the content data is loaded
  useEffect(() => {
    if (!isLoading && content[section]) {
      setLocalContent(content[section]);
    }
  }, [isLoading, content, section]);

  const handleInputChange = (identifier: string, value: any) => {
    setLocalContent((prev) => ({
      ...prev,
      [identifier]: value,
    }));
    setHasChanges(true);
  };

  const handleArrayItemChange = (identifier: string, index: number, field: string, value: any) => {
    const items = [...(localContent[identifier] || [])];
    items[index] = {
      ...items[index],
      [field]: value,
    };
    
    setLocalContent((prev) => ({
      ...prev,
      [identifier]: items,
    }));
    setHasChanges(true);
  };

  const handleSave = async (identifier: string) => {
    if (!localContent[identifier]) return;
    
    setIsSaving(true);
    try {
      await updateContent(section, identifier, localContent[identifier]);
      toast({
        title: "Content updated",
        description: `The ${identifier} content has been successfully updated.`,
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error updating content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalContent(content[section] || {});
    setHasChanges(false);
    toast({
      title: "Changes discarded",
      description: "Your changes have been reset to the last saved version.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Render different editor components based on content type
  const renderEditor = (identifier: string, contentValue: any) => {
    if (typeof contentValue === "string") {
      // Single line text input for short content
      if (contentValue.length < 100) {
        return (
          <div className="space-y-2">
            <Label htmlFor={identifier}>{identifier.charAt(0).toUpperCase() + identifier.slice(1)}</Label>
            <Input
              id={identifier}
              value={localContent[identifier] || ""}
              onChange={(e) => handleInputChange(identifier, e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => handleSave(identifier)}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        );
      }
      
      // Multi-line textarea for longer content
      return (
        <div className="space-y-2">
          <Label htmlFor={identifier}>{identifier.charAt(0).toUpperCase() + identifier.slice(1)}</Label>
          <Textarea
            id={identifier}
            value={localContent[identifier] || ""}
            onChange={(e) => handleInputChange(identifier, e.target.value)}
            rows={5}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => handleSave(identifier)}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
      );
    }
    
    // Array of items (for services, testimonials, etc.)
    if (Array.isArray(contentValue)) {
      return (
        <div className="space-y-4">
          <Label>{identifier.charAt(0).toUpperCase() + identifier.slice(1)}</Label>
          
          {contentValue.map((item, index) => (
            <Card key={index}>
              <CardHeader className="py-4">
                <CardTitle className="text-md">Item {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-4">
                {Object.entries(item).map(([field, value]) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={`${identifier}-${index}-${field}`}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    {typeof value === "string" && value.length > 100 ? (
                      <Textarea
                        id={`${identifier}-${index}-${field}`}
                        value={localContent[identifier]?.[index]?.[field] || ""}
                        onChange={(e) => handleArrayItemChange(identifier, index, field, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={`${identifier}-${index}-${field}`}
                        value={localContent[identifier]?.[index]?.[field] || ""}
                        onChange={(e) => handleArrayItemChange(identifier, index, field, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => handleSave(identifier)}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save All Items
            </Button>
          </div>
        </div>
      );
    }
    
    // JSON object (for complex content)
    return (
      <div className="space-y-2">
        <Label htmlFor={identifier}>{identifier.charAt(0).toUpperCase() + identifier.slice(1)}</Label>
        <Textarea
          id={identifier}
          value={JSON.stringify(localContent[identifier] || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleInputChange(identifier, parsed);
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          rows={10}
          className="font-mono text-sm"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => handleSave(identifier)}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="text">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-6">
            {localContent && Object.entries(localContent).map(([identifier, value]) => (
              <div key={identifier} className="py-4 border-b last:border-0">
                {renderEditor(identifier, value)}
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="preview">
            <Card className="border-2 border-dashed p-4">
              <CardContent className="p-0">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-bold">{localContent?.title || "Title"}</h3>
                  {localContent?.subtitle && (
                    <p className="text-secondary-500">{localContent.subtitle}</p>
                  )}
                  {localContent?.description && (
                    <p className="whitespace-pre-line">{localContent.description}</p>
                  )}
                  {localContent?.items && Array.isArray(localContent.items) && (
                    <div className="mt-4 space-y-4">
                      {localContent.items.map((item: any, i: number) => (
                        <div key={i} className="p-4 border rounded">
                          {item.title && <h4 className="font-semibold">{item.title}</h4>}
                          {item.content && <p>{item.content}</p>}
                          {item.description && <p>{item.description}</p>}
                          {item.name && <p className="font-medium">{item.name}</p>}
                          {item.company && <p className="text-sm text-secondary-500">{item.company}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {hasChanges && (
        <CardFooter className="justify-between border-t px-6 py-4">
          <p className="text-sm text-secondary-500">You have unsaved changes</p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={() => {
                // Save all content sections
                Object.keys(localContent).forEach(identifier => {
                  handleSave(identifier);
                });
              }}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save All
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
