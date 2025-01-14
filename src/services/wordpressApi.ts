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

const getApiConfig = () => {
  const apiUrl = localStorage.getItem('wp_api_url') || 'https://your-wordpress-site.com/wp-json/wp/v2';
  const username = localStorage.getItem('wp_username');
  const password = localStorage.getItem('wp_password');
  const wpData = getWordPressData();
  
  // Extract base domain from API URL - handle both http and https
  const baseDomain = apiUrl.match(/(https?:\/\/[^\/]+)/)?.[1] || '';

  const config = {
    baseURL: apiUrl,
    headers: {},
  };

  // If running in WordPress, use nonce authentication
  if (wpData.nonce) {
    config.headers = {
      'X-WP-Nonce': wpData.nonce,
    };
  } 
  // Otherwise, fall back to basic auth
  else if (username && password) {
    config.headers = {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    };
  }

  return { config, baseDomain };
};

async function getAttachmentUrl(attachmentId: number, config: any): Promise<string> {
  try {
    const response = await axios.get(`/media/${attachmentId}`, config);
    return response.data.source_url;
  } catch (error) {
    console.error(`Error fetching attachment ${attachmentId}:`, error);
    return '';
  }
}

export const wordpressApi = {
  async getDocuments(): Promise<WPDocument[]> {
    try {
      const { config, baseDomain } = getApiConfig();
      const wpData = getWordPressData();
      
      // If we have a post ID from WordPress, filter by it
      const endpoint = wpData.postId 
        ? `/documents?per_page=100&post=${wpData.postId}`
        : '/documents?per_page=100';
      
      const response = await axios.get(endpoint, config);
      
      console.log('WordPress API Response:', response.data);
      
      // Process each document
      const processedDocs = await Promise.all(response.data.map(async (doc: WPDocument) => {
        console.log('Processing document:', doc);
        
        if (!doc.acf?.pdf_file) {
          console.log('Document missing PDF file:', doc);
          return {
            ...doc,
            acf: {
              pdf_file: ''
            }
          };
        }

        // Handle pdf_file as array of attachment IDs
        if (Array.isArray(doc.acf.pdf_file) && doc.acf.pdf_file.length > 0) {
          const attachmentId = doc.acf.pdf_file[0];
          const pdfUrl = await getAttachmentUrl(attachmentId, config);
          
          // Ensure PDF URL uses the correct domain
          const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : `${baseDomain}${pdfUrl}`;
          
          return {
            ...doc,
            acf: {
              ...doc.acf,
              pdf_file: fullPdfUrl
            }
          };
        }
        
        // If pdf_file is already a string URL
        if (typeof doc.acf.pdf_file === 'string') {
          // Ensure PDF URL uses the correct domain
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
          acf: {
            pdf_file: ''
          }
        };
      }));

      return processedDocs;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  async getDocumentById(id: number): Promise<WPDocument | null> {
    try {
      const { config, baseDomain } = getApiConfig();
      const response = await axios.get(`/documents/${id}`, config);
      const doc = response.data;
      
      if (!doc.acf?.pdf_file) {
        console.log('Document missing PDF file:', doc);
        return {
          ...doc,
          acf: {
            pdf_file: ''
          }
        };
      }

      // Handle pdf_file as array of attachment IDs
      if (Array.isArray(doc.acf.pdf_file) && doc.acf.pdf_file.length > 0) {
        const attachmentId = doc.acf.pdf_file[0];
        const pdfUrl = await getAttachmentUrl(attachmentId, config);
        
        // Ensure PDF URL uses the correct domain
        const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : `${baseDomain}${pdfUrl}`;
        
        return {
          ...doc,
          acf: {
            ...doc.acf,
            pdf_file: fullPdfUrl
          }
        };
      }
      
      // If pdf_file is already a string URL
      if (typeof doc.acf.pdf_file === 'string') {
        // Ensure PDF URL uses the correct domain
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
        acf: {
          pdf_file: ''
        }
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }
};