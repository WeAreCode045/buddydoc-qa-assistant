import axios from 'axios';
import { getWordPressData } from './wordpressIntegration';

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
    pdf_file: number[] | string;
  };
}

interface ApiConfig {
  config: {
    baseURL: string;
    headers: Record<string, string>;
  };
  baseDomain: string;
}

// Configuration helpers
const getApiConfig = (): ApiConfig => {
  const apiUrl = localStorage.getItem('wp_api_url') || 'https://your-wordpress-site.com/wp-json/wp/v2';
  const username = localStorage.getItem('wp_username');
  const password = localStorage.getItem('wp_password');
  const wpData = getWordPressData();
  
  const baseDomain = apiUrl.match(/(https?:\/\/[^\/]+)/)?.[1] || '';

  const headers: Record<string, string> = {};
  
  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  } else if (username && password) {
    headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`;
  }

  return {
    config: {
      baseURL: apiUrl,
      headers,
    },
    baseDomain,
  };
};

// Media helpers
const getAttachmentUrlByParent = async (documentId: number, config: any): Promise<string> => {
  try {
    console.log('Fetching media for document ID:', documentId);
    const response = await axios.get(`/media?parent=${documentId}`, config);
    console.log('Media response:', response.data);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const pdfUrl = response.data[0].guid?.rendered || '';
      console.log('Extracted PDF URL:', pdfUrl);
      return pdfUrl;
    }
    
    return '';
  } catch (error) {
    console.error(`Error fetching media for document ${documentId}:`, error);
    return '';
  }
};

// Document processing helpers
const processPdfFile = async (
  doc: WPDocument,
  config: any,
  baseDomain: string
): Promise<WPDocument> => {
  console.log('Processing document:', doc);
  
  // Get PDF URL using the document ID
  const pdfUrl = await getAttachmentUrlByParent(doc.id, config);
  
  if (pdfUrl) {
    return {
      ...doc,
      acf: {
        ...doc.acf,
        pdf_file: pdfUrl
      }
    };
  }
  
  // Fallback to existing pdf_file if it's a string URL
  if (doc.acf?.pdf_file && typeof doc.acf.pdf_file === 'string') {
    const url = doc.acf.pdf_file.startsWith('http')
      ? doc.acf.pdf_file
      : `${baseDomain}${doc.acf.pdf_file}`;
      
    return {
      ...doc,
      acf: {
        ...doc.acf,
        pdf_file: url
      }
    };
  }

  console.log('Document missing PDF file:', doc);
  return {
    ...doc,
    acf: { pdf_file: '' }
  };
};

// Main API interface
export const wordpressApi = {
  async getDocuments(): Promise<WPDocument[]> {
    try {
      const { config, baseDomain } = getApiConfig();
      const wpData = getWordPressData();
      
      const endpoint = wpData.postId 
        ? `/documents?per_page=100&post=${wpData.postId}`
        : '/documents?per_page=100';
      
      const response = await axios.get(endpoint, config);
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
      const response = await axios.get(`/documents/${id}`, config);
      return processPdfFile(response.data, config, baseDomain);
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }
};