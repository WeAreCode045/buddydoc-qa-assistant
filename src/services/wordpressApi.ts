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
    pdf_file: number[] | string; // Can be array of IDs or string URL
  };
}

const getApiConfig = () => {
  const apiUrl = localStorage.getItem('wp_api_url') || 'https://your-wordpress-site.com/wp-json/wp/v2';
  const username = localStorage.getItem('wp_username');
  const password = localStorage.getItem('wp_password');
  
  // Extract base domain from API URL
  const baseDomain = apiUrl.split('/wp-json/wp/v2')[0];

  const config = {
    baseURL: apiUrl,
    headers: {},
  };

  if (username && password) {
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
      const response = await axios.get('/documents?per_page=100', config);
      
      console.log('WordPress API Response:', response.data);
      
      // Process each document
      const processedDocs = await Promise.all(response.data.map(async (doc: WPDocument) => {
        console.log('Processing document:', doc);
        
        // Check if doc.acf exists and pdf_file is an array
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
          const attachmentId = doc.acf.pdf_file[0]; // Get first attachment ID
          const pdfUrl = await getAttachmentUrl(attachmentId, config);
          
          return {
            ...doc,
            acf: {
              ...doc.acf,
              pdf_file: pdfUrl
            }
          };
        }
        
        // If pdf_file is already a string URL
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
        const attachmentId = doc.acf.pdf_file[0]; // Get first attachment ID
        const pdfUrl = await getAttachmentUrl(attachmentId, config);
        
        return {
          ...doc,
          acf: {
            ...doc.acf,
            pdf_file: pdfUrl
          }
        };
      }
      
      // If pdf_file is already a string URL
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