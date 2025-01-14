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
const getAttachmentUrl = async (attachmentId: number, config: any): Promise<string> => {
  try {
    console.log('Fetching attachment URL for ID:', attachmentId);
    const response = await axios.get(`/media/${attachmentId}`, config);
    console.log('Attachment response:', response.data);
    
    // Extract URL from guid.rendered
    const pdfUrl = response.data.guid?.rendered || '';
    console.log('Extracted PDF URL:', pdfUrl);
    
    return pdfUrl;
  } catch (error) {
    console.error(`Error fetching attachment ${attachmentId}:`, error);
    return '';
  }
};

// Document processing helpers
const processPdfFile = async (
  doc: WPDocument,
  config: any,
  baseDomain: string
): Promise<WPDocument> => {
  if (!doc.acf?.pdf_file) {
    console.log('Document missing PDF file:', doc);
    return {
      ...doc,
      acf: { pdf_file: '' }
    };
  }

  // Handle pdf_file as array of attachment IDs
  if (Array.isArray(doc.acf.pdf_file) && doc.acf.pdf_file.length > 0) {
    console.log('PDF file is an array:', doc.acf.pdf_file);
    const attachmentId = doc.acf.pdf_file[0];
    const pdfUrl = await getAttachmentUrl(attachmentId, config);
    console.log('Retrieved PDF URL:', pdfUrl);
    
    return {
      ...doc,
      acf: {
        ...doc.acf,
        pdf_file: pdfUrl
      }
    };
  }
  
  // Handle pdf_file as string URL
  if (typeof doc.acf.pdf_file === 'string') {
    const pdfUrl = doc.acf.pdf_file.startsWith('http')
      ? doc.acf.pdf_file
      : `${baseDomain}${doc.acf.pdf_file}`;
      
    return {
      ...doc,
      acf: {
        ...doc.acf,
        pdf_file: pdfUrl
      }
    };
  }

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