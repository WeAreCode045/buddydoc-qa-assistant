import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import DocumentUploader from "../components/DocumentUploader";
import QuestionPanel from "../components/QuestionPanel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WPDocument } from "../services/wordpressApi";
import { getAttachmentUrlByParent } from "../services/utils/mediaUtils";
import { getApiConfig } from "../services/utils/apiConfig";
import { useToast } from "@/hooks/use-toast";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
const timestamp = new Date().getTime();
const pdfjsWorker = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js?v=${timestamp}`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDocuments, setSelectedDocuments] = useState<WPDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<WPDocument | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [showUploader, setShowUploader] = useState(true);
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);

  const storePdf = async (url: string) => {
    try {
      const apiConfig = getApiConfig();
      console.log('API Config:', apiConfig); // Debug log
      
      // Use baseDomain instead of baseURL to avoid duplicate wp-json path
      const response = await fetch(`${apiConfig.baseDomain}/wp-json/pdf-proxy/v1/store-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...apiConfig.config.headers
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Failed to store PDF');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error storing PDF:', error);
      throw error;
    }
  };

  const fetchPdf = async (url: string) => {
    try {
      const storedPdfUrl = await storePdf(url);
      const response = await fetch(storedPdfUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlob(blobUrl);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load the PDF. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Cleanup blob URL when component unmounts or when a new PDF is loaded
  useEffect(() => {
    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
      }
    };
  }, [pdfBlob]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setShowUploader(false);
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
              {selectedDocument && pdfBlob && (
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
                  
                  <div className="pdf-container overflow-auto max-h-[calc(100vh-300px)] flex justify-center items-start">
                    <Document
                      file={pdfBlob}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="pdf-document"
                    >
                      <Page 
                        pageNumber={pageNumber}
                        className="shadow-lg"
                        width={Math.min(window.innerWidth * 0.6, 800)}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </Document>
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