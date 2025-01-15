import { useState, useEffect } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import DocumentUploader from "../components/DocumentUploader";
import QuestionPanel from "../components/QuestionPanel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WPDocument } from "../services/wordpressApi";
import { getAttachmentUrlByParent } from "../services/utils/mediaUtils";
import { getApiConfig } from "../services/utils/apiConfig";
import { useToast } from "@/components/ui/use-toast";

// Import worker directly from node_modules
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDocuments, setSelectedDocuments] = useState<WPDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<WPDocument | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [showUploader, setShowUploader] = useState(true);
  const [pdfContent, setPdfContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPdf = async (url: string) => {
    try {
      setIsLoading(true);
      
      // Create a proxy URL to bypass CORS
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
      
      const loadingTask = pdfjsLib.getDocument({
        url: proxyUrl,
        withCredentials: false,
      });

      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);
      const pages: string[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        pages.push(pageText);
      }
      
      setPdfContent(pages);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load the PDF. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (document: WPDocument) => {
    setSelectedDocuments(prev => [...prev, document]);
    setSelectedDocument(document);
    
    const config = getApiConfig();
    
    try {
      const url = await getAttachmentUrlByParent(document.id, config.config);
      console.log('Retrieved PDF URL:', url);
      if (url) {
        await fetchPdf(url);
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load the document. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Document Q&A Platform</h1>
            <p className="text-gray-600">Select documents and ask questions about the content</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {showUploader ? (
          <DocumentUploader onFileSelect={handleFileSelect} />
        ) : (
          <Button 
            variant="outline"
            onClick={() => setShowUploader(true)}
            className="mb-4"
          >
            Select More Documents
          </Button>
        )}

        {selectedDocuments.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {selectedDocument && pdfContent.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                        disabled={pageNumber <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                        disabled={pageNumber >= numPages}
                      >
                        Next
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Page {pageNumber} of {numPages}
                    </p>
                  </div>
                  
                  <div className="pdf-container overflow-auto max-h-[calc(100vh-300px)] bg-white p-4 rounded-lg border">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <p>Loading PDF...</p>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-serif text-gray-800">
                        {pdfContent[pageNumber - 1]}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator orientation="vertical" className="hidden lg:block" />

            <div className="lg:w-1/3">
              <QuestionPanel selectedDocuments={selectedDocuments} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
