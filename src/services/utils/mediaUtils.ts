import axios from 'axios';

export const getAttachmentUrlByParent = async (id: number, config: any): Promise<string> => {
  try {
    console.log('Fetching media for document ID:', id);
    const response = await axios.get(`/media?parent=${id}`, {
      ...config,
      withCredentials: false,
      headers: {
        ...config.headers,
        'mode': 'no-cors'
      }
    });
    console.log('Media response:', response.data);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const mediaItem = response.data[0];
      // Get the source URL directly from the media item
      const pdfUrl = mediaItem.source_url || mediaItem.guid?.rendered || '';
      console.log('Retrieved PDF URL:', pdfUrl);
      return pdfUrl;
    }
    
    return '';
  } catch (error) {
    console.error(`Error fetching media for document ${id}:`, error);
    throw error;
  }
};