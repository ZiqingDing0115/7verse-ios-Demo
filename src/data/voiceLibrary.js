// 音色库数据 - [iOS] 7verse投稿音色库 by Katherine（Collection ID: O61D3sjuAajNAZz5xVCo）
// 运行时优先从 ElevenLabs v2 API 按 collection_id 拉取，此处为备用/降级数据
// 📅 最后更新：2026-02-06

// 预览 URL：运行时由 API 返回的 preview_url 覆盖；此处占位
const PREVIEW_PLACEHOLDER = null;

export const VOICE_LIBRARY = [
  {
    id: 'gravel-midnight',
    name: 'Gravel Midnight',
    gender: 'Male',
    tags: ['Deep', 'Grit', 'Character', 'English'],
    description: 'A deep, rough character voice with heavy texture',
    previewUrl: PREVIEW_PLACEHOLDER,
    recommended: true,
    matchingPersona: ['Dark', 'Villain', 'Gritty'],
  },
  {
    id: 'peter-parker-gamer',
    name: 'Peter Parker gamer',
    gender: 'Male',
    tags: ['Young', 'Shy', 'Awkward', 'English'],
    description: 'Add a single VO line in a shy, slightly awkward tone',
    previewUrl: PREVIEW_PLACEHOLDER,
    matchingPersona: ['Playful', 'Nerdy', 'Relatable'],
  },
  {
    id: 'bitchy-sassy-gay-friend',
    name: 'bitchy sassy gay friend',
    gender: 'Male',
    tags: ['Expressive', 'Sassy', 'American', 'English'],
    description: 'Young American male, early 20s, expressive and sassy',
    previewUrl: PREVIEW_PLACEHOLDER,
    matchingPersona: ['Sassy', 'Chaotic', 'Witty'],
  },
  {
    id: 'tom-hardy',
    name: 'tom hardy',
    gender: 'Male',
    tags: ['Deep', 'British', 'Character', 'English'],
    description: 'Tom Hardy style character voice',
    previewUrl: PREVIEW_PLACEHOLDER,
    matchingPersona: ['Bold', 'Gritty', 'Villain'],
  },
  {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    gender: 'Female',
    tags: ['Young', 'American', 'Pop', 'English'],
    description: 'Taylor Swift style voice',
    previewUrl: PREVIEW_PLACEHOLDER,
    matchingPersona: ['Playful', 'Sunshine', 'Gentle'],
  },
  {
    id: 'the-best-guy-friend-ian',
    name: 'the best guy friend ian',
    gender: 'Male',
    tags: ['Warm', 'Natural', 'Friendly', 'English'],
    description: 'Warm, natural male voice in his 19~20s. Friendly, casual, and relatable. Perfect for the best guy friend character.',
    previewUrl: PREVIEW_PLACEHOLDER,
    matchingPersona: ['Reliable', 'Friendly', 'Protector'],
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

// 根据名称获取音色
export function getVoiceByName(name) {
  return VOICE_LIBRARY.find(voice =>
    voice.name.toLowerCase() === name.toLowerCase()
  );
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

// 根据人设匹配音色
export function matchVoiceByPersona(personaTags) {
  const matched = VOICE_LIBRARY.filter(voice =>
    voice.matchingPersona?.some(p =>
      personaTags.some(tag => tag.toLowerCase().includes(p.toLowerCase()))
    )
  );
  return matched.length > 0 ? matched[0] : getRecommendedVoice();
}
