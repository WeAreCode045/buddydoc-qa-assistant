import axios from 'axios';

// Replace with your WordPress site URL
const WP_API_URL = 'https://your-wordpress-site.com/wp-json/wp/v2';
const CUSTOM_API_URL = 'https://your-wordpress-site.com/wp-json/pdf-manager/v1';

export interface WPDocument {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  pdf_url: string;
  acf: {
    pdf_file: string;
  };
}

export const wordpressApi = {
  async getDocuments(): Promise<WPDocument[]> {
    try {
      const response = await axios.get(`${WP_API_URL}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  async getDocumentById(id: number): Promise<WPDocument | null> {
    try {
      const response = await axios.get(`${WP_API_URL}/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }
};