import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { wordpressApi, WPDocument } from "../services/wordpressApi";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";

interface DocumentUploaderProps {
  onFileSelect: (document: WPDocument) => void;
}

const DocumentUploader = ({ onFileSelect }: DocumentUploaderProps) => {
  const [documents, setDocuments] = useState<WPDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await wordpressApi.getDocuments();
        setDocuments(docs);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch documents. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchDocuments();
  }, [toast]);

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
      </ScrollArea>
      
      {documents.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No documents available. Please contact the administrator.
        </p>
      )}
    </div>
  );
};

export default DocumentUploader;
