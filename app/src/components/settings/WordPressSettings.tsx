import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

const formSchema = z.object({
  apiUrl: z.string().url({ message: "Please enter a valid URL" }),
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function WordPressSettings() {
  const { toast } = useToast();
  const isWP = false; // Placeholder for WordPress integration check
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiUrl: localStorage.getItem('wp_api_url') || '',
      username: localStorage.getItem('wp_username') || '',
      password: localStorage.getItem('wp_password') || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    localStorage.setItem('wp_api_url', values.apiUrl);
    localStorage.setItem('wp_username', values.username);
    localStorage.setItem('wp_password', values.password);
    
    toast({
      title: "Settings saved",
      description: "Your WordPress API settings have been saved successfully.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>WordPress API Settings</CardTitle>
        <CardDescription>
          Configure your WordPress API connection settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant={isWP ? "default" : "destructive"}>
          <div className="flex items-center gap-2">
            {isWP ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>
              {isWP ? "WordPress Integration Active" : "Standalone Mode"}
            </AlertTitle>
          </div>
          <AlertDescription>
            {isWP 
              ? "WordPress integration is active and working correctly."
              : "The app is running in standalone mode. Install it as a WordPress plugin to access WordPress data."}
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-wordpress-site.com/wp-json/wp/v2" {...field} />
                  </FormControl>
                  <FormDescription>
                    The base URL of your WordPress REST API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="WordPress username" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your WordPress administrator username
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="WordPress password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your WordPress administrator password
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}