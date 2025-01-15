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
      
      // Instead of returning the direct URL, return a proxied URL through our API
      const apiBaseUrl = config.baseURL.replace('/wp/v2', '');
      return `${apiBaseUrl}/wp-content/uploads/${pdfUrl.split('/uploads/')[1]}`;
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