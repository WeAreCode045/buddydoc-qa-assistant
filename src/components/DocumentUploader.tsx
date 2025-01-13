import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentUploaderProps {
  onFileSelect: (file: File) => void;
}

const DocumentUploader = ({ onFileSelect }: DocumentUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndProcessFile(files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndProcessFile(files[0]);
  };

  const validateAndProcessFile = (file: File) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto border-2 border-dashed rounded-lg p-12 text-center transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}
        hover:border-primary hover:bg-primary/5`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".pdf"
        onChange={handleFileInput}
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer"
      >
        <div className="text-gray-600">
          <p className="mb-2">Drag and drop your PDF here, or click to browse</p>
          <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
        </div>
      </label>
    </div>
  );
};

export default DocumentUploader;