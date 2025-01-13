import axios from 'axios';

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

const getApiConfig = () => {
  const apiUrl = localStorage.getItem('wp_api_url') || 'https://your-wordpress-site.com/wp-json/wp/v2';
  const username = localStorage.getItem('wp_username');
  const password = localStorage.getItem('wp_password');

  const config = {
    baseURL: apiUrl,
    headers: {},
  };

  if (username && password) {
    config.headers = {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    };
  }

  return config;
};

export const wordpressApi = {
  async getDocuments(): Promise<WPDocument[]> {
    try {
      const config = getApiConfig();
      const response = await axios.get('/documents', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  async getDocumentById(id: number): Promise<WPDocument | null> {
    try {
      const config = getApiConfig();
      const response = await axios.get(`/documents/${id}`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }
};