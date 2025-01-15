export const getWorker = async () => {
  try {
    const workerUrl = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString();
    return workerUrl;
  } catch (error) {
    console.error('Error loading PDF worker:', error);
    return `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }
};