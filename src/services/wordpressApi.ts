import axios from 'axios';
import { WPDocument } from './types/wordpress';
import { getApiConfig } from './utils/apiConfig';
import { processPdfFile } from './utils/documentUtils';
import { getWordPressData } from './wordpressIntegration';

export type { WPDocument };

export const wordpressApi = {
  async getDocuments(): Promise<WPDocument[]> {
    try {
      const { config, baseDomain } = getApiConfig();
      const wpData = getWordPressData();
      
      const endpoint = wpData.postId 
        ? `/documents?per_page=100&post=${wpData.postId}`
        : '/documents?per_page=100';
      
      const response = await axios.get(endpoint, {
        ...config,
        headers: {
          ...config.headers,
          'Access-Control-Allow-Origin': '*',
        }
      });
      console.log('WordPress API Response:', response.data);
      
      return Promise.all(
        response.data.map((doc: WPDocument) => processPdfFile(doc, config, baseDomain))
      );
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  async getDocumentById(id: number): Promise<WPDocument | null> {
    try {
      const { config, baseDomain } = getApiConfig();
      const response = await axios.get(`/documents/${id}`, {
        ...config,
        headers: {
          ...config.headers,
          'Access-Control-Allow-Origin': '*',
        }
      });
      return processPdfFile(response.data, config, baseDomain);
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }
};