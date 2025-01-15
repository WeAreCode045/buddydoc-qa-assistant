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
      const pdfUrl = response.data[0].guid?.rendered || '';
      console.log('Extracted PDF URL:', pdfUrl);
      
      // Remove /wp-json/wp/v2 from the baseURL to get the WordPress root URL
      const wpRoot = config.baseURL.replace('/wp-json/wp/v2', '');
      // Get the uploads path from the PDF URL
      const uploadsPath = pdfUrl.split('/uploads/')[1];
      
      if (uploadsPath) {
        return `${wpRoot}/wp-content/uploads/${uploadsPath}`;
      }
    }
    
    return '';
  } catch (error) {
    console.error(`Error fetching media for document ${id}:`, error);
    return '';
  }
};

export const fetchPdfAsBlob = async (url: string, config: any): Promise<Blob> => {
  try {
    const response = await axios.get(url, {
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