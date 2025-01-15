import { pdfjs } from 'react-pdf';

export const getWorker = async () => {
  try {
    return `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  } catch (error) {
    console.error('Error loading PDF worker:', error);
    throw new Error('Failed to load PDF worker');
  }
};