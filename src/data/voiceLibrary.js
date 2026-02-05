// 音色库数据 - 使用真实的 ElevenLabs Voice ID
// ⚠️ 这些 ID 是 ElevenLabs 官方预设音色，保证 TTS 可用
// 📅 最后更新：2026-02-04
// 🎯 设计原则：
//    - 只保留英语音色
//    - 用生动形容词代替名字
//    - 多样性：非人类、儿童、老人等

// ElevenLabs 预览音频 URL 格式
const PREVIEW_BASE = 'https://storage.googleapis.com/eleven-public-prod/premade/voices';

export const VOICE_LIBRARY = [
  // ========== Female Voices ==========
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sweet Girl',
    gender: 'Female',
    tags: ['Sweet', 'Young', 'Gentle', 'English'],
    description: 'Soft and sweet young female, like your friendly neighbor',
    previewUrl: `${PREVIEW_BASE}/EXAVITQu4vr4xnSDxMaL/manifest.json`,
    recommended: true,
    matchingPersona: ['Gentle', 'Playful', 'Sunshine'],
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Mature Lady',
    gender: 'Female',
    tags: ['Mature', 'Calm', 'Professional', 'English'],
    description: 'Sophisticated mature female, calm and composed',
    previewUrl: `${PREVIEW_BASE}/21m00Tcm4TlvDq8ikWAM/manifest.json`,
    matchingPersona: ['Elegant', 'Professional', 'Mentor'],
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Fierce Queen',
    gender: 'Female',
    tags: ['Strong', 'Bold', 'Fierce', 'English'],
    description: 'Powerful and commanding, a true queen',
    previewUrl: `${PREVIEW_BASE}/AZnzlk1XvdvUeBnXmlld/manifest.json`,
    matchingPersona: ['Bold', 'Dominant', 'Villain'],
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Bubbly Teen',
    gender: 'Female',
    tags: ['Young', 'Bubbly', 'Energetic', 'English'],
    description: 'Enthusiastic teenage energy, full of life',
    previewUrl: `${PREVIEW_BASE}/MF3mGyEYCl7XYWbV9V6O/manifest.json`,
    matchingPersona: ['Playful', 'Chaotic', 'Tsundere'],
  },
  {
    id: 'jsCqWAovK2LkecY7zXl4',
    name: 'Wise Grandma',
    gender: 'Female',
    tags: ['Elderly', 'Warm', 'Wise', 'English'],
    description: 'Loving grandmother voice, warm and nurturing',
    previewUrl: `${PREVIEW_BASE}/jsCqWAovK2LkecY7zXl4/manifest.json`,
    matchingPersona: ['Protective', 'Mentor', 'Gentle'],
  },

  // ========== Male Voices ==========
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Alpha Male',
    gender: 'Male',
    tags: ['Deep', 'Dominant', 'Powerful', 'English'],
    description: 'Deep commanding voice, natural leader',
    previewUrl: `${PREVIEW_BASE}/ErXwobaYiN019PkySvjV/manifest.json`,
    matchingPersona: ['CEO', 'Mafia-Boss', 'Villain'],
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Dark Lord',
    gender: 'Male',
    tags: ['Gravelly', 'Mysterious', 'Intense', 'English'],
    description: 'Gravelly intense voice, perfect for villains',
    previewUrl: `${PREVIEW_BASE}/VR6AewLTigWG4xSOukaG/manifest.json`,
    matchingPersona: ['Demon', 'Vampire', 'Mysterious'],
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Gentle Giant',
    gender: 'Male',
    tags: ['Deep', 'Warm', 'Friendly', 'English'],
    description: 'Deep but warm, like a protective big brother',
    previewUrl: `${PREVIEW_BASE}/pNInz6obpgDQGcFmaJgB/manifest.json`,
    matchingPersona: ['Protector', 'Knight', 'Reliable'],
  },
  {
    id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Playful Boy',
    gender: 'Male',
    tags: ['Young', 'Energetic', 'Playful', 'English'],
    description: 'Youthful energetic male, fun and spontaneous',
    previewUrl: `${PREVIEW_BASE}/yoZ06aMxZJJ28mfd3POQ/manifest.json`,
    matchingPersona: ['Playful', 'Mischievous', 'Idol'],
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Grumpy Old Man',
    gender: 'Male',
    tags: ['Elderly', 'Gruff', 'Wise', 'English'],
    description: 'Grumpy but lovable old man, secretly caring',
    previewUrl: `${PREVIEW_BASE}/TxGEqnHWrfWFTfGW9XjX/manifest.json`,
    matchingPersona: ['Grumpy', 'Mentor', 'Stoic'],
  },

  // ========== Special / Non-Human Voices ==========
  {
    id: 'flq6f7yk4E4fJM5XTYuZ',
    name: 'Robot Butler',
    gender: 'Neutral',
    tags: ['Robotic', 'Precise', 'Polite', 'English'],
    description: 'Precise robotic voice, helpful AI assistant',
    previewUrl: `${PREVIEW_BASE}/flq6f7yk4E4fJM5XTYuZ/manifest.json`,
    matchingPersona: ['Android', 'Professional', 'Hacker'],
  },
  {
    id: 'XB0fDUnXU5powFXDhCwa',
    name: 'Mischievous Imp',
    gender: 'Neutral',
    tags: ['Quirky', 'Mischievous', 'Playful', 'English'],
    description: 'Impish and playful, full of tricks',
    previewUrl: `${PREVIEW_BASE}/XB0fDUnXU5powFXDhCwa/manifest.json`,
    matchingPersona: ['Demon', 'Chaotic', 'Mischievous'],
  },
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Tiny Fairy',
    gender: 'Female',
    tags: ['Tiny', 'Magical', 'Cute', 'English'],
    description: 'High-pitched magical creature, ethereal',
    previewUrl: `${PREVIEW_BASE}/onwK4e9ZLuTAKqWW03F9/manifest.json`,
    matchingPersona: ['Elf', 'Angel', 'Fairycore'],
  },
  {
    id: 'g5CIjZEefAph4nQFvHAz',
    name: 'Spooky Ghost',
    gender: 'Neutral',
    tags: ['Eerie', 'Whisper', 'Mysterious', 'English'],
    description: 'Haunting whisper, ethereal presence',
    previewUrl: `${PREVIEW_BASE}/g5CIjZEefAph4nQFvHAz/manifest.json`,
    matchingPersona: ['Ghost', 'Mysterious', 'Fallen-Angel'],
  },
  {
    id: 'SOYHLrjzK2X1ezoPC6cr',
    name: 'Tiny Kid',
    gender: 'Neutral',
    tags: ['Child', 'Innocent', 'Cute', 'English'],
    description: 'Adorable child voice, pure innocence',
    previewUrl: `${PREVIEW_BASE}/SOYHLrjzK2X1ezoPC6cr/manifest.json`,
    matchingPersona: ['Playful', 'Innocent', 'Sunshine'],
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
