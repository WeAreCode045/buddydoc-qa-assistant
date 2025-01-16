import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { WPDocument } from "../services/wordpressApi";
import OpenAI from "openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuestionPanelProps {
  selectedDocuments: WPDocument[];
}

const QuestionPanel = ({ selectedDocuments }: QuestionPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || selectedDocuments.length === 0) return;

    const newMessage: Message = { role: "user", content: question };
    setMessages(prev => [...prev, newMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: localStorage.getItem('openai_api_key') || '',
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant analyzing PDF documents. Answer questions based on the content of the selected documents."
          },
          ...messages,
          newMessage
        ],
      });

      const aiResponse: Message = {
        role: "assistant",
        content: response.choices[0]?.message?.content || "Sorry, I couldn't generate a response."
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please check your API key in settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Questions about selected documents</h2>
        <p className="text-sm text-gray-600">
          {selectedDocuments.length === 0 
            ? "Please select at least one document to ask questions"
            : `${selectedDocuments.length} document(s) selected`}
        </p>
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary/10 ml-4"
                  : "bg-gray-100 mr-4"
              }`}
            >
              <p className="text-sm font-medium mb-1">
                {message.role === "user" ? "You" : "AI Assistant"}
              </p>
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="bg-gray-100 p-3 rounded-lg mr-4 animate-pulse">
              <p className="text-sm font-medium mb-1">AI Assistant</p>
              <p className="text-sm text-gray-700">Thinking...</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          disabled={isLoading || selectedDocuments.length === 0}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !question.trim() || selectedDocuments.length === 0}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default QuestionPanel;