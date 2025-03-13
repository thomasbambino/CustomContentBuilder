import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactSection() {
  const { content, isLoading } = useContent();
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      service: "",
      message: "",
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/inquiries", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry submitted",
        description: "We've received your message and will contact you soon.",
      });
      form.reset();
      setFormSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    inquiryMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <section id="contact" className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:gap-16">
            <div className="lg:w-1/2 mb-12 lg:mb-0 animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-6 w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-full"></div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mt-1"></div>
                    <div className="ml-4 w-full">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 bg-white p-8 rounded-lg shadow-md border border-secondary-100">
              <div className="h-8 bg-gray-200 rounded mb-6 w-2/3"></div>
              <div className="grid grid-cols-1 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded mb-1 w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Extract content values with fallbacks
  const title = content?.contact?.title || "Get in Touch";
  const description = content?.contact?.description || 
    "Ready to transform your business with innovative technology solutions? Contact us today to schedule a consultation with one of our experts.";
  const address = content?.contact?.address || "123 Tech Boulevard, Suite 456\nSan Diego, CA 92101";
  const phone = content?.contact?.phone || "(619) 555-1234";
  const email = content?.contact?.email || "info@sdtechpros.com";

  return (
    <section id="contact" className="py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-16">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-6">
              {title}
            </h2>
            <p className="text-lg text-secondary-600 mb-8">
              {description}
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <MapPin />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-secondary-800">Office Location</h3>
                  <p className="mt-1 text-secondary-600 whitespace-pre-line">{address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <Phone />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-secondary-800">Phone</h3>
                  <p className="mt-1 text-secondary-600">{phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <Mail />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-secondary-800">Email</h3>
                  <p className="mt-1 text-secondary-600">{email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 bg-white p-8 rounded-lg shadow-md border border-secondary-100">
            <h3 className="text-2xl font-bold mb-6 text-secondary-800">Send Us a Message</h3>
            
            {formSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Thank You!</h4>
                <p className="text-gray-600 mb-6">Your message has been sent successfully. We'll get back to you soon.</p>
                <Button onClick={() => setFormSubmitted(false)}>Send Another Message</Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service of Interest</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="software">Custom Software Development</SelectItem>
                            <SelectItem value="cloud">Cloud Solutions</SelectItem>
                            <SelectItem value="security">Cybersecurity Services</SelectItem>
                            <SelectItem value="consulting">IT Consulting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please tell us about your project or inquiry..." 
                            rows={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={inquiryMutation.isPending}
                  >
                    {inquiryMutation.isPending ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
