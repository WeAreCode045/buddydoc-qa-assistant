import { getApiConfig } from './utils/apiConfig';

export interface WPDocument {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  bb_group_id?: number;
}

class WordPressApi {
  async getDocuments(groupId?: number): Promise<WPDocument[]> {
    const config = getApiConfig();
    const endpoint = groupId 
      ? `${config.apiUrl}/bb/v1/groups/${groupId}/documents`
      : `${config.apiUrl}/wp/v2/documents`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return response.json();
  }
}

export const wordpressApi = new WordPressApi();