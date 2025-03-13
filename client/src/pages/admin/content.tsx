import { useState, useEffect } from "react";
import AdminSidebar from "@/components/dashboard/admin-sidebar";
import AdminHeader from "@/components/dashboard/admin-header";
import ContentEditor from "@/components/editor/content-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminContent() {
  const [activeSection, setActiveSection] = useState("hero");

  // Set document title
  useEffect(() => {
    document.title = "Content Management | Admin Dashboard";
  }, []);

  return (
    <div className="flex h-screen bg-secondary-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Content Management" />
        
        <main className="flex-1 overflow-y-auto bg-secondary-50 p-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Website Content Editor</CardTitle>
              <CardDescription>
                Edit the content of your public-facing website. All changes will be reflected immediately on the live site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hero" value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="mb-6">
                  <TabsTrigger value="hero">Hero Section</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
                
                <TabsContent value="hero">
                  <ContentEditor 
                    section="hero" 
                    title="Hero Section Content" 
                    description="Edit the main headline, subtitle, and call-to-action for your homepage hero section."
                  />
                </TabsContent>
                
                <TabsContent value="services">
                  <ContentEditor 
                    section="services" 
                    title="Services Section Content" 
                    description="Edit the services you offer including titles, descriptions, and icons."
                  />
                </TabsContent>
                
                <TabsContent value="about">
                  <ContentEditor 
                    section="about" 
                    title="About Section Content" 
                    description="Edit your company description, mission statement, and features."
                  />
                </TabsContent>
                
                <TabsContent value="testimonials">
                  <ContentEditor 
                    section="testimonials" 
                    title="Testimonials Section Content" 
                    description="Edit client testimonials and reviews displayed on your website."
                  />
                </TabsContent>
                
                <TabsContent value="contact">
                  <ContentEditor 
                    section="contact" 
                    title="Contact Section Content" 
                    description="Edit contact information including address, phone, and email."
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Best Practices</h3>
                    <ul className="list-disc list-inside text-secondary-600 space-y-2">
                      <li>Keep headlines concise (5-10 words) for maximum impact</li>
                      <li>Use action-oriented language in buttons and calls-to-action</li>
                      <li>Ensure content is free of spelling and grammatical errors</li>
                      <li>Maintain consistent brand voice across all sections</li>
                      <li>Highlight benefits rather than just features in service descriptions</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">SEO Tips</h3>
                    <ul className="list-disc list-inside text-secondary-600 space-y-2">
                      <li>Include relevant keywords naturally in headlines and descriptions</li>
                      <li>Keep paragraphs short and scannable</li>
                      <li>Use descriptive alt text for any images</li>
                      <li>Create unique and compelling meta descriptions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preview Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-secondary-600">
                    After making changes to your content, use these options to preview how your website will look.
                  </p>
                  
                  <div className="flex flex-col space-y-4">
                    <a 
                      href="/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Preview Live Site
                    </a>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-secondary-200 bg-white hover:bg-secondary-50 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                        Preview Light Mode
                      </button>
                      <button className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-secondary-200 bg-secondary-900 text-white hover:bg-secondary-800 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                        Preview Dark Mode
                      </button>
                    </div>
                    
                    <button className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-secondary-200 bg-white hover:bg-secondary-50 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                      Preview Mobile View
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
