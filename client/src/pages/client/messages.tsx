import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Send,
  MessageSquare,
  Plus,
  Search,
  RefreshCw,
  User,
  Clock,
  ChevronRight,
  Paperclip,
  PlusCircle
} from "lucide-react";

interface Message {
  id: number;
  subject: string;
  content: string;
  isFromClient: boolean;
  isRead: boolean;
  createdAt: string;
  project?: {
    id: number;
    name: string;
  } | null;
}

interface Thread {
  id: number;
  subject: string;
  lastMessage: string;
  lastMessageDate: string;
  isUnread: boolean;
  messages: Message[];
}

// New message form schema
const newMessageSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Message content is required"),
  projectId: z.string().optional()
});

type NewMessageFormValues = z.infer<typeof newMessageSchema>;

export default function ClientMessagesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  
  // Mock threads/messages data for UI display
  // In a real implementation, this would be fetched from the API
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: 1,
      subject: "Website Redesign Project Updates",
      lastMessage: "Thank you for the update. I've reviewed the mockups and they look great!",
      lastMessageDate: new Date(Date.now() - 3600000).toISOString(),
      isUnread: true,
      messages: [
        {
          id: 1,
          subject: "Website Redesign Project Updates",
          content: "Hello! I wanted to provide you with an update on the website redesign project. We've completed the initial mockups and would love your feedback.",
          isFromClient: false,
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          project: { id: 1, name: "Website Redesign" }
        },
        {
          id: 2,
          subject: "Website Redesign Project Updates",
          content: "Thank you for the update. I've reviewed the mockups and they look great! I have a few minor suggestions for the homepage layout.",
          isFromClient: true,
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          project: { id: 1, name: "Website Redesign" }
        }
      ]
    },
    {
      id: 2,
      subject: "Invoice #INV-2023-002 Payment Confirmation",
      lastMessage: "We've received your payment for invoice #INV-2023-002. Thank you!",
      lastMessageDate: new Date(Date.now() - 172800000).toISOString(),
      isUnread: false,
      messages: [
        {
          id: 3,
          subject: "Invoice #INV-2023-002 Payment Confirmation",
          content: "We've received your payment for invoice #INV-2023-002. Thank you!",
          isFromClient: false,
          isRead: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          project: null
        }
      ]
    },
    {
      id: 3,
      subject: "SEO Optimization Project Kickoff",
      lastMessage: "We're excited to start working on your SEO optimization project!",
      lastMessageDate: new Date(Date.now() - 345600000).toISOString(),
      isUnread: false,
      messages: [
        {
          id: 4,
          subject: "SEO Optimization Project Kickoff",
          content: "We're excited to start working on your SEO optimization project! We've scheduled a kickoff meeting for next week.",
          isFromClient: false,
          isRead: true,
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          project: { id: 2, name: "SEO Optimization" }
        }
      ]
    }
  ]);

  // Get projects for the new message form
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  // New message form
  const newMessageForm = useForm<NewMessageFormValues>({
    resolver: zodResolver(newMessageSchema),
    defaultValues: {
      subject: "",
      content: "",
      projectId: ""
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: NewMessageFormValues) => {
      // In a real implementation, you would send this to your API
      // const res = await apiRequest('POST', '/api/messages', message);
      // return res.json();
      
      // Simulating API response
      return new Promise<Message>((resolve) => {
        setTimeout(() => {
          const newMessage: Message = {
            id: Math.floor(Math.random() * 1000),
            subject: message.subject,
            content: message.content,
            isFromClient: true,
            isRead: true,
            createdAt: new Date().toISOString(),
            project: message.projectId ? {
              id: parseInt(message.projectId),
              name: (projects && Array.isArray(projects)) 
                ? projects.find((p: any) => p.id.toString() === message.projectId)?.name || "Unknown Project"
                : "Unknown Project"
            } : null
          };
          resolve(newMessage);
        }, 500);
      });
    },
    onSuccess: (newMessage) => {
      // Update threads with the new message
      const existingThreadIndex = threads.findIndex(t => t.subject === newMessage.subject);
      
      if (existingThreadIndex >= 0) {
        // Add to existing thread
        const updatedThreads = [...threads];
        const thread = { ...updatedThreads[existingThreadIndex] };
        thread.messages = [...thread.messages, newMessage];
        thread.lastMessage = newMessage.content;
        thread.lastMessageDate = newMessage.createdAt;
        updatedThreads[existingThreadIndex] = thread;
        setThreads(updatedThreads);
        setSelectedThread(thread);
      } else {
        // Create new thread
        const newThread: Thread = {
          id: Math.floor(Math.random() * 1000),
          subject: newMessage.subject,
          lastMessage: newMessage.content,
          lastMessageDate: newMessage.createdAt,
          isUnread: false,
          messages: [newMessage]
        };
        setThreads(prev => [newThread, ...prev]);
        setSelectedThread(newThread);
      }
      
      // Reset form and close dialog
      newMessageForm.reset();
      setIsNewMessageDialogOpen(false);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  // Reply message mutation
  const replyMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedThread) throw new Error("No thread selected");
      
      // In a real implementation, you would send this to your API
      // const res = await apiRequest('POST', `/api/messages/threads/${selectedThread.id}/reply`, { content });
      // return res.json();
      
      // Simulating API response
      return new Promise<Message>((resolve) => {
        setTimeout(() => {
          const newMessage: Message = {
            id: Math.floor(Math.random() * 1000),
            subject: selectedThread.subject,
            content: content,
            isFromClient: true,
            isRead: true,
            createdAt: new Date().toISOString(),
            project: selectedThread.messages[0].project
          };
          resolve(newMessage);
        }, 500);
      });
    },
    onSuccess: (newMessage) => {
      if (!selectedThread) return;
      
      // Update the thread with the new message
      const updatedThreads = threads.map(thread => {
        if (thread.id === selectedThread.id) {
          const updatedThread = { 
            ...thread, 
            messages: [...thread.messages, newMessage],
            lastMessage: newMessage.content,
            lastMessageDate: newMessage.createdAt
          };
          setSelectedThread(updatedThread);
          return updatedThread;
        }
        return thread;
      });
      
      setThreads(updatedThreads);
      setReplyContent("");
      
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send reply",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Reply text state
  const [replyContent, setReplyContent] = useState("");
  
  // Handle new message submit
  const onNewMessageSubmit = (data: NewMessageFormValues) => {
    sendMessageMutation.mutate(data);
  };
  
  // Handle reply submit
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      replyMessageMutation.mutate(replyContent);
    }
  };
  
  // Filter threads based on search
  const filteredThreads = threads.filter(thread => 
    thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  // Handle thread selection
  const handleSelectThread = (thread: Thread) => {
    // Mark thread as read
    if (thread.isUnread) {
      const updatedThreads = threads.map(t => {
        if (t.id === thread.id) {
          return { ...t, isUnread: false };
        }
        return t;
      });
      setThreads(updatedThreads);
    }
    
    setSelectedThread(thread);
  };

  return (
    <AppLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Messages
            </h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsNewMessageDialogOpen(true)}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader className="pb-2">
                <CardTitle>Conversations</CardTitle>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="search"
                    placeholder="Search messages..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  {filteredThreads.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchQuery ? "No messages match your search" : "Start a new conversation"}
                      </p>
                      <Button 
                        onClick={() => setIsNewMessageDialogOpen(true)}
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        New Message
                      </Button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {filteredThreads.map((thread) => (
                        <li 
                          key={thread.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${selectedThread?.id === thread.id ? 'bg-gray-50' : ''}`}
                          onClick={() => handleSelectThread(thread)}
                        >
                          <div className="flex justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${thread.isUnread ? 'text-gray-900' : 'text-gray-700'} truncate`}>
                                {thread.subject}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {thread.lastMessage}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              <p className="text-xs text-gray-500">
                                {formatRelativeTime(thread.lastMessageDate)}
                              </p>
                              {thread.isUnread && (
                                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Message Content */}
          <div className="md:col-span-2">
            {selectedThread ? (
              <Card className="h-[calc(100vh-12rem)] flex flex-col">
                <CardHeader className="pb-2 border-b">
                  <CardTitle>{selectedThread.subject}</CardTitle>
                  <CardDescription>
                    {selectedThread.messages[0].project ? (
                      <span className="flex items-center">
                        Project: <span className="font-medium ml-1">{selectedThread.messages[0].project.name}</span>
                      </span>
                    ) : (
                      <span className="text-gray-500">General inquiry</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {selectedThread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromClient ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`rounded-lg p-4 max-w-[80%] ${
                            message.isFromClient 
                              ? 'bg-primary-100 text-primary-900' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <div 
                              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                                message.isFromClient 
                                  ? 'bg-primary-200 text-primary-700' 
                                  : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {message.isFromClient ? user?.name?.[0].toUpperCase() || 'Y' : 'S'}
                            </div>
                            <p className="text-xs ml-2">
                              {message.isFromClient ? 'You' : 'Support Team'}
                            </p>
                            <span className="mx-1 text-xs">•</span>
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(message.createdAt)}
                            </p>
                          </div>
                          <p className="whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <form onSubmit={handleReplySubmit}>
                    <div className="flex flex-col space-y-2">
                      <div className="relative">
                        <Textarea
                          placeholder="Type your reply..."
                          className="resize-none pr-10"
                          rows={3}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute bottom-2 right-2"
                          onClick={() => toast({
                            title: "Attachment feature",
                            description: "File attachment feature is coming soon.",
                          })}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={!replyContent.trim() || replyMessageMutation.isPending}
                          className="flex items-center"
                        >
                          {replyMessageMutation.isPending ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </Card>
            ) : (
              <Card className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="text-center px-6 py-8">
                  <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Select a conversation from the list or start a new one
                  </p>
                  <Button 
                    onClick={() => setIsNewMessageDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Message
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* New Message Dialog */}
        <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>
                Send a message to our support team
              </DialogDescription>
            </DialogHeader>
            <Form {...newMessageForm}>
              <form onSubmit={newMessageForm.handleSubmit(onNewMessageSubmit)} className="space-y-4">
                <FormField
                  control={newMessageForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter message subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newMessageForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Project (Optional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newMessageForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Type your message here" 
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewMessageDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sendMessageMutation.isPending}
                    className="flex items-center"
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
