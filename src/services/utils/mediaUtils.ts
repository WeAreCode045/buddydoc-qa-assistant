import axios from 'axios';

export const getAttachmentUrlByParent = async (id: number, config: any): Promise<string> => {
  try {
    console.log('Fetching media for document ID:', id);
    const response = await axios.get(`/media?parent=${id}`, {
      ...config,
      withCredentials: false
    });
    console.log('Media response:', response.data);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Use the source_url property which is already properly formatted by WordPress
      const pdfUrl = response.data[0].source_url || response.data[0].guid?.rendered || '';
      console.log('Extracted PDF URL:', pdfUrl);
      return pdfUrl;
    }
    
    return '';
  } catch (error) {
    console.error(`Error fetching media for document ${id}:`, error);
    return '';
  }
};

export const fetchPdfAsBlob = async (url: string, config: any): Promise<Blob> => {
  try {
    // Instead of fetching the PDF directly, fetch it through the WordPress REST API
    const mediaEndpoint = `/media/by-url?url=${encodeURIComponent(url)}`;
    const response = await axios.get(mediaEndpoint, {
      ...config,
      responseType: 'blob',
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching PDF:', error);
    throw error;
  }
};