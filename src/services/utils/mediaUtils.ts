import axios from 'axios';

export const getAttachmentUrlByParent = async (id: number, config: any): Promise<string> => {
  try {
    console.log('Fetching media for document ID:', id);
    const response = await axios.get(`/media?parent=${id}`, {
      ...config,
      withCredentials: false
    });
    console.log('Media response:', response.data);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const pdfUrl = response.data[0].guid?.rendered || '';
      console.log('Extracted PDF URL:', pdfUrl);
      return pdfUrl;
    }
    
    return '';
  } catch (error) {
    console.error(`Error fetching media for document ${id}:`, error);
    return '';
  }
};