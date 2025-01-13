import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import DocumentUploader from "../components/DocumentUploader";
import QuestionPanel from "../components/QuestionPanel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFDocument {
  file: File;
  selected: boolean;
}

const Index = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [showUploader, setShowUploader] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setShowUploader(false);
  };

  const handleFileChange = (file: File) => {
    setDocuments(prev => [...prev, { file, selected: true }]);
    setSelectedDocument(file);
    setShowUploader(false);
  };

  const toggleDocumentSelection = (index: number) => {
    setDocuments(prev => prev.map((doc, i) => 
      i === index ? { ...doc, selected: !doc.selected } : doc
    ));
  };

  const handleDocumentPreview = (file: File) => {
    setSelectedDocument(file);
    setPageNumber(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Document Q&A Platform</h1>
          <p className="text-gray-600">Upload PDFs and ask questions about the content</p>
        </div>

        {showUploader ? (
          <DocumentUploader onFileSelect={handleFileChange} />
        ) : (
          <Button 
            variant="outline"
            onClick={() => setShowUploader(true)}
            className="mb-4"
          >
            Upload New Document
          </Button>
        )}

        {documents.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="text-lg font-semibold mb-4">Available Documents</h3>
                <ScrollArea className="h-[100px]">
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={doc.selected}
                          onChange={() => toggleDocumentSelection(index)}
                          className="rounded border-gray-300"
                        />
                        <button
                          onClick={() => handleDocumentPreview(doc.file)}
                          className={`text-left flex-1 p-2 rounded hover:bg-gray-100 ${
                            selectedDocument === doc.file ? 'bg-gray-100' : ''
                          }`}
                        >
                          {doc.file.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedDocument && (
                <div className="bg-white rounded-lg shadow-sm p-4">
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
                  
                  <div className="flex justify-center">
                    <Document
                      file={selectedDocument}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="max-w-full"
                    >
                      <Page 
                        pageNumber={pageNumber}
                        className="shadow-lg"
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
              <QuestionPanel 
                selectedDocuments={documents.filter(doc => doc.selected).map(doc => doc.file)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;