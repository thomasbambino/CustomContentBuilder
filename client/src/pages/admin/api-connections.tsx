import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { format, addSeconds } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ApiConnection } from "@shared/schema";
import {
  RefreshCw,
  Check,
  Key,
  Lock,
  AlertCircle,
  ExternalLink,
  Save,
  Clock,
  RotateCw,
  Database,
  BarChart
} from "lucide-react";

interface OAuthState {
  isConnecting: boolean;
  accessToken: string;
  refreshToken: string;
}

export default function ApiConnectionsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("freshbooks");
  
  // OAuth state (simulated for this demo)
  const [oauthState, setOauthState] = useState<OAuthState>({
    isConnecting: false,
    accessToken: "",
    refreshToken: "",
  });
  
  // Mock OAuth flow
  const initiateOAuth = () => {
    setOauthState({ ...oauthState, isConnecting: true });
    
    // In a real app, this would redirect to the OAuth provider
    toast({
      title: "Redirecting to Freshbooks",
      description: "You would be redirected to Freshbooks for authentication.",
    });
    
    // Simulate a successful OAuth flow after 2 seconds
    setTimeout(() => {
      setOauthState({
        isConnecting: false,
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
      });
      
      // Update the API connection in the database
      updateApiConnectionMutation.mutate({
        provider: "freshbooks",
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        isActive: true
      });
    }, 2000);
  };
  
  // Fetch API connections
  const { data: freshbooksConnection, isLoading } = useQuery<ApiConnection>({
    queryKey: ['/api/api-connections/freshbooks'],
  });
  
  // Update API connection mutation
  const updateApiConnectionMutation = useMutation({
    mutationFn: async (connection: Partial<ApiConnection>) => {
      const res = await apiRequest('PUT', `/api/api-connections/${connection.provider}`, connection);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-connections/freshbooks'] });
      toast({
        title: "Connection updated",
        description: "API connection has been updated successfully.",
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
  
  // Check if connection is expired
  const isConnectionExpired = (connection?: ApiConnection) => {
    if (!connection || !connection.expiresAt) return true;
    return new Date(connection.expiresAt) < new Date();
  };
  
  // Format expiration time
  const formatExpirationTime = (expiresAt?: string | null) => {
    if (!expiresAt) return "Unknown";
    return format(new Date(expiresAt), "MMM d, yyyy 'at' h:mm a");
  };
  
  // Calculate time remaining
  const getTimeRemaining = (expiresAt?: string | null) => {
    if (!expiresAt) return "Expired";
    const now = new Date();
    const expiration = new Date(expiresAt);
    
    if (expiration <= now) return "Expired";
    
    const diffInSeconds = Math.floor((expiration.getTime() - now.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`;
    return `${Math.floor(diffInSeconds / 3600)} hours`;
  };
  
  // Handle connection toggle
  const handleConnectionToggle = (checked: boolean) => {
    if (freshbooksConnection) {
      updateApiConnectionMutation.mutate({
        provider: "freshbooks",
        isActive: checked
      });
    }
  };
  
  // Handle token refresh
  const handleRefreshToken = () => {
    if (freshbooksConnection) {
      // In a real app, this would use the refresh token to get a new access token
      const newExpiresAt = addSeconds(new Date(), 3600).toISOString();
      
      updateApiConnectionMutation.mutate({
        provider: "freshbooks",
        accessToken: `refreshed_token_${Date.now()}`,
        expiresAt: newExpiresAt,
        isActive: true
      });
      
      toast({
        title: "Token refreshed",
        description: "API token has been refreshed successfully.",
      });
    }
  };
  
  // Test connection
  const testConnection = () => {
    toast({
      title: "Connection successful",
      description: "The connection to Freshbooks API was tested successfully.",
    });
  };
  
  // Sync data
  const syncData = () => {
    toast({
      title: "Sync started",
      description: "Data synchronization with Freshbooks has started.",
    });
  };
  
  return (
    <AppLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              API Connections
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your external API integrations and connections
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="freshbooks" className="flex items-center">
              <img 
                src="https://cdn.worldvectorlogo.com/logos/freshbooks.svg" 
                alt="Freshbooks" 
                className="h-5 w-5 mr-2" 
              />
              Freshbooks
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center" disabled>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
                alt="Google Analytics" 
                className="h-5 w-5 mr-2" 
              />
              Google Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="freshbooks" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Loading connection details...</p>
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center">
                          <img 
                            src="https://cdn.worldvectorlogo.com/logos/freshbooks.svg" 
                            alt="Freshbooks" 
                            className="h-6 w-6 mr-2" 
                          />
                          Freshbooks Integration
                        </CardTitle>
                        <CardDescription>
                          Connect to Freshbooks for client, project, and invoice synchronization
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="connection-status" className="text-sm">
                          {freshbooksConnection?.isActive ? "Active" : "Inactive"}
                        </Label>
                        <Switch 
                          id="connection-status" 
                          checked={freshbooksConnection?.isActive || false}
                          onCheckedChange={handleConnectionToggle}
                          disabled={!freshbooksConnection || !freshbooksConnection.accessToken}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!freshbooksConnection || !freshbooksConnection.accessToken ? (
                      <div className="text-center py-6">
                        <Key className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <h3 className="text-lg font-medium">Not Connected</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">
                          Connect your Freshbooks account to synchronize client and project data
                        </p>
                        <Button 
                          onClick={initiateOAuth}
                          disabled={oauthState.isConnecting}
                          className="flex items-center"
                        >
                          {oauthState.isConnecting ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Connect to Freshbooks
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <>
                        {isConnectionExpired(freshbooksConnection) && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Expired</AlertTitle>
                            <AlertDescription>
                              Your connection to Freshbooks has expired. Please refresh the token to continue synchronization.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-500">Connection Status</Label>
                            <div className="flex items-center">
                              {freshbooksConnection.isActive ? (
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                                  <span className="text-green-700 font-medium">Connected</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
                                  <span className="text-gray-700 font-medium">Disconnected</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-500">Token Expiration</Label>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{formatExpirationTime(freshbooksConnection.expiresAt)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {getTimeRemaining(freshbooksConnection.expiresAt)} remaining
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 pt-2">
                          <Label className="text-sm text-gray-500">Access Token</Label>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="password"
                              value={freshbooksConnection.accessToken}
                              readOnly
                              className="font-mono"
                            />
                            <Button 
                              variant="outline" 
                              onClick={() => toast({
                                title: "Token copied",
                                description: "The access token has been copied to clipboard.",
                              })}
                              className="shrink-0"
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                        
                        {freshbooksConnection.refreshToken && (
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-500">Refresh Token</Label>
                            <div className="flex items-center space-x-2">
                              <Input 
                                type="password"
                                value={freshbooksConnection.refreshToken}
                                readOnly
                                className="font-mono"
                              />
                              <Button 
                                variant="outline" 
                                onClick={() => toast({
                                  title: "Token copied",
                                  description: "The refresh token has been copied to clipboard.",
                                })}
                                className="shrink-0"
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open("https://www.freshbooks.com/api/authentication", "_blank")}
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Documentation
                    </Button>
                    
                    {freshbooksConnection && freshbooksConnection.accessToken && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={handleRefreshToken}
                          className="flex items-center"
                        >
                          <RotateCw className="mr-2 h-4 w-4" />
                          Refresh Token
                        </Button>
                        <Button 
                          onClick={initiateOAuth}
                          className="flex items-center"
                        >
                          <RotateCw className="mr-2 h-4 w-4" />
                          Reconnect
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
                
                {freshbooksConnection && freshbooksConnection.accessToken && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Database className="h-5 w-5 mr-2" />
                          Data Synchronization
                        </CardTitle>
                        <CardDescription>
                          Manage Freshbooks data synchronization
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="font-medium">Clients</p>
                              <p className="text-sm text-gray-500">Synchronize client data</p>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-5 w-5 text-green-500 mr-1" />
                              <span className="text-sm">Enabled</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="font-medium">Projects</p>
                              <p className="text-sm text-gray-500">Synchronize project data</p>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-5 w-5 text-green-500 mr-1" />
                              <span className="text-sm">Enabled</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="font-medium">Invoices</p>
                              <p className="text-sm text-gray-500">Synchronize invoice data</p>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-5 w-5 text-green-500 mr-1" />
                              <span className="text-sm">Enabled</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center py-2">
                            <div>
                              <p className="font-medium">Last Sync</p>
                              <p className="text-sm text-gray-500">
                                {freshbooksConnection.updatedAt 
                                  ? format(new Date(freshbooksConnection.updatedAt), "MMM d, yyyy 'at' h:mm a") 
                                  : "Never"
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={syncData}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Now
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart className="h-5 w-5 mr-2" />
                          Connection Statistics
                        </CardTitle>
                        <CardDescription>
                          API usage and connection metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b">
                            <p className="font-medium">API Calls Today</p>
                            <p className="font-medium">27</p>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b">
                            <p className="font-medium">API Limit</p>
                            <p className="font-medium">1,000 / day</p>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b">
                            <p className="font-medium">Last Success</p>
                            <p className="text-sm text-gray-600">30 minutes ago</p>
                          </div>
                          
                          <div className="flex justify-between items-center py-2">
                            <p className="font-medium">Error Rate</p>
                            <p className="font-medium text-green-600">0%</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={testConnection}
                        >
                          Test Connection
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="google">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics Integration</CardTitle>
                <CardDescription>
                  Coming soon - Track website usage and client portal analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">This integration will be available in a future update.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
