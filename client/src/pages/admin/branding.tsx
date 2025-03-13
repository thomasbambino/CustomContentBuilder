import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Save,
  Upload,
  EyeIcon,
  Palette,
  Type,
  Globe,
  Image
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Setting } from "@shared/schema";

export default function BrandingPage() {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  
  // Fetch settings
  const { data: settings, isLoading } = useQuery<Setting>({
    queryKey: ['/api/settings'],
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<Setting>) => {
      const res = await apiRequest('PUT', '/api/settings', updatedSettings);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Branding settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    primaryColor: '',
    theme: 'light',
    radius: 0.5,
    siteTitle: '',
    siteDescription: '',
    logoPath: '',
    favicon: ''
  });
  
  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || 'SD Tech Pros',
        primaryColor: settings.primaryColor || 'hsl(222.2 47.4% 11.2%)',
        theme: settings.theme || 'light',
        radius: settings.radius || 0.5,
        siteTitle: settings.siteTitle || 'SD Tech Pros Client Portal',
        siteDescription: settings.siteDescription || '',
        logoPath: settings.logoPath || '',
        favicon: settings.favicon || ''
      });
      
      if (settings.logoPath) {
        setLogoPreview(settings.logoPath);
      }
      
      if (settings.favicon) {
        setFaviconPreview(settings.favicon);
      }
    }
  }, [settings]);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      theme: checked ? 'dark' : 'light'
    }));
  };
  
  // Handle radius change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      radius: parseFloat(e.target.value)
    }));
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload the file to a server
      // Here we're creating a local object URL as a preview
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      
      // In a real application, this would be the path returned from the server
      // For this demo, we're just updating the form data with a placeholder
      setFormData(prev => ({
        ...prev,
        logoPath: `/uploads/logo_${Date.now()}`
      }));
    }
  };
  
  // Handle favicon upload
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload the file to a server
      const preview = URL.createObjectURL(file);
      setFaviconPreview(preview);
      
      // In a real application, this would be the path returned from the server
      setFormData(prev => ({
        ...prev,
        favicon: `/uploads/favicon_${Date.now()}`
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };
  
  return (
    <AppLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Branding Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Customize your client portal's appearance and branding
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button 
              type="submit"
              form="branding-form"
              disabled={updateSettingsMutation.isPending}
              className="flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Loading branding settings...</p>
          </div>
        ) : (
          <form id="branding-form" onSubmit={handleSubmit}>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="colors">Colors & Theme</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="media">Logo & Media</TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5" />
                      General Information
                    </CardTitle>
                    <CardDescription>
                      Basic information about your company and website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input 
                        id="companyName" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your company name"
                      />
                      <p className="text-xs text-gray-500">
                        This name will appear throughout the client portal
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteTitle">Site Title</Label>
                      <Input 
                        id="siteTitle" 
                        name="siteTitle"
                        value={formData.siteTitle}
                        onChange={handleChange}
                        placeholder="Client Portal Title"
                      />
                      <p className="text-xs text-gray-500">
                        The title that appears in the browser tab
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea 
                        id="siteDescription" 
                        name="siteDescription"
                        value={formData.siteDescription}
                        onChange={handleChange}
                        placeholder="A brief description of your client portal"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500">
                        Used for SEO and meta descriptions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Colors & Theme */}
              <TabsContent value="colors">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="mr-2 h-5 w-5" />
                      Colors & Theme
                    </CardTitle>
                    <CardDescription>
                      Customize the color scheme and appearance of your portal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          id="primaryColor" 
                          name="primaryColor"
                          value={formData.primaryColor}
                          onChange={handleChange}
                          placeholder="hsl(222.2 47.4% 11.2%)"
                        />
                        <div 
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: formData.primaryColor }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        The main brand color used for buttons, links, and accents
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="theme">Dark Mode</Label>
                        <Switch 
                          id="theme"
                          checked={formData.theme === 'dark'}
                          onCheckedChange={handleThemeToggle}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Enable dark mode as the default theme
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="radius">Border Radius: {formData.radius}rem</Label>
                      <Input 
                        id="radius" 
                        name="radius"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formData.radius}
                        onChange={handleRadiusChange}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Square</span>
                        <span>Rounded</span>
                        <span>Circular</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button">
                      Reset to Defaults
                    </Button>
                    <Button type="button" onClick={() => toast({ title: "Preview not available", description: "This feature would show a live preview of your theme" })}>
                      <EyeIcon className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Typography */}
              <TabsContent value="typography">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Type className="mr-2 h-5 w-5" />
                      Typography
                    </CardTitle>
                    <CardDescription>
                      Customize the fonts and text styling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">
                        Typography settings are coming soon. The system currently uses Inter from Google Fonts.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Logo & Media */}
              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Image className="mr-2 h-5 w-5" />
                      Logo & Media
                    </CardTitle>
                    <CardDescription>
                      Upload your company logo, favicon and other brand assets
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>Company Logo</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-gray-400">No logo</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <Label 
                            htmlFor="logo-upload" 
                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </Label>
                          <Input 
                            id="logo-upload" 
                            type="file" 
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Recommended size: 200x50px. PNG, SVG or JPG.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Favicon</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                          {faviconPreview ? (
                            <img src={faviconPreview} alt="Favicon preview" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-gray-400">No icon</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <Label 
                            htmlFor="favicon-upload" 
                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Favicon
                          </Label>
                          <Input 
                            id="favicon-upload" 
                            type="file" 
                            accept="image/png,image/x-icon,image/svg+xml"
                            onChange={handleFaviconUpload}
                            className="hidden"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Recommended size: 32x32px. ICO, PNG or SVG.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
