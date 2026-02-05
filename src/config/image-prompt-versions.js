// ============================================================================
// 图生图 Prompt 方案版本管理
// ============================================================================
// 用于 A/B 测试不同的 Prompt 策略，找到最佳效果
// ============================================================================

// 当前激活的版本
// 'v0.4' = 固定风格版
// 'v0.5' = 动态标签版 - 简单风格迁移
// 'v0.6' = 场景化版（推荐）- 角色身份映射 + 视角变化
export const ACTIVE_VERSION = 'v0.6';

// ============================================================================
// v0.1-combined - 合并 Prompt，一次生成 3 张图
// ============================================================================
// 目标：测试一次调用生成多张图的效果
// 特点：一个 Prompt 生成 3 张不同风格的图片
// ============================================================================

export const V0_1_COMBINED_PROMPTS = {
  version: 'v0.1-combined',
  name: '合并版 - 一次生成3张',
  description: '一个 Prompt 生成 3 张差异化风格的图片',
  date: '2026-02-03',
  
  // 合并的单个 Prompt - 生成三张图片
  combinedPrompt: 'Generate 3 images of the person in this photo: 1) Impressionist oil painting with visible brushstrokes, vibrant colors, outdoor natural lighting like Monet, 2) Cyberpunk neon portrait with blue and pink neon lights, futuristic city background, rain reflections, 3) Vintage 1950s Hollywood glamour black and white photo with soft focus and classic film grain.',
  
  // 生成数量
  imageCount: 3,
  
  // 风格标签（用于 UI 展示）
  styleLabels: ['🎨 Impressionist', '🌆 Cyberpunk', '🎬 Vintage B&W'],
  
  // 风格描述
  styleDescriptions: [
    '印象派油画，莫奈风格',
    '赛博朋克霓虹，未来感',
    '50年代好莱坞黑白照',
  ],
};

// ============================================================================
// v0.1 - 固定三种风格（分开调用版）- 每次调用只生成 1 张，ID 更稳定
// ============================================================================

export const V0_1_PROMPTS = {
  version: 'v0.1',
  name: '分开调用版（推荐）',
  description: '3 次独立 API 调用，每次 1 张，人物 ID 一致性更好',
  date: '2026-02-03',
  
  // 三种差异化风格的 Prompt（每个 Prompt 只生成 1 张图）
  prompts: [
    // 风格 1: 印象派油画
    'Impressionist oil painting portrait of this person, visible brushstrokes, vibrant colors, outdoor natural lighting, Monet style, same person same face',
    
    // 风格 2: 赛博朋克
    'Cyberpunk neon portrait of this person, blue and pink neon lights, futuristic city background, rain reflections, same person same face',
    
    // 风格 3: 复古黑白
    'Vintage 1950s Hollywood glamour black and white portrait of this person, soft focus, classic film grain, elegant, same person same face',
  ],
  
  styleLabels: ['🎨 Impressionist', '🌆 Cyberpunk', '🎬 Vintage B&W'],
  styleDescriptions: ['印象派油画，莫奈风格', '赛博朋克霓虹', '50年代好莱坞黑白'],
};

// ============================================================================
// v0.2 - 结合用户标签版（待测试）
// ============================================================================

export const V0_2_PROMPTS = {
  version: 'v0.2',
  name: '标签融合版',
  description: '结合用户选择的 Persona 标签生成个性化风格',
  date: '2026-02-03',
  status: 'pending', // pending | testing | active | deprecated
  
  // 动态生成函数
  generatePrompts: (selectedTags) => {
    const tagsText = selectedTags.join(', ');
    return [
      `Portrait of the person with ${tagsText} vibe, artistic oil painting style, warm tones, fine art`,
      `Portrait of the person with ${tagsText} energy, cinematic dramatic lighting, movie poster style`,
      `Portrait of the person with ${tagsText} aesthetic, fashion magazine editorial, glamorous`,
    ];
  },
  
  styleLabels: ['🎨 Artistic', '🎬 Cinematic', '📸 Fashion'],
};

// ============================================================================
// v0.3 - 极简版
// ============================================================================

export const V0_3_PROMPTS = {
  version: 'v0.3',
  name: '极简版',
  description: '最短的 Prompt，测试模型理解能力',
  date: '2026-02-03',
  status: 'pending',
  
  prompts: [
    'oil painting portrait, warm colors, artistic',
    'cinematic portrait, dramatic lighting, movie style',
    'fashion photography, studio lighting, glamorous',
  ],
  
  styleLabels: ['🎨 Artistic', '🎬 Cinematic', '📸 Fashion'],
};

// ============================================================================
// v0.4 - 超短版（推荐）- 纯风格迁移，不加标签
// ============================================================================
// 标签只用于：音色推荐、角色描述、System Prompt
// 图生图只做纯风格迁移，保持 Prompt 简短干净
// ============================================================================

export const V0_4_PROMPTS = {
  version: 'v0.4',
  name: '纯风格版',
  description: '只做风格迁移，不加标签，效果稳定',
  date: '2026-02-03',
  
  // 固定 Prompts，不使用标签
  prompts: [
    'anime style portrait',
    'cyberpunk neon portrait', 
    'vintage black white photo',
  ],
  
  styleLabels: ['🎨 Anime', '🌆 Cyberpunk', '🎬 Vintage B&W'],
  styleDescriptions: ['动漫风格', '赛博朋克', '复古黑白'],
};

// ============================================================================
// v0.5 - 动态标签版（推荐）- 根据用户标签调用 AI 生成
// ============================================================================
// 特点：调用 Gemini 根据用户选择的 Persona/Relationship 标签生成个性化风格
// Prompt 长度：5-10 词（适配 Flux 小模型两步推理）
// ============================================================================

export const V0_5_PROMPTS = {
  version: 'v0.5',
  name: '动态标签版（推荐）',
  description: '调用 AI 根据用户标签生成个性化风格 Prompt',
  date: '2026-02-04',
  
  // v0.5 是动态生成的，这里只是回退用的默认值
  fallbackPrompts: [
    'romantic soft portrait',
    'dramatic cinematic lighting',
    'artistic oil painting style',
  ],
  
  styleLabels: ['💕 Romantic', '🎬 Cinematic', '🎨 Artistic'],
  styleDescriptions: ['浪漫柔和', '电影感', '艺术风格'],
  
  // AI 生成的 System Prompt 模板
  systemPromptTemplate: `Generate 3 VERY SHORT (5-10 words) style prompts based on user's persona tags.
Each prompt should be visually distinct and match the character's vibe.
Output JSON: {"prompts": [...], "styleLabels": [...]}`,
};

// ============================================================================
// 获取当前激活版本的 Prompts
// ============================================================================

export function getActivePrompts(selectedTags = []) {
  switch (ACTIVE_VERSION) {
    case 'v0.1-combined':
      return {
        ...V0_1_COMBINED_PROMPTS,
        isCombined: true,
        prompt: V0_1_COMBINED_PROMPTS.combinedPrompt,
        imageCount: V0_1_COMBINED_PROMPTS.imageCount,
      };
    
    case 'v0.1':
      return {
        ...V0_1_PROMPTS,
        isCombined: false,
        prompts: V0_1_PROMPTS.prompts,
      };
    
    case 'v0.2':
      return {
        ...V0_2_PROMPTS,
        isCombined: false,
        prompts: V0_2_PROMPTS.generatePrompts(selectedTags),
      };
    
    case 'v0.3':
      return {
        ...V0_3_PROMPTS,
        isCombined: false,
        prompts: V0_3_PROMPTS.prompts,
      };
    
    case 'v0.4':
      return {
        ...V0_4_PROMPTS,
        isCombined: false,
        prompts: V0_4_PROMPTS.prompts,
      };
    
    case 'v0.5':
      // v0.5 是 AI 动态生成的，这里返回回退配置
      return {
        ...V0_5_PROMPTS,
        isCombined: false,
        prompts: V0_5_PROMPTS.fallbackPrompts,
        isDynamic: true, // 标记为动态生成
      };
    
    default:
      return V0_5_PROMPTS; // 默认使用动态标签版
  }
}

// ============================================================================
// 所有版本列表（用于管理界面）
// ============================================================================

export const ALL_VERSIONS = [
  V0_1_PROMPTS,
  V0_2_PROMPTS,
  V0_3_PROMPTS,
  V0_4_PROMPTS,
  V0_5_PROMPTS,
];

export default {
  ACTIVE_VERSION,
  getActivePrompts,
  ALL_VERSIONS,
  V0_1_PROMPTS,
  V0_2_PROMPTS,
  V0_3_PROMPTS,
  V0_4_PROMPTS,
  V0_5_PROMPTS,
};
