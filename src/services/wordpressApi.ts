import axios from 'axios';
import { WPDocument } from './types/wordpress';
import { getApiConfig } from './utils/apiConfig';
import { getWordPressData } from './wordpressIntegration';

export type { WPDocument };

export const wordpressApi = {
  async getDocuments(): Promise<WPDocument[]> {
    try {
      const { config } = getApiConfig();
      const wpData = getWordPressData();
      
      const headers = {
        ...config.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
      
      const endpoint = '/documents';
      
      console.log('Fetching documents with config:', {
        url: `${config.baseURL}${endpoint}`,
        headers
      });

      const response = await axios.get(endpoint, {
        baseURL: config.baseURL,
        headers,
        withCredentials: false,
      });

      console.log('WordPress API Response:', response.data);
      
      // Map the response to include only id and title
      return response.data.map((doc: any) => ({
        id: doc.id,
        title: {
          rendered: doc.title.rendered
        }
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
};