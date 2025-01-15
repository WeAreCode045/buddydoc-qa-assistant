export interface WPDocument {
  id: number;
  title: {
    rendered: string;
  };
  group_id?: number;
}

export interface ApiConfig {
  config: {
    baseURL: string;
    headers: Record<string, string>;
    withCredentials: boolean;
  };
  baseDomain: string;
}