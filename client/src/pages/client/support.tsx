import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ClientSidebar from "@/components/dashboard/client-sidebar";
import ClientHeader from "@/components/dashboard/client-header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Loader2, 
  CheckCircle2,
  MailIcon,
  PhoneIcon,
  MessageSquare 
} from "lucide-react";

// Form schema
const supportRequestSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority level"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  projectReference: z.string().optional(),
});

type SupportRequestValues = z.infer<typeof supportRequestSchema>;

export default function ClientSupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "Support | Client Portal";
  }, []);

  // Support request form
  const form = useForm<SupportRequestValues>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      subject: "",
      category: "",
      priority: "",
      message: "",
      projectReference: "",
    },
  });

  // Submit support request mutation
  // Note: This would normally connect to an API, but for now we'll simulate success
  const submitRequestMutation = useMutation({
    mutationFn: async (data: SupportRequestValues) => {
      // In a real implementation, this would be a call to the API
      // return await apiRequest("POST", "/api/support", data);
      
      // Simulate API call with a delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, id: Math.floor(Math.random() * 10000) });
        }, 1500);
      });
    },
    onSuccess: () => {
      toast({
        title: "Support request submitted",
        description: "We've received your request and will get back to you shortly.",
      });
      setIsSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SupportRequestValues) => {
    submitRequestMutation.mutate(data);
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      <ClientSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClientHeader title="Support" />
        
        <main className="flex-1 overflow-y-auto bg-secondary-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Support Request Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Request</CardTitle>
                  <CardDescription>
                    Fill out the form below to get help from our team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-10">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-secondary-900">Support Request Submitted</h3>
                      <p className="mt-2 text-sm text-secondary-500">
                        Thank you for reaching out. Our team will respond to your request as soon as possible.
                      </p>
                      <Button 
                        onClick={() => {
                          setIsSubmitted(false);
                          form.reset();
                        }}
                        className="mt-6"
                      >
                        Submit Another Request
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Brief description of your issue" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="technical">Technical Issue</SelectItem>
                                    <SelectItem value="billing">Billing Question</SelectItem>
                                    <SelectItem value="project">Project Inquiry</SelectItem>
                                    <SelectItem value="feature">Feature Request</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="low">Low - General question</SelectItem>
                                    <SelectItem value="medium">Medium - Need assistance</SelectItem>
                                    <SelectItem value="high">High - Blocking issue</SelectItem>
                                    <SelectItem value="urgent">Urgent - Critical problem</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="projectReference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Reference (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Project name or ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                If your request is related to a specific project, please provide its name or ID
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please describe your issue in detail..." 
                                  rows={6}
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Include any relevant details, steps to reproduce, or error messages
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={submitRequestMutation.isPending}
                        >
                          {submitRequestMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Support Request'
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Contact & FAQ Column */}
            <div>
              {/* Contact Information */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>
                    Alternative ways to reach our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <MailIcon className="h-5 w-5 text-secondary-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium">Email Support</h3>
                      <p className="text-sm text-secondary-500">support@sdtechpros.com</p>
                      <p className="text-xs text-secondary-500 mt-1">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <PhoneIcon className="h-5 w-5 text-secondary-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium">Phone Support</h3>
                      <p className="text-sm text-secondary-500">(619) 555-4321</p>
                      <p className="text-xs text-secondary-500 mt-1">Mon-Fri, 9am-5pm PT</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 text-secondary-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium">Live Chat</h3>
                      <p className="text-sm text-secondary-500">Available for priority support</p>
                      <p className="text-xs text-secondary-500 mt-1">Business hours only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* FAQ Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        How quickly will I get a response?
                      </AccordionTrigger>
                      <AccordionContent>
                        Our typical response time is within 24 hours for standard requests. Urgent and high-priority issues are addressed more quickly, usually within 2-4 hours during business hours.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        Can I schedule a call with my project manager?
                      </AccordionTrigger>
                      <AccordionContent>
                        Yes, you can request a call with your project manager through the support form. Select "Project Inquiry" as the category and mention that you'd like to schedule a call in the message.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger>
                        How do I request a new feature?
                      </AccordionTrigger>
                      <AccordionContent>
                        To request a new feature, submit a support request with "Feature Request" as the category. Provide as much detail as possible about the feature and why it would be beneficial.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger>
                        What information should I provide for technical issues?
                      </AccordionTrigger>
                      <AccordionContent>
                        For technical issues, please include: the steps to reproduce the problem, any error messages you receive, screenshots if applicable, the device and browser you're using, and when the issue started occurring.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                  <a href="#" className="text-sm text-primary-600 hover:underline">
                    View Full Knowledge Base
                  </a>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
