interface WordPressData {
  userId?: string;
  userName?: string;
  postId?: string;
  groupId?: string;
}

export const isRunningInWordPress = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).bbChatBuddy;
};

export const getWordPressData = (): WordPressData => {
  if (!isRunningInWordPress()) {
    return {};
  }

  const bbData = (window as any).bbChatBuddy || {};
  return {
    userId: bbData.current_user_id,
    userName: bbData.current_user_name,
    postId: bbData.current_post_id,
    groupId: bbData.current_group_id
  };
};