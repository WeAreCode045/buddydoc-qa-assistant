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

export interface ApiConfig {
  config: {
    baseURL: string;
    headers: Record<string, string>;
    withCredentials: boolean;
  };
  baseDomain: string;
}