import axios from 'axios';
import { getApiConfig } from './apiConfig';

export const getAttachmentUrlByParent = async (id: number, config: any): Promise<string> => {
  try {
    console.log('Fetching media for document ID:', id);
    const response = await axios.get(`/media?parent=${id}`, {
      ...config,
      withCredentials: false
    });
    console.log('Media response:', response.data);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const originalPdfUrl = response.data[0].guid?.rendered || '';
      console.log('Original PDF URL:', originalPdfUrl);
      
      // Convert the URL to use the proxy
      const proxyUrl = `${config.baseURL}/pdf-proxy/v1/proxy-pdf?url=${encodeURIComponent(originalPdfUrl)}`;
      console.log('Using proxied PDF URL:', proxyUrl);
      return proxyUrl;
    }
    
    return '';
  } catch (error) {
    console.error(`Error fetching media for document ${id}:`, error);
    return '';
  }
};