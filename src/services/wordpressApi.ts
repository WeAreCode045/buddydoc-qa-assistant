import axios from 'axios';
import { WPDocument } from './types/wordpress';
import { getApiConfig } from './utils/apiConfig';
import { processPdfFile } from './utils/documentUtils';
import { getWordPressData } from './wordpressIntegration';

export type { WPDocument };

export const wordpressApi = {
  async getDocuments(): Promise<WPDocument[]> {
    try {
      const { config } = getApiConfig();
      const wpData = getWordPressData();
      
      // Add specific headers for CORS
      const headers = {
        ...config.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
      
      const endpoint = '/documents?per_page=100';
      
      console.log('Fetching documents with config:', {
        url: `${config.baseURL}${endpoint}`,
        headers
      });

      const response = await axios.get(endpoint, {
        baseURL: 'https://insightvve.nl/wp-json/wp/v2',
        headers,
        withCredentials: false,
      });

      console.log('WordPress API Response:', response.data);
      
      // Map the response to include only id and title
      return response.data.map((doc: any) => ({
        id: doc.id,
        title: {
          rendered: doc.title.rendered
        },
        content: {
          rendered: doc.content.rendered
        },
        acf: doc.acf || {},
        pdf_url: doc.pdf_url || ''
      }));
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
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        withCredentials: false,
      });
      return processPdfFile(response.data, config, baseDomain);
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }
};