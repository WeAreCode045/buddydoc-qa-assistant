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

const formSchema = z.object({
  apiKey: z.string().min(1, { message: "API Key is required" }),
});

export default function OpenAISettings() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: localStorage.getItem('openai_api_key') || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    localStorage.setItem('openai_api_key', values.apiKey);
    
    toast({
      title: "Settings saved",
      description: "Your OpenAI API settings have been saved successfully.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenAI API Settings</CardTitle>
        <CardDescription>
          Configure your OpenAI API connection settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="sk-..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Your OpenAI API key
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