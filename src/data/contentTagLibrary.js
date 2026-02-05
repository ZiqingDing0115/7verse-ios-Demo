// 内容标签库 - 社交媒体话题标签（类似小红书/Instagram）
// ⚠️ 这个标签库用于角色发布时的内容标签，与 Persona/Relationship 标签库分开
// 📅 最后更新：2026-02-04

// 标签分类
export const CONTENT_TAG_CATEGORIES = {
  trending: {
    id: 'trending',
    label: '🔥 Trending',
    labelCN: '热门',
  },
  lifestyle: {
    id: 'lifestyle',
    label: '✨ Lifestyle',
    labelCN: '生活方式',
  },
  aesthetic: {
    id: 'aesthetic',
    label: '🎨 Aesthetic',
    labelCN: '美学风格',
  },
  vibe: {
    id: 'vibe',
    label: '💫 Vibe',
    labelCN: '氛围感',
  },
  relationship: {
    id: 'relationship',
    label: '💕 Relationship',
    labelCN: '关系',
  },
  personality: {
    id: 'personality',
    label: '🌟 Personality',
    labelCN: '个性',
  },
};

// 内容标签库
export const CONTENT_TAGS = [
  // 🔥 Trending - 热门话题
  { id: 'fyp', label: 'FYP', category: 'trending' },
  { id: 'viral', label: 'Viral', category: 'trending' },
  { id: 'trending', label: 'Trending', category: 'trending' },
  { id: 'explore', label: 'Explore', category: 'trending' },
  { id: 'foryou', label: 'ForYou', category: 'trending' },
  { id: 'newhere', label: 'NewHere', category: 'trending' },
  { id: 'follow4follow', label: 'Follow4Follow', category: 'trending' },
  
  // ✨ Lifestyle - 生活方式
  { id: 'dailylife', label: 'DailyLife', category: 'lifestyle' },
  { id: 'selfcare', label: 'SelfCare', category: 'lifestyle' },
  { id: 'wellness', label: 'Wellness', category: 'lifestyle' },
  { id: 'fitness', label: 'Fitness', category: 'lifestyle' },
  { id: 'foodie', label: 'Foodie', category: 'lifestyle' },
  { id: 'travel', label: 'Travel', category: 'lifestyle' },
  { id: 'ootd', label: 'OOTD', category: 'lifestyle' },
  { id: 'skincare', label: 'Skincare', category: 'lifestyle' },
  { id: 'makeup', label: 'Makeup', category: 'lifestyle' },
  { id: 'fashion', label: 'Fashion', category: 'lifestyle' },
  
  // 🎨 Aesthetic - 美学风格
  { id: 'aesthetic', label: 'Aesthetic', category: 'aesthetic' },
  { id: 'minimal', label: 'Minimal', category: 'aesthetic' },
  { id: 'vintage', label: 'Vintage', category: 'aesthetic' },
  { id: 'cottagecore', label: 'Cottagecore', category: 'aesthetic' },
  { id: 'darkacademia', label: 'DarkAcademia', category: 'aesthetic' },
  { id: 'y2k', label: 'Y2K', category: 'aesthetic' },
  { id: 'softgirl', label: 'SoftGirl', category: 'aesthetic' },
  { id: 'grunge', label: 'Grunge', category: 'aesthetic' },
  { id: 'clean', label: 'CleanGirl', category: 'aesthetic' },
  { id: 'coquette', label: 'Coquette', category: 'aesthetic' },
  
  // 💫 Vibe - 氛围感
  { id: 'cozy', label: 'Cozy', category: 'vibe' },
  { id: 'chill', label: 'Chill', category: 'vibe' },
  { id: 'dreamy', label: 'Dreamy', category: 'vibe' },
  { id: 'golden', label: 'GoldenHour', category: 'vibe' },
  { id: 'moody', label: 'Moody', category: 'vibe' },
  { id: 'sunny', label: 'Sunny', category: 'vibe' },
  { id: 'romantic', label: 'Romantic', category: 'vibe' },
  { id: 'mysterious', label: 'Mysterious', category: 'vibe' },
  { id: 'peaceful', label: 'Peaceful', category: 'vibe' },
  { id: 'energetic', label: 'Energetic', category: 'vibe' },
  
  // 💕 Relationship - 关系类型
  { id: 'bestie', label: 'Bestie', category: 'relationship' },
  { id: 'bff', label: 'BFF', category: 'relationship' },
  { id: 'soulmate', label: 'Soulmate', category: 'relationship' },
  { id: 'crush', label: 'Crush', category: 'relationship' },
  { id: 'partner', label: 'Partner', category: 'relationship' },
  { id: 'mentor', label: 'Mentor', category: 'relationship' },
  { id: 'muse', label: 'Muse', category: 'relationship' },
  { id: 'companion', label: 'Companion', category: 'relationship' },
  
  // 🌟 Personality - 个性特质
  { id: 'sunshine', label: 'Sunshine', category: 'personality' },
  { id: 'sweetheart', label: 'Sweetheart', category: 'personality' },
  { id: 'baddie', label: 'Baddie', category: 'personality' },
  { id: 'boss', label: 'BossBabe', category: 'personality' },
  { id: 'queen', label: 'Queen', category: 'personality' },
  { id: 'angel', label: 'Angel', category: 'personality' },
  { id: 'icon', label: 'Icon', category: 'personality' },
  { id: 'legend', label: 'Legend', category: 'personality' },
  { id: 'vibe', label: 'MainCharacter', category: 'personality' },
  { id: 'itgirl', label: 'ItGirl', category: 'personality' },
];

// 获取所有标签
export function getAllContentTags() {
  return CONTENT_TAGS;
}

// 获取分类下的标签
export function getTagsByCategory(categoryId) {
  return CONTENT_TAGS.filter(tag => tag.category === categoryId);
}

// 根据 ID 获取标签
export function getContentTagById(id) {
  return CONTENT_TAGS.find(tag => tag.id === id);
}

// 获取推荐标签（根据 Persona 标签映射）
export function getRecommendedContentTags(personaTags = []) {
  const recommended = new Set();
  
  // 标签映射规则
  const mapping = {
    // Persona → Content Tags
    'Elegant': ['Aesthetic', 'CleanGirl', 'Fashion', 'Icon'],
    'Model': ['OOTD', 'Fashion', 'ItGirl', 'Aesthetic'],
    'Sunshine': ['Sunny', 'Energetic', 'Sweetheart', 'GoldenHour'],
    'Flirty': ['Coquette', 'Crush', 'Romantic', 'SoftGirl'],
    'Gentle': ['Cozy', 'Peaceful', 'Angel', 'Dreamy'],
    'Bold': ['Baddie', 'BossBabe', 'Queen', 'MainCharacter'],
    'Mysterious': ['Moody', 'DarkAcademia', 'Mysterious', 'Grunge'],
    'Playful': ['Chill', 'BFF', 'Bestie', 'Y2K'],
    'Romantic': ['Romantic', 'Soulmate', 'Dreamy', 'Coquette'],
    'Professional': ['BossBabe', 'Mentor', 'Minimal', 'CleanGirl'],
    // Relationship → Content Tags
    'Best-Friend': ['BFF', 'Bestie', 'Companion'],
    'Lover': ['Soulmate', 'Romantic', 'Crush'],
    'Mentor': ['Mentor', 'Icon', 'Legend'],
    'Rival': ['Baddie', 'MainCharacter', 'Queen'],
  };
  
  personaTags.forEach(tag => {
    const mapped = mapping[tag];
    if (mapped) {
      mapped.forEach(t => recommended.add(t));
    }
  });
  
  // 如果没有匹配，返回一些默认热门标签
  if (recommended.size === 0) {
    return ['FYP', 'Trending', 'Aesthetic', 'Cozy', 'Bestie'];
  }
  
  // 返回前 6 个推荐标签
  return Array.from(recommended).slice(0, 6);
}

// 搜索标签
export function searchContentTags(query) {
  if (!query) return CONTENT_TAGS.slice(0, 10);
  
  const lowerQuery = query.toLowerCase();
  return CONTENT_TAGS.filter(tag => 
    tag.label.toLowerCase().includes(lowerQuery)
  );
}

export default {
  CONTENT_TAG_CATEGORIES,
  CONTENT_TAGS,
  getAllContentTags,
  getTagsByCategory,
  getContentTagById,
  getRecommendedContentTags,
  searchContentTags,
};
