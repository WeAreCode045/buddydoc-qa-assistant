import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { wordpressApi, WPDocument } from "../services/wordpressApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { getWordPressData } from "../services/wordpressIntegration";

interface DocumentUploaderProps {
  onFileSelect: (document: WPDocument) => void;
}

const DocumentUploader = ({ onFileSelect }: DocumentUploaderProps) => {
  const [documents, setDocuments] = useState<WPDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const wpData = getWordPressData();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const groupId = wpData.groupId ? parseInt(wpData.groupId) : undefined;
        const docs = await wordpressApi.getDocuments(groupId);
        console.log('Fetched documents:', docs);
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to fetch documents. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [toast, wpData.groupId]);

  const handleDocumentSelect = (document: WPDocument) => {
    setSelectedDocuments(prev => {
      if (prev.includes(document.id)) {
        return prev.filter(id => id !== document.id);
      }
      return [...prev, document.id];
    });
    onFileSelect(document);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Available Documents</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center space-x-4 py-2">
              <Checkbox
                id={`doc-${doc.id}`}
                checked={selectedDocuments.includes(doc.id)}
                onCheckedChange={() => handleDocumentSelect(doc)}
              />
              <label
                htmlFor={`doc-${doc.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {doc.title.rendered}
              </label>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-center text-gray-500">
              No documents available. Please contact the group administrator.
            </p>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default DocumentUploader;