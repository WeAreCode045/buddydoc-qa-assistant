import { ApiConfig } from '../types/wordpress';
import { getWordPressData } from '../wordpressIntegration';

export const getApiConfig = (): ApiConfig => {
  const apiUrl = localStorage.getItem('wp_api_url') || 'https://your-wordpress-site.com/wp-json/wp/v2';
  const username = localStorage.getItem('wp_username');
  const password = localStorage.getItem('wp_password');
  const wpData = getWordPressData();
  
  const baseDomain = apiUrl.match(/(https?:\/\/[^\/]+)/)?.[1] || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  } else if (username && password) {
    headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`;
  }

  return {
    config: {
      baseURL: apiUrl,
      headers,
      withCredentials: false,
    },
    baseDomain,
  };
};