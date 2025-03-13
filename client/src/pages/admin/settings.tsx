import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/dashboard/admin-sidebar";
import AdminHeader from "@/components/dashboard/admin-header";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  RefreshCw,
  Image,
  Check,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface FreshbooksStatus {
  connected: boolean;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const { settings, updateSetting, uploadLogo, refreshSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set document title
  useEffect(() => {
    document.title = "Settings | Admin Dashboard";
  }, []);

  // Load settings when available
  useEffect(() => {
    if (settings) {
      setCompanyName(settings["company.name"] || "SD Tech Pros");
      setContactEmail(settings["company.email"] || "info@sdtechpros.com");
      setContactPhone(settings["company.phone"] || "(619) 555-1234");
    }
  }, [settings]);

  // Check Freshbooks connection status
  const { data: freshbooksStatus, isLoading: isLoadingFreshbooks } = useQuery<FreshbooksStatus>({
    queryKey: ['/api/freshbooks/status'],
  });

  // Get Freshbooks auth URL
  const { data: freshbooksAuthData } = useQuery<{ authUrl: string }>({
    queryKey: ['/api/freshbooks/auth-url'],
    enabled: !freshbooksStatus?.connected,
  });

  // Sync with Freshbooks mutation
  const syncFreshbooksMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/freshbooks/sync', {});
    },
    onSuccess: () => {
      toast({
        title: "Sync completed",
        description: "Successfully synchronized data with Freshbooks.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadLogo(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
  };

  // Handle company name update
  const handleCompanyNameUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateSetting("company.name", companyName);
      toast({
        title: "Settings updated",
        description: "Company name has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update company name",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle contact info update
  const handleContactInfoUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateSetting("company.email", contactEmail);
      await updateSetting("company.phone", contactPhone);
      toast({
        title: "Settings updated",
        description: "Contact information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update contact information",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Settings" />
        
        <main className="flex-1 overflow-y-auto bg-secondary-50 p-6">
          <Tabs defaultValue="branding">
            <TabsList className="mb-6">
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            {/* Branding Settings */}
            <TabsContent value="branding">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Update your company name and details that will appear on the client portal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <Button 
                      onClick={handleCompanyNameUpdate}
                      disabled={isUpdating || !companyName || companyName === settings?.["company.name"]}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Company Name'
                      )}
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Logo</CardTitle>
                    <CardDescription>
                      Upload your company logo. Recommended size: 512x512px.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-md">
                      {previewUrl ? (
                        <div className="text-center">
                          <img
                            src={previewUrl}
                            alt="Logo Preview"
                            className="max-h-32 mx-auto mb-4 rounded"
                          />
                          <Button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      ) : settings?.["company.logo"] ? (
                        <div className="text-center">
                          <img
                            src={settings["company.logo"]}
                            alt="Current Logo"
                            className="max-h-32 mx-auto mb-4 rounded"
                          />
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Change Logo
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-24 h-24 bg-secondary-100 rounded-md flex items-center justify-center mx-auto mb-4">
                            <Image className="h-12 w-12 text-secondary-400" />
                          </div>
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    {selectedFile && (
                      <Button onClick={handleLogoUpload} className="w-full">
                        <Check className="mr-2 h-4 w-4" />
                        Save Logo
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Update contact details displayed on your website.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Contact Phone</Label>
                      <Input
                        id="contact-phone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <Button 
                      onClick={handleContactInfoUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Contact Info'
                      )}
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                    <CardDescription>
                      Add your social media profiles to improve your online presence.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 bg-secondary-100 border border-r-0 border-secondary-200 rounded-l-md">
                          <LinkIcon className="h-4 w-4 text-secondary-500" />
                        </div>
                        <Input
                          id="linkedin"
                          className="rounded-l-none"
                          placeholder="https://linkedin.com/company/sdtechpros"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 bg-secondary-100 border border-r-0 border-secondary-200 rounded-l-md">
                          <LinkIcon className="h-4 w-4 text-secondary-500" />
                        </div>
                        <Input
                          id="twitter"
                          className="rounded-l-none"
                          placeholder="https://twitter.com/sdtechpros"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 bg-secondary-100 border border-r-0 border-secondary-200 rounded-l-md">
                          <LinkIcon className="h-4 w-4 text-secondary-500" />
                        </div>
                        <Input
                          id="facebook"
                          className="rounded-l-none"
                          placeholder="https://facebook.com/sdtechpros"
                        />
                      </div>
                    </div>
                    <Button disabled>Save Social Links</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Integrations Settings */}
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 mr-2 text-blue-600" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.82353 19.4118C4.01176 19.4118 1.76471 17.0588 1.76471 14.3529C1.76471 12.4706 2.82353 10.8235 4.58824 9.88235C4.58824 5.76471 7.88235 2.47059 12 2.47059C16.1176 2.47059 19.4118 5.76471 19.4118 9.88235C21.1765 10.8235 22.2353 12.4706 22.2353 14.3529C22.2353 17.0588 19.9882 19.4118 17.1765 19.4118H12H6.82353Z" stroke="#1F75FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.7647 14.3529L16.1176 12L13.7647 9.64706" stroke="#1F75FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7.88235 9.64706L10.2353 12L7.88235 14.3529" stroke="#1F75FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Freshbooks Integration
                  </CardTitle>
                  <CardDescription>
                    Connect to Freshbooks to sync your clients, projects, and invoices.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFreshbooks ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : freshbooksStatus?.connected ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 bg-green-50 p-4 rounded-md">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800">Successfully Connected</h4>
                          <p className="text-sm text-green-600">Your Freshbooks account is connected and syncing data.</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Auto-Sync</h4>
                            <p className="text-sm text-secondary-500">Automatically sync data every 24 hours</p>
                          </div>
                          <Switch id="auto-sync" defaultChecked />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Manual Sync</h4>
                            <p className="text-sm text-secondary-500">Sync data from Freshbooks now</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => syncFreshbooksMutation.mutate()}
                            disabled={syncFreshbooksMutation.isPending}
                          >
                            {syncFreshbooksMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Sync Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full mt-4">Disconnect Freshbooks</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Disconnecting Freshbooks will stop all data synchronization. You will need to reconnect your account to resume syncing.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Disconnect
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 bg-yellow-50 p-4 rounded-md">
                        <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800">Not Connected</h4>
                          <p className="text-sm text-yellow-600">Your Freshbooks account is not connected. Click the button below to connect.</p>
                        </div>
                      </div>
                      
                      {freshbooksAuthData?.authUrl && (
                        <Button className="w-full" asChild>
                          <a href={freshbooksAuthData.authUrl} target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6.82353 19.4118C4.01176 19.4118 1.76471 17.0588 1.76471 14.3529C1.76471 12.4706 2.82353 10.8235 4.58824 9.88235C4.58824 5.76471 7.88235 2.47059 12 2.47059C16.1176 2.47059 19.4118 5.76471 19.4118 9.88235C21.1765 10.8235 22.2353 12.4706 22.2353 14.3529C22.2353 17.0588 19.9882 19.4118 17.1765 19.4118H12H6.82353Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M13.7647 14.3529L16.1176 12L13.7647 9.64706" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M7.88235 9.64706L10.2353 12L7.88235 14.3529" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Connect to Freshbooks
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Website Domain
                    </CardTitle>
                    <CardDescription>
                      Configure your custom domain for the client portal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Custom Domain</Label>
                      <Input
                        id="domain"
                        placeholder="portal.sdtechpros.com"
                      />
                      <p className="text-xs text-secondary-500">
                        Enter the domain you want to use for your client portal.
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Verify Domain
                    </Button>
                  </CardContent>
                  <CardFooter className="bg-secondary-50 border-t px-6 py-4">
                    <p className="text-xs text-secondary-500">
                      You'll need to update your DNS records to point to our servers. We'll provide instructions after verification.
                    </p>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Email Notifications
                    </CardTitle>
                    <CardDescription>
                      Configure email templates and notification settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">New Invoice Notifications</h4>
                          <p className="text-sm text-secondary-500">Send emails when new invoices are created</p>
                        </div>
                        <Switch id="invoice-notifications" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Project Updates</h4>
                          <p className="text-sm text-secondary-500">Send emails when projects are updated</p>
                        </div>
                        <Switch id="project-notifications" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">New Message Alerts</h4>
                          <p className="text-sm text-secondary-500">Send emails for new client messages</p>
                        </div>
                        <Switch id="message-notifications" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between border-t p-6">
                    <Button variant="outline">Preview Templates</Button>
                    <Button>Save Notification Settings</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>
                    Customize the appearance of your client portal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Color Mode</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${theme === 'light' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-secondary-200 hover:border-secondary-300'}`}
                          onClick={() => setTheme('light')}
                        >
                          <div className="h-24 bg-white border border-secondary-200 rounded-md mb-4 flex flex-col">
                            <div className="h-6 bg-secondary-100 border-b border-secondary-200 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-secondary-300 mr-1"></div>
                              <div className="w-2 h-2 rounded-full bg-secondary-300 mr-1"></div>
                              <div className="w-2 h-2 rounded-full bg-secondary-300"></div>
                            </div>
                            <div className="flex flex-1 p-2">
                              <div className="w-1/3 bg-secondary-100 rounded h-full mr-1"></div>
                              <div className="flex-1 flex flex-col">
                                <div className="h-2 bg-secondary-200 rounded mb-1 w-full"></div>
                                <div className="h-2 bg-secondary-200 rounded mb-1 w-3/4"></div>
                                <div className="h-2 bg-secondary-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Light Mode</span>
                            {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${theme === 'dark' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-secondary-200 hover:border-secondary-300'}`}
                          onClick={() => setTheme('dark')}
                        >
                          <div className="h-24 bg-secondary-900 border border-secondary-800 rounded-md mb-4 flex flex-col">
                            <div className="h-6 bg-secondary-800 border-b border-secondary-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-secondary-600 mr-1"></div>
                              <div className="w-2 h-2 rounded-full bg-secondary-600 mr-1"></div>
                              <div className="w-2 h-2 rounded-full bg-secondary-600"></div>
                            </div>
                            <div className="flex flex-1 p-2">
                              <div className="w-1/3 bg-secondary-800 rounded h-full mr-1"></div>
                              <div className="flex-1 flex flex-col">
                                <div className="h-2 bg-secondary-700 rounded mb-1 w-full"></div>
                                <div className="h-2 bg-secondary-700 rounded mb-1 w-3/4"></div>
                                <div className="h-2 bg-secondary-700 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Dark Mode</span>
                            {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Primary Color</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { name: 'Blue', color: '#3b82f6', value: 'blue' },
                          { name: 'Green', color: '#10b981', value: 'green' },
                          { name: 'Purple', color: '#8b5cf6', value: 'purple' },
                          { name: 'Red', color: '#ef4444', value: 'red' },
                          { name: 'Orange', color: '#f97316', value: 'orange' },
                          { name: 'Teal', color: '#14b8a6', value: 'teal' },
                        ].map(color => (
                          <div 
                            key={color.value}
                            className="border rounded-lg p-3 cursor-pointer hover:border-secondary-300 transition-all"
                          >
                            <div 
                              className="h-12 rounded-md mb-2" 
                              style={{ backgroundColor: color.color }}
                            ></div>
                            <span className="text-sm font-medium">{color.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="custom-color">Custom Color</Label>
                        <div className="flex mt-1 space-x-2">
                          <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden border border-secondary-200">
                            <input
                              type="color"
                              className="w-12 h-12 transform -translate-y-1 -translate-x-1 cursor-pointer"
                              defaultValue="#3b82f6"
                            />
                          </div>
                          <Input 
                            id="custom-color"
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-end">
                  <Button>Save Theme Settings</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Client Portal Layout</CardTitle>
                  <CardDescription>
                    Customize how the client portal appears to your clients.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Dashboard Widgets</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Project Status</h4>
                            <p className="text-sm text-secondary-500">Show project progress on dashboard</p>
                          </div>
                          <Switch id="widget-project-status" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Recent Invoices</h4>
                            <p className="text-sm text-secondary-500">Show recent invoices on dashboard</p>
                          </div>
                          <Switch id="widget-invoices" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Support Messages</h4>
                            <p className="text-sm text-secondary-500">Show recent support messages</p>
                          </div>
                          <Switch id="widget-messages" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Upcoming Deadlines</h4>
                            <p className="text-sm text-secondary-500">Show upcoming project deadlines</p>
                          </div>
                          <Switch id="widget-deadlines" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Navigation Options</h3>
                      <div className="space-y-4">
                        <fieldset className="space-y-3">
                          <legend className="text-sm font-medium sr-only">Navigation Style</legend>
                          <div className="flex items-center space-x-3">
                            <input type="radio" id="nav-sidebar" name="nav-style" className="h-4 w-4 text-primary" defaultChecked />
                            <Label htmlFor="nav-sidebar">Sidebar Navigation</Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="radio" id="nav-top" name="nav-style" className="h-4 w-4 text-primary" />
                            <Label htmlFor="nav-top">Top Navigation</Label>
                          </div>
                        </fieldset>
                        
                        <div>
                          <Label htmlFor="favicon">Favicon</Label>
                          <div className="flex items-center mt-1 space-x-3">
                            <div className="w-8 h-8 bg-secondary-100 rounded border border-secondary-200 flex items-center justify-center text-secondary-400">
                              <Image className="h-4 w-4" />
                            </div>
                            <Button variant="outline" size="sm">Change Favicon</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-end">
                  <Button>Save Layout Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Advanced Settings */}
            <TabsContent value="advanced">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom CSS</CardTitle>
                    <CardDescription>
                      Add custom CSS to personalize your client portal appearance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="font-mono text-xs p-4 bg-secondary-800 text-secondary-100 rounded-md h-48 overflow-y-auto">
                        <pre>{`/* Custom CSS */
.custom-header {
  background: linear-gradient(to right, var(--primary), #4f46e5);
}

.client-card {
  transition: transform 0.2s ease;
}

.client-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}`}</pre>
                      </div>
                      <p className="text-xs text-secondary-500">
                        Only use this if you're familiar with CSS. Improper code may break the layout.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between border-t px-6 py-4">
                    <Button variant="outline">Reset to Default</Button>
                    <Button disabled>Save CSS</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>
                      These actions can't be undone. Please proceed with caution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border border-red-200 rounded-md p-4 bg-red-50">
                      <h3 className="text-md font-medium text-red-800 mb-2">Reset All Settings</h3>
                      <p className="text-sm text-red-600 mb-3">
                        This will reset all settings to their default values. All customizations will be lost.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Reset Settings</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will reset all your settings to their default values and delete any customizations.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Reset Everything
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <div className="border border-red-200 rounded-md p-4 bg-red-50">
                      <h3 className="text-md font-medium text-red-800 mb-2">Clear All Data</h3>
                      <p className="text-sm text-red-600 mb-3">
                        This will delete all clients, projects, invoices, and user data from the system.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Clear All Data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete all clients, projects, invoices, and user data from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete All Data
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>
                      Information about your system for troubleshooting purposes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Application</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-secondary-500">Version:</span>
                            <span>1.0.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-500">Environment:</span>
                            <span>Production</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-500">Last Updated:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Server</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-secondary-500">Node.js:</span>
                            <span>v16.14.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-500">Database:</span>
                            <span>PostgreSQL 14.1</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-500">Storage:</span>
                            <span>Local</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
