// AI 服务 - 使用 Qwen 235B 生成 Prompts
// 📅 最后更新：2026-02-05
// 📝 功能：调用 Qwen API 进行标签推荐、Prompt 生成等
// 🔖 运行时版本标记：若控制台看到此条说明已加载 Qwen 版本
export const AI_SERVICE_VERSION = 'qwen-20260205-fix1';

import { callQwenAPI, callGeminiAPI, getAIProvider } from '../config/api';

if (typeof window !== 'undefined') {
  console.log('✅ AI 服务已加载', AI_SERVICE_VERSION, '| 当前 AI:', getAIProvider(), '（改 URL ?ai=gemini 可切 Gemini）');
}
import { AI_PROMPTS } from '../config/prompts-library';

/** 把 messages 转成单条 prompt 给 Gemini 用 */
function buildPromptFromMessages(messages) {
  return messages.map(m => `${m.role === 'system' ? 'System' : 'User'}: ${m.content}`).join('\n\n');
}

/**
 * VLM 解析图片：用 Gemini 看图得到 subject/style/mood，供 Qwen 生成标签用。
 * 若 Gemini 不可用则返回占位描述，Qwen 仍可自由生成标签。
 */
async function getImageDescriptionFromVLM(imageBase64) {
  if (!imageBase64) {
    return { subject: '用户上传的角色图片', style: '未知', mood: '未知', vibe: '未知' };
  }
  try {
    const prompt = `Describe this character/portrait image in one short paragraph. Then output a JSON object with exactly these keys (no extra keys):
{"subject": "who or what, 1 sentence", "style": "visual/style", "mood": "mood/atmosphere", "vibe": "overall vibe in 2-3 words"}

Output ONLY the JSON, no other text.`;
    const { callGeminiAPI } = await import('../config/api');
    const result = await callGeminiAPI(prompt, imageBase64);
    if (result.success && result.text) {
      const parsed = parseQwenResponse(result.text);
      return {
        subject: parsed.subject || '角色图片',
        style: parsed.style || '未知',
        mood: parsed.mood || '未知',
        vibe: parsed.vibe || '未知',
      };
    }
  } catch (e) {
    console.warn('⚠️ VLM 解析图片失败，使用占位描述:', e.message);
  }
  return { subject: '用户上传的角色图片', style: '未知', mood: '未知', vibe: '未知' };
}

// 是否使用 AI 生成 Prompts，设为 false 则使用本地模板
const USE_AI_FOR_PROMPTS = true;

// 标签推荐策略：true = Qwen 根据 VLM 解析自由生成网感标签（反差+相似）；false = 从标签库选择
const USE_FREE_TAG_GENERATION = true;

// 控制台输出样式
const LOG_DIVIDER = '═══════════════════════════════════════════════════════════════';

// 解析 AI 响应（Qwen/Gemini 通用，去掉 <think> 标签，提取 JSON）
const parseQwenResponse = (text) => {
  // 去掉 <think>...</think> 标签
  let cleanText = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  // 去掉 Markdown 代码块（```json ... ``` 或 ``` ... ```）
  cleanText = cleanText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
  
  // 尝试多种方式提取 JSON
  let jsonText = null;
  
  // 方式 1：完整的 { ... }
  const fullMatch = cleanText.match(/\{[\s\S]*\}/);
  if (fullMatch) {
    jsonText = fullMatch[0];
  } else {
    // 方式 2：缺少开头的 {，找第一个 "xxx": 到最后一个 }
    const partialMatch = cleanText.match(/"[^"]+"\s*:[\s\S]*\}/);
    if (partialMatch) {
      jsonText = '{' + partialMatch[0]; // 补上开头的 {
    }
  }
  
  if (!jsonText) {
    throw new Error('未找到有效 JSON');
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error('JSON 解析失败，原始文本:', cleanText);
    throw new Error(`JSON 解析失败: ${e.message}`);
  }
};

// AI 服务对象
export const aiService = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. 推荐标签（Step 2 - 分析描述推荐 7 个标签）
  // ═══════════════════════════════════════════════════════════════════════════
  async recommendTags(imageBase64) {
    const provider = getAIProvider();
    const useFreeGen = USE_FREE_TAG_GENERATION;
    console.log('🎨 开始推荐标签（', useFreeGen ? 'Qwen 自由生成网感标签' : (provider === 'gemini' ? 'Gemini' : 'Qwen') + ' 从标签库选择', '）...');

    if (!USE_AI_FOR_PROMPTS) {
      return this.mockRecommendTags();
    }

    try {
      // ─── 策略：自由生成网感标签（VLM 解析 + Qwen 生成，有反差有相似）───
      if (useFreeGen) {
        console.log('📷 Step 2a: VLM 解析图片...');
        const vlmDesc = await getImageDescriptionFromVLM(imageBase64);
        const descText = `subject: ${vlmDesc.subject}\nstyle: ${vlmDesc.style}\nmood: ${vlmDesc.mood}\nvibe: ${vlmDesc.vibe}`;
        console.log('   VLM 描述:', descText);

        const freeMessages = [
          {
            role: 'system',
            content: `你是一个北美网感内容专家，负责为 AI 角色生成有网感的英文短标签。

规则：
1. 根据「图片描述」直接自由创作标签，不要从固定列表里选。
2. 输出 6 个 Persona 标签 + 1 个 Relationship 标签，共 7 个。
3. 策略：一部分与图片描述「相似」（贴合人设/风格），一部分「反差」（制造惊喜、记忆点），例如正经外表配 Vampire、Yandere 等。
4. 标签要短、有网感、适合 TikTok/Instagram 人设，英文。
5. 直接输出 JSON，不要解释。

输出格式（仅此 JSON）：
{
  "image_analysis": {"subject": "简短总结", "style": "风格", "mood": "氛围"},
  "recommended_persona_tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "recommended_relationship": "一个词"
}`
          },
          {
            role: 'user',
            content: `图片描述：\n${descText}\n\n请根据以上描述，生成 7 个有网感的标签（6 个 Persona + 1 个 Relationship），要有相似也有反差。`
          }
        ];

        const result = await callQwenAPI(freeMessages, { stream: false, maxTokens: 320, temperature: 0.85 });
        if (result.success) {
          try {
            const response = parseQwenResponse(result.text);
            const personaTags = response.recommended_persona_tags || response.recommended_tags || [];
            const relationshipTag = response.recommended_relationship || null;
            const allTags = relationshipTag ? [...personaTags, relationshipTag] : personaTags;

            console.log('');
            console.log(LOG_DIVIDER);
            console.log('🤖 STEP 2: Qwen 自由生成网感标签');
            console.log(LOG_DIVIDER);
            console.log('🎭 Persona:', personaTags.join(', '));
            if (relationshipTag) console.log('💕 Relationship:', relationshipTag);
            console.log('⏱️ 耗时:', result.duration);
            console.log(LOG_DIVIDER);

            return {
              success: true,
              tags: allTags,
              personaTags,
              relationshipTag,
              imageAnalysis: response.image_analysis || vlmDesc,
              duration: result.duration,
              method: 'qwen_free',
            };
          } catch (e) {
            console.error('❌ 解析自由生成标签 JSON 失败:', e, '原始响应:', result.text);
            return this.mockRecommendTags();
          }
        }
        console.warn('⚠️ Qwen 自由生成失败，回退到标签库策略:', result.error);
        // 回退到下方「从标签库选择」逻辑
      }

      // ─── 策略：从标签库选择（保留，后续可能再用）───
      const tagLibrary = AI_PROMPTS.tagRecommendation.tagLibrary;
      const messages = [
        {
          role: 'system',
          content: `你是一个 AI 角色创建专家。根据图片特征推荐最适合的角色标签。

规则：
1. 从标签库中选择 6 个 Persona 标签
2. 选择 1 个 Relationship 标签
3. 标签要有趣、有创意，不要太无聊
4. 直接输出 JSON，不要解释

输出格式：
{
  "image_analysis": {"subject": "描述", "style": "风格"},
  "recommended_persona_tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "recommended_relationship": "relationship_tag"
}

可用标签库（前 60 个）：${tagLibrary.slice(0, 60).join(', ')}`
        },
        {
          role: 'user',
          content: '请为这个角色推荐标签。这是一个有魅力、神秘感的人物。'
        }
      ];

      let result;
      if (provider === 'gemini') {
        result = await callGeminiAPI(buildPromptFromMessages(messages), imageBase64 || null);
      } else {
        result = await callQwenAPI(messages, { stream: false, maxTokens: 300, temperature: 0.8 });
      }

      if (result.success) {
        try {
          const response = parseQwenResponse(result.text);
          const personaTags = response.recommended_persona_tags || response.recommended_tags || [];
          const relationshipTag = response.recommended_relationship || null;
          const allTags = relationshipTag ? [...personaTags, relationshipTag] : personaTags;

          console.log('');
          console.log(LOG_DIVIDER);
          console.log('🤖 STEP 2:', provider === 'gemini' ? 'Gemini' : 'Qwen', '标签推荐（来自标签库）');
          console.log(LOG_DIVIDER);
          console.log('🎭 推荐 Persona 标签:', personaTags.join(', '));
          if (relationshipTag) console.log('💕 推荐 Relationship:', relationshipTag);
          console.log('⏱️ 耗时:', result.duration);
          console.log(LOG_DIVIDER);

          return {
            success: true,
            tags: allTags,
            personaTags,
            relationshipTag,
            imageAnalysis: response.image_analysis,
            duration: result.duration,
            method: provider,
          };
        } catch (e) {
          console.error('❌ 解析标签 JSON 失败:', e, '原始响应:', result.text);
          return this.mockRecommendTags();
        }
      }

      console.warn('⚠️', provider === 'gemini' ? 'Gemini' : 'Qwen', '调用失败，使用本地逻辑:', result.error);
      return this.mockRecommendTags();
    } catch (error) {
      console.error('❌ 推荐标签异常:', error);
      return this.mockRecommendTags();
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. 生成图生图 Prompts（Step 3 - 根据标签动态生成 3 个风格 prompts）
  // ═══════════════════════════════════════════════════════════════════════════
  async generateImagePrompts(imageBase64, selectedTags) {
    const provider = getAIProvider();
    const { ACTIVE_VERSION } = await import('../config/image-prompt-versions.js');
    
    console.log(LOG_DIVIDER);
    console.log(`🎨 STEP 3A: 图生图 Prompt 生成（${provider === 'gemini' ? 'Gemini' : 'Qwen 235B'}）`);
    console.log(`📌 方案版本: ${ACTIVE_VERSION}`);
    console.log(`🏷️ 收到用户标签 (${selectedTags?.length || 0} 个):`);
    if (selectedTags && selectedTags.length > 0) {
      selectedTags.forEach((tag, i) => console.log(`   ${i + 1}. ${tag}`));
    } else {
      console.log(`   ⚠️ 无标签！将使用默认风格`);
    }
    console.log(LOG_DIVIDER);

    if (USE_AI_FOR_PROMPTS && selectedTags.length > 0) {
      try {
        const randomSeed = Math.floor(Math.random() * 10000);
        const angles = ['low angle shot', 'high angle shot', 'close-up portrait', 'profile view', 'three-quarter view'];
        const randomAngles = angles.sort(() => Math.random() - 0.5).slice(0, 3);
        
        const messages = [
          {
            role: 'system',
            content: `你是一个电影级角色摄影导演。根据用户的角色标签，生成 3 个不同场景的图片 Prompt。

规则：
1. 每个 Prompt 必须以 "exact same person exact same face" 开头
2. 每个 Prompt 必须以 "preserve facial features" 结尾
3. 每个场景要匹配角色身份（如 Prince → 王座、Vampire → 城堡）
4. 使用不同的相机角度
5. Prompt 要简短（15-25 词）
6. 直接输出 JSON，不要思考过程

⚠️ Relationship 标签说明（必读）：
- 用户可能传了 Relationship 标签（如 Soulmate、Complicated、Best Friend）。它表示「用户和这个角色的关系」，不是「画面里要有两个人」。
- 每张图里只能出现「这一个角色」这一张脸，绝对不能画第二个人。Relationship 只影响氛围/情绪（如温柔、信赖感），用单人场景表达即可。

⚠️ 严禁多人（必守）：
- 禁止使用会诱导生成两人的英文描述：side by side, two people, looking at each other, eye contact with another person, soulmate connection（两人对视/并肩等）。可改为单人：gazing at viewer with soulful eyes（同一人看镜头）、walking alone at golden hour（同一人独行）。

输出格式：
{
  "prompts": ["prompt1", "prompt2", "prompt3"],
  "styleLabels": ["Scene1", "Scene2", "Scene3"]
}`
          },
          {
            role: 'user',
            content: `角色标签：${selectedTags.join(', ')}
建议角度：${randomAngles.join(', ')}
随机种子：${randomSeed}

生成 3 个电影级场景 Prompt！`
          }
        ];

        let result;
        if (provider === 'gemini') {
          result = await callGeminiAPI(buildPromptFromMessages(messages), imageBase64 || null);
        } else {
          result = await callQwenAPI(messages, { stream: false, maxTokens: 400, temperature: 0.9 });
        }

        if (result.success) {
          const response = parseQwenResponse(result.text);
          const prompts = response.prompts || [];
          const styleLabels = response.styleLabels || ['Style 1', 'Style 2', 'Style 3'];

          console.log('');
          console.log('🤖 ═══', provider === 'gemini' ? 'Gemini' : 'Qwen', '生成的动态 Prompts ═══');
          console.log('📷 图 1: 原图（保留）');
          prompts.forEach((p, i) => {
            console.log(`🎨 图 ${i + 2} [${styleLabels[i]}]: ${p}`);
          });
          console.log('═══════════════════════════════════════════');
          console.log('');

          return {
            success: true,
            isCombined: false,
            prompts: prompts,
            version: provider === 'gemini' ? 'v0.6-gemini' : 'v0.6-qwen',
            versionName: provider === 'gemini' ? 'Gemini 动态版' : 'Qwen 动态版',
            styleLabels: styleLabels,
            duration: result.duration || '0.0s',
            method: provider,
          };
        }
      } catch (error) {
        console.warn('⚠️', provider === 'gemini' ? 'Gemini' : 'Qwen', '生成失败，回退到固定版本:', error.message);
      }
    }

    // 回退：使用版本管理系统的固定 Prompt
    const { getActivePrompts } = await import('../config/image-prompt-versions.js');
    const activeConfig = getActivePrompts(selectedTags);
    
    console.log('📦 使用固定版本 Prompts:');
    console.log('   📷 图 1: 原图（保留）');
    const prompts = activeConfig.prompts || [];
    prompts.forEach((p, i) => {
      const label = activeConfig.styleLabels?.[i] || `风格${i + 1}`;
      console.log(`   🎨 图 ${i + 2}: [${label}] ${p}`);
    });
    console.log(LOG_DIVIDER);

    return {
      success: true,
      isCombined: false,
      prompts: prompts,
      version: activeConfig.version || 'v0.4',
      versionName: activeConfig.name || '固定版',
      styleLabels: activeConfig.styleLabels,
      duration: '0.0s',
      method: 'version_managed',
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. 推荐音色（Step 3 - 根据图片和标签推荐音色）
  // ═══════════════════════════════════════════════════════════════════════════
  async recommendVoice(imageBase64, selectedTags, voiceLibrary) {
    const provider = getAIProvider();
    console.log('🎙️ 推荐音色（', provider === 'gemini' ? 'Gemini' : 'Qwen 235B', '）...', { selectedTags });

    if (!USE_AI_FOR_PROMPTS || !voiceLibrary) {
      return this.mockRecommendVoice();
    }

    try {
      const voiceSummary = voiceLibrary.slice(0, 30).map(v => ({
        id: v.id,
        name: v.name,
        gender: v.gender,
        accent: v.accent,
      }));
      
      const messages = [
        {
          role: 'system',
          content: `你是一个音色匹配专家。根据角色标签推荐最合适的音色。

规则：
1. 分析角色特征（性别、年龄、性格）
2. 从音色库中选择最匹配的音色 ID
3. 直接输出 JSON，不要思考过程

输出格式：
{
  "character_voice_profile": {
    "perceived_gender": "male/female",
    "perceived_age": "young/adult/mature",
    "suggested_tone": "confident/gentle/mysterious"
  },
  "recommended_voice_id": "voice_id",
  "reasoning": "推荐理由（一句话）"
}`
        },
        {
          role: 'user',
          content: `角色标签：${selectedTags.join(', ')}

音色库：${JSON.stringify(voiceSummary)}

推荐最合适的音色！`
        }
      ];
      
      let result;
      if (provider === 'gemini') {
        result = await callGeminiAPI(buildPromptFromMessages(messages), imageBase64 || null);
      } else {
        result = await callQwenAPI(messages, { stream: false, maxTokens: 250, temperature: 0.7 });
      }

      if (result.success) {
        try {
          const response = parseQwenResponse(result.text);
          
          console.log(LOG_DIVIDER);
          console.log('🎙️ STEP 3B:', provider === 'gemini' ? 'Gemini' : 'Qwen', '音色推荐');
          console.log(LOG_DIVIDER);
          
          if (response.character_voice_profile) {
            const profile = response.character_voice_profile;
            console.log('👤 角色声音画像:');
            console.log('   性别:', profile.perceived_gender || '-');
            console.log('   年龄:', profile.perceived_age || '-');
            console.log('   语调:', profile.suggested_tone || '-');
          }
          
          console.log('');
          console.log('🎯 推荐音色:', response.recommended_voice_id);
          console.log('💭 推荐理由:', response.reasoning);
          console.log('⏱️ 耗时:', result.duration);
          console.log(LOG_DIVIDER);
          
          return {
            success: true,
            recommendation: {
              recommended_voice_id: response.recommended_voice_id,
              reasoning: response.reasoning,
              voice_profile: response.character_voice_profile,
            },
            duration: result.duration,
            method: provider,
          };
        } catch (e) {
          console.error('❌ 解析音色推荐失败:', e);
          return this.mockRecommendVoice();
        }
      }

      return this.mockRecommendVoice();
    } catch (error) {
      console.error('❌ 推荐音色异常:', error);
      return this.mockRecommendVoice();
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. 生成视频 Prompt（Step 4）
  // ═══════════════════════════════════════════════════════════════════════════
  async generateVideoPrompt(imageDescription, voiceMetadata, selectedTags) {
    const provider = getAIProvider();
    console.log('🎬 生成视频 Prompt（', provider === 'gemini' ? 'Gemini' : 'Qwen 235B', '）...', { selectedTags });

    if (!USE_AI_FOR_PROMPTS) {
      return this.mockGenerateVideoPrompt();
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `你是一个视频创意导演。根据角色标签生成视频脚本和动作指令。

规则：
1. 生成一句简短的开场台词（英文，10-15 词）
2. 生成视频动作 Prompt（描述表情和动作）
3. 推荐一个角色名字
4. 直接输出 JSON，不要思考过程

输出格式：
{
  "character_persona": {
    "personality": "性格特点",
    "energy_level": "high/medium/low"
  },
  "script_text": "Hey there! I've been waiting for you...",
  "video_model_prompt": "Close-up shot, character smiles warmly, gentle head tilt, maintaining eye contact",
  "suggested_name": "角色名字",
  "reasoning": "创意理由"
}`
        },
        {
          role: 'user',
          content: `角色标签：${selectedTags.join(', ')}
音色信息：${JSON.stringify(voiceMetadata || {})}

生成一个吸引人的开场！`
        }
      ];
      
      let result;
      if (provider === 'gemini') {
        result = await callGeminiAPI(buildPromptFromMessages(messages), null);
      } else {
        result = await callQwenAPI(messages, { stream: false, maxTokens: 350, temperature: 0.8 });
      }

      if (result.success) {
        try {
          const response = parseQwenResponse(result.text);
          
          console.log(LOG_DIVIDER);
          console.log('🎬 STEP 4:', provider === 'gemini' ? 'Gemini' : 'Qwen', '视频 Prompt 生成');
          console.log(LOG_DIVIDER);
          
          if (response.character_persona) {
            const persona = response.character_persona;
            console.log('👤 角色性格:');
            console.log('   性格:', persona.personality || '-');
            console.log('   能量:', persona.energy_level || '-');
          }
          
          if (response.suggested_name) {
            console.log('');
            console.log('🏷️ 推荐角色名称:', response.suggested_name);
          }
          
          console.log('');
          console.log('💬 台词:', response.script_text);
          console.log('🎥 视频指令:', response.video_model_prompt);
          console.log('💭 理由:', response.reasoning);
          console.log('⏱️ 耗时:', result.duration);
          console.log(LOG_DIVIDER);
          
          return {
            success: true,
            videoData: {
              script_text: response.script_text,
              video_model_prompt: response.video_model_prompt,
              character_persona: response.character_persona,
              suggested_name: response.suggested_name,
              reasoning: response.reasoning,
            },
            duration: result.duration,
            method: provider,
          };
        } catch (e) {
          console.error('❌ 解析视频数据失败:', e);
          return this.mockGenerateVideoPrompt();
        }
      }

      return this.mockGenerateVideoPrompt();
    } catch (error) {
      console.error('❌ 生成视频 Prompt 异常:', error);
      return this.mockGenerateVideoPrompt();
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 模拟/备用函数
  // ═══════════════════════════════════════════════════════════════════════════

  async mockRecommendTags() {
    console.log('🔧 使用默认标签推荐');
    
    // 使用标签库中实际存在的标签
    const defaultPersonaTags = ['Mysterious', 'Prince', 'Vampire', 'CEO', 'Artist', 'Model'];
    const defaultRelationship = 'Secret-Admirer';
    
    return {
      success: true,
      tags: [...defaultPersonaTags, defaultRelationship],
      personaTags: defaultPersonaTags,
      relationshipTag: defaultRelationship,
      duration: '0.0s',
      method: 'default',
    };
  },

  async mockRecommendVoice() {
    console.log('🔧 使用默认音色推荐');

    return {
      success: true,
      recommendation: {
        recommended_voice_id: 'lively-woman',
        reasoning: 'Default recommendation based on common preferences.',
      },
      duration: '0.0s',
      method: 'default',
    };
  },

  async mockGenerateVideoPrompt() {
    console.log('🔧 使用默认视频 Prompt');

    return {
      success: true,
      videoData: {
        script_text: 'Hey there! Welcome to my world. Let me show you around.',
        video_model_prompt: 'A close-up shot, the character smiles warmly, eyes bright and welcoming, gentle head tilt, maintaining natural eye contact',
        reasoning: 'Default energetic and welcoming introduction.',
      },
      duration: '0.0s',
      method: 'default',
    };
  },
};

// 切换 AI 模式
export function setUseAI(enabled) {
  console.log(enabled ? '✅ 启用 Qwen AI 生成' : '⚠️ 切换到本地模板模式');
}
