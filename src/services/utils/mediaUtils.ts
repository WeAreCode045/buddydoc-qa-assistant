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
      // Get the base API URL from config and create proxy URL
      const apiBase = config.baseURL || '';
      const proxyUrl = `${apiBase}/proxy-pdf?url=${encodeURIComponent(originalPdfUrl)}`;
      console.log('Using proxied PDF URL:', proxyUrl);
      return proxyUrl;
    }
    
    return '';
  } catch (error) {
    console.error(`Error fetching media for document ${id}:`, error);
    return '';
  }
};