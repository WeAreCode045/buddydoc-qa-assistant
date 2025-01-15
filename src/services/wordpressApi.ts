import axios from 'axios';
import { WPDocument } from './types/wordpress';
import { getApiConfig } from './utils/apiConfig';
import { getWordPressData } from './wordpressIntegration';

export type { WPDocument };

export const wordpressApi = {
  async getDocuments(groupId?: number): Promise<WPDocument[]> {
    try {
      const { config } = getApiConfig();
      const wpData = getWordPressData();
      
      const endpoint = groupId 
        ? `/pdf-chat-buddy/v1/documents/${groupId}`
        : '/wp/v2/documents';
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
          rendered: doc.title
        }
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  async uploadDocument(groupId: number, file: File, title: string, description?: string): Promise<any> {
    try {
      const { config } = getApiConfig();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(
        `${config.baseURL}/pdf-chat-buddy/v1/documents/${groupId}`,
        formData,
        {
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async deleteDocument(groupId: number, documentId: number): Promise<any> {
    try {
      const { config } = getApiConfig();
      
      const response = await axios.delete(
        `${config.baseURL}/pdf-chat-buddy/v1/documents/${groupId}/${documentId}`,
        {
          headers: config.headers,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};