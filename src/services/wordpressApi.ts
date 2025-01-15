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
      
      const endpoint = '/documents';
      const targetUrl = `${config.baseURL}${endpoint}`;
      
      // Create Base64 encoded credentials
      const username = localStorage.getItem('wp_username') || '';
      const password = localStorage.getItem('wp_password') || '';
      const credentials = btoa(`${username}:${password}`);
      
      console.log('Fetching documents with config:', {
        url: targetUrl,
        headers: {
          ...config.headers,
          'Authorization': `Basic ${credentials}`,
        }
      });

      const response = await axios.get(targetUrl, {
        headers: {
          ...config.headers,
          'Authorization': `Basic ${credentials}`,
        },
        withCredentials: false,
      });

      console.log('WordPress API Response:', response.data);
      
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