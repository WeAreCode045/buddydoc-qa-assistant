interface WordPressData {
  postId?: number;
  userId?: number;
  userEmail?: string;
  userName?: string;
  nonce?: string;
}

declare global {
  interface Window {
    wpData?: WordPressData;
  }
}

export const getWordPressData = (): WordPressData => {
  // When running as a WordPress plugin, this data will be injected by WordPress
  return window.wpData || {
    postId: undefined,
    userId: undefined,
    userEmail: undefined,
    userName: undefined,
    nonce: undefined,
  };
};

export const isRunningInWordPress = (): boolean => {
  return !!window.wpData;
};