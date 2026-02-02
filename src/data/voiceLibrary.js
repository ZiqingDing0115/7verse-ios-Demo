// 音色库数据
// 这个文件应该从后端 API 获取，这里先提供模拟数据

export const VOICE_LIBRARY = [
  {
    id: 'lively-woman',
    name: 'Lively woman',
    gender: 'Female',
    tags: ['Energetic', 'Friendly', 'Warm', 'Young'],
    description: 'A bright, energetic female voice with warmth and enthusiasm',
    recommended: true,
  },
  {
    id: 'calm-woman',
    name: 'Calm woman',
    gender: 'Female',
    tags: ['Calm', 'Mature', 'Soothing', 'Professional'],
    description: 'A gentle, calming female voice with a mature tone',
  },
  {
    id: 'steady-women',
    name: 'Steady women',
    gender: 'Female',
    tags: ['Steady', 'Confident', 'Clear', 'Reliable'],
    description: 'A confident and steady female voice, clear and trustworthy',
  },
  {
    id: 'friendly-women',
    name: 'Friendly women',
    gender: 'Female',
    tags: ['Friendly', 'Approachable', 'Warm', 'Casual'],
    description: 'A friendly and approachable female voice, easy to connect with',
  },
  {
    id: 'attractive-woman',
    name: 'Attractive woman',
    gender: 'Female',
    tags: ['Attractive', 'Charismatic', 'Smooth', 'Alluring'],
    description: 'A charismatic and attractive female voice with smooth delivery',
  },
  {
    id: 'deep-toned-man',
    name: 'Deep-toned man',
    gender: 'Male',
    tags: ['Deep', 'Masculine', 'Authoritative', 'Mature'],
    description: 'A deep, authoritative male voice with a mature tone',
  },
  {
    id: 'jovial-man',
    name: 'Jovial man',
    gender: 'Male',
    tags: ['Jovial', 'Cheerful', 'Humorous', 'Friendly'],
    description: 'A cheerful and jovial male voice, great for humor',
  },
  {
    id: 'lively-man',
    name: 'Lively man',
    gender: 'Male',
    tags: ['Lively', 'Energetic', 'Dynamic', 'Young'],
    description: 'A lively and energetic male voice with dynamic delivery',
  },
  {
    id: 'calm-man',
    name: 'Calm man',
    gender: 'Male',
    tags: ['Calm', 'Gentle', 'Soothing', 'Relaxed'],
    description: 'A calm and gentle male voice with a relaxing tone',
  },
];

// 获取推荐音色
export function getRecommendedVoice() {
  return VOICE_LIBRARY.find(voice => voice.recommended) || VOICE_LIBRARY[0];
}

// 根据 ID 获取音色
export function getVoiceById(id) {
  return VOICE_LIBRARY.find(voice => voice.id === id);
}

// 获取所有音色
export function getAllVoices() {
  return VOICE_LIBRARY;
}

// 根据标签筛选音色
export function filterVoicesByTags(tags) {
  return VOICE_LIBRARY.filter(voice =>
    tags.some(tag => voice.tags.includes(tag))
  );
}
