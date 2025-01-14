import axios from 'axios';

export const getAttachmentUrlByParent = async (documentId: number, config: any): Promise<string> => {
  try {
    console.log('Fetching media for document ID:', documentId);
    const response = await axios.get(`/media?parent=${documentId}`, {
      ...config,
      headers: {
        ...config.headers,
        'Access-Control-Allow-Origin': '*',
      }
    });
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