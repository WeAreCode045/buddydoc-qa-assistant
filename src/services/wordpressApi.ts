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
      
      console.log('Fetching documents with config:', {
        url: targetUrl,
        headers: config.headers,
      });

      const response = await axios.get(targetUrl, {
        headers: config.headers,
        withCredentials: true,
      });

      console.log('WordPress API Response:', response.data);
      
      return response.data.map((doc: any) => ({
        id: doc.id,
        title: {
          rendered: doc.title
        },
        group_id: doc.group_id
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  async uploadDocument(groupId: number, file: File, title: string): Promise<any> {
    try {
      const { config } = getApiConfig();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      const response = await axios.post(
        `${config.baseURL}/pdf-chat-buddy/v1/documents/${groupId}`,
        formData,
        {
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
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
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};