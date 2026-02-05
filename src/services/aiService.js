// AI 服务 - 使用 Gemini 3.0 Flash 生成 Prompts
// 📅 最后更新：2026-02-02
// 📝 功能：调用 Gemini API，解析响应，在控制台展示 AI 分析过程

import { callGeminiAPI } from '../config/api';
import { AI_PROMPTS } from '../config/prompts-library';

// 是否使用 AI（Gemini）生成 Prompts，设为 false 则使用本地模板
const USE_AI_FOR_PROMPTS = true;

// 控制台输出样式
const LOG_DIVIDER = '═══════════════════════════════════════════════════════════════';

// AI 服务对象
export const aiService = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. 推荐标签（Step 2 - 分析图片推荐 7 个标签）
  // ═══════════════════════════════════════════════════════════════════════════
  async recommendTags(imageBase64) {
    console.log('🎨 开始推荐标签...');

    if (!USE_AI_FOR_PROMPTS) {
      return this.mockRecommendTags();
    }

    try {
      const tagLibrary = AI_PROMPTS.tagRecommendation.tagLibrary;
      const systemPrompt = AI_PROMPTS.tagRecommendation.systemPrompt;
      
      const userPrompt = `Tag Library: ${JSON.stringify(tagLibrary)}

Please analyze this image and recommend 7 tags. Output a JSON object with image_analysis and recommended_tags.`;

      const fullPrompt = systemPrompt + '\n\n' + userPrompt;
      
      const result = await callGeminiAPI(fullPrompt, imageBase64);

      if (result.success) {
        try {
          // 清理响应，提取 JSON
          let jsonText = result.text.trim();
          if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          }
          
          // 尝试找到 JSON 对象
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }
          
          const response = JSON.parse(jsonText);
          
          // 🎯 在控制台美化输出分析结果
          console.log(LOG_DIVIDER);
          console.log('👁️ STEP 2: Gemini 图片分析 & 标签推荐');
          console.log(LOG_DIVIDER);
          
          if (response.image_analysis) {
            console.log('📸 图片分析:');
            console.log('   👤 主体:', response.image_analysis.subject || '-');
            console.log('   💡 光线:', response.image_analysis.lighting || '-');
            console.log('   🌈 氛围:', response.image_analysis.mood || '-');
            console.log('   🎨 风格:', response.image_analysis.style || '-');
          }
          
          // 支持新格式（persona + relationship 分开）和旧格式（combined）
          const personaTags = response.recommended_persona_tags || response.recommended_tags || response.tags || [];
          const relationshipTag = response.recommended_relationship || null;
          
          // 合并所有标签用于向后兼容
          const allTags = relationshipTag ? [...personaTags, relationshipTag] : personaTags;
          
          console.log('');
          console.log('🎭 推荐 Persona 标签:', personaTags.join(', '));
          if (relationshipTag) {
            console.log('💕 推荐 Relationship:', relationshipTag);
          }
          console.log('⏱️ 耗时:', result.duration);
          console.log('📌 注意：AI 推荐但不自动选中，用户需手动点击');
          console.log(LOG_DIVIDER);
          
          return {
            success: true,
            tags: allTags,  // 向后兼容
            personaTags,    // 新字段
            relationshipTag, // 新字段
            imageAnalysis: response.image_analysis,
            duration: result.duration,
            method: 'gemini',
          };
        } catch (e) {
          console.error('❌ 解析标签 JSON 失败:', e, '原始响应:', result.text);
          return this.mockRecommendTags();
        }
      }

      console.warn('⚠️ Gemini 调用失败，使用本地逻辑:', result.error);
      return this.mockRecommendTags();
    } catch (error) {
      console.error('❌ 推荐标签异常:', error);
      return this.mockRecommendTags();
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. 生成图生图 Prompts（Step 3 - 根据标签动态生成 3 个风格 prompts）
  // 📝 调用 Gemini 根据用户标签生成个性化风格 prompt
  // 📝 Prompt 要求极短（5-10 词），适配 Flux 小模型两步推理
  // ═══════════════════════════════════════════════════════════════════════════
  async generateImagePrompts(imageBase64, selectedTags) {
    const { ACTIVE_VERSION } = await import('../config/image-prompt-versions.js');
    
    console.log(LOG_DIVIDER);
    console.log(`🎨 STEP 3A: 图生图 Prompt 生成`);
    console.log(`📌 方案版本: ${ACTIVE_VERSION}`);
    console.log(`🏷️ 收到用户标签 (${selectedTags?.length || 0} 个):`);
    if (selectedTags && selectedTags.length > 0) {
      selectedTags.forEach((tag, i) => console.log(`   ${i + 1}. ${tag}`));
    } else {
      console.log(`   ⚠️ 无标签！将使用默认风格`);
    }
    console.log(LOG_DIVIDER);

    // v0.6: 场景化版 - 角色身份映射 + 视角变化 + 随机构图
    if ((ACTIVE_VERSION === 'v0.5' || ACTIVE_VERSION === 'v0.6') && USE_AI_FOR_PROMPTS && selectedTags.length > 0) {
      try {
        const systemPrompt = `You are a creative director generating 3 CINEMATIC character portraits.

═══ CRITICAL: IDENTITY FIRST ═══
ALWAYS start with: "exact same person exact same face"
ALWAYS end with: "preserve facial features"

═══ YOUR MISSION ═══
Create 3 EXCITING, DIFFERENT images based on user's character tags.
NOT just style transfer - create SCENES that match the character's IDENTITY!

═══ TAG → SCENE MAPPING (BE CREATIVE!) ═══
• Prince/Royalty → throne room, castle balcony, royal garden, coronation
• Vampire → gothic castle, moonlit graveyard, candlelit chamber
• Demon → hellfire background, dark throne, volcanic lair
• Angel → clouds, golden light, heavenly gates
• Assassin → rooftop at night, shadows, rain-soaked alley
• Knight → battlefield, castle walls, training grounds
• Mage/Witch → magical library, enchanted forest, potion room
• CEO/Mafia-Boss → penthouse office, luxury car, private jet
• Cyberpunk → neon city, holographic displays, futuristic street
• Gothic → Victorian mansion, candlelight, dark roses
• Anime → cherry blossoms, school rooftop, sunset

═══ VARY THE CAMERA ANGLES ═══
Use DIFFERENT perspectives for each image:
- "low angle shot" (powerful, heroic)
- "high angle shot" (vulnerable, intimate)
- "close-up portrait" (emotional, intense)
- "profile view" (mysterious, cinematic)
- "three-quarter view" (classic, flattering)
- "dramatic side lighting" (moody, artistic)

═══ PROMPT FORMAT ═══
"exact same person exact same face, [SCENE/SETTING], [CAMERA ANGLE], [LIGHTING], preserve facial features"

═══ EXAMPLES ═══
Tags: Prince, Gothic
✅ "exact same person exact same face, dark throne room, low angle shot, dramatic candlelight, preserve facial features"
✅ "exact same person exact same face, castle balcony at night, profile view, moonlight, preserve facial features"
✅ "exact same person exact same face, royal garden, close-up portrait, golden hour, preserve facial features"

═══ OUTPUT (JSON only) ═══
{
  "prompts": ["prompt1", "prompt2", "prompt3"],
  "styleLabels": ["Scene1", "Scene2", "Scene3"]
}`;

        // 添加随机数确保每次生成不同结果
        const randomSeed = Math.floor(Math.random() * 10000);
        const angles = ['low angle shot', 'high angle shot', 'close-up portrait', 'profile view', 'three-quarter view', 'dramatic side lighting'];
        const randomAngles = angles.sort(() => Math.random() - 0.5).slice(0, 3);
        
        const userPrompt = `═══ CHARACTER TAGS ═══
${selectedTags.map((tag, i) => `${i + 1}. ${tag}`).join('\n')}

═══ CREATIVE SEED: ${randomSeed} ═══
═══ SUGGESTED ANGLES: ${randomAngles.join(', ')} ═══

🎬 Create 3 CINEMATIC scenes that bring this character to LIFE!
- Each image should tell a STORY matching their identity
- Use DIFFERENT camera angles and settings
- Make it EXCITING, not boring!
- Keep prompts SHORT (under 20 words)

Output JSON only.`;

        const result = await callGeminiAPI(systemPrompt + '\n\n' + userPrompt);

        if (result.success) {
          let jsonText = result.text.trim();
          if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          }
          
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }
          
          const response = JSON.parse(jsonText);
          const prompts = response.prompts || [];
          const styleLabels = response.styleLabels || ['Style 1', 'Style 2', 'Style 3'];

          console.log('');
          console.log('🤖 ═══ AI 生成的动态 Prompts（可复制）═══');
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
            version: 'v0.5',
            versionName: '动态标签版',
            styleLabels: styleLabels,
            duration: result.duration || '0.0s',
            method: 'ai_dynamic',
          };
        }
      } catch (error) {
        console.warn('⚠️ AI 生成失败，回退到固定版本:', error.message);
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
    console.log('🎙️ 推荐音色...', { selectedTags });

    if (!USE_AI_FOR_PROMPTS || !voiceLibrary) {
      return this.mockRecommendVoice();
    }

    try {
      const systemPrompt = AI_PROMPTS.voiceRecommendation.systemPrompt;
      
      const userPrompt = `User-Selected Tags: ${JSON.stringify(selectedTags)}

Voice Library: ${JSON.stringify(voiceLibrary)}

Please analyze this character and recommend the best matching voice. Output a JSON object with character_voice_profile, recommended_voice_id, reasoning, and alternative_voice_id.`;

      const fullPrompt = systemPrompt + '\n\n' + userPrompt;
      
      const result = await callGeminiAPI(fullPrompt, imageBase64);

      if (result.success) {
        try {
          let jsonText = result.text.trim();
          if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          }
          
          // 尝试找到 JSON 对象
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }
          
          const response = JSON.parse(jsonText);
          
          // 🎯 在控制台美化输出
          console.log(LOG_DIVIDER);
          console.log('🎙️ STEP 3B: Gemini 角色声音分析 & 音色推荐');
          console.log(LOG_DIVIDER);
          
          if (response.character_voice_profile) {
            const profile = response.character_voice_profile;
            console.log('👤 角色声音画像:');
            console.log('   性别:', profile.perceived_gender || '-');
            console.log('   年龄:', profile.perceived_age || '-');
            console.log('   语速:', profile.suggested_tempo || '-');
            console.log('   音色:', profile.suggested_timbre || '-');
            console.log('   情感:', profile.suggested_tone || '-');
          }
          
          console.log('');
          console.log('🎯 推荐音色:', response.recommended_voice_id);
          console.log('💭 推荐理由:', response.reasoning);
          
          if (response.alternative_voice_id) {
            console.log('🔄 备选音色:', response.alternative_voice_id);
          }
          
          console.log('⏱️ 耗时:', result.duration);
          console.log(LOG_DIVIDER);
          
          return {
            success: true,
            recommendation: {
              recommended_voice_id: response.recommended_voice_id,
              reasoning: response.reasoning,
              voice_profile: response.character_voice_profile,
              alternative: response.alternative_voice_id,
            },
            duration: result.duration,
            method: 'gemini',
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
    console.log('🎬 生成视频 Prompt...', { selectedTags });

    if (!USE_AI_FOR_PROMPTS) {
      return this.mockGenerateVideoPrompt();
    }

    try {
      const systemPrompt = AI_PROMPTS.videoGeneration.systemPrompt;
      const scriptLibrary = AI_PROMPTS.videoGeneration.scriptLibrary;
      
      const userPrompt = `Selected Image Description: ${imageDescription}
Selected Voice: ${JSON.stringify(voiceMetadata)}
User-Selected Tags: ${JSON.stringify(selectedTags)}
Candidate Scripts: ${JSON.stringify(scriptLibrary)}

Please analyze the character and select the best script with a detailed video prompt. Output a JSON object with character_persona, selected_script_id, script_text, video_model_prompt, motion_details, and reasoning.`;

      const fullPrompt = systemPrompt + '\n\n' + userPrompt;
      
      const result = await callGeminiAPI(fullPrompt, null); // 视频 prompt 不需要图片

      if (result.success) {
        try {
          let jsonText = result.text.trim();
          if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          }
          
          // 尝试找到 JSON 对象
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }
          
          const response = JSON.parse(jsonText);
          
          // 🎯 在控制台美化输出
          console.log(LOG_DIVIDER);
          console.log('🎬 STEP 4: Gemini 角色性格分析 & 视频 Prompt 生成');
          console.log(LOG_DIVIDER);
          
          if (response.character_persona) {
            const persona = response.character_persona;
            console.log('👤 角色性格分析:');
            console.log('   性格:', persona.personality || '-');
            console.log('   能量:', persona.energy_level || '-');
            console.log('   风格:', persona.communication_style || '-');
          }
          
          if (response.suggested_name) {
            console.log('');
            console.log('🏷️ 推荐角色名称:', response.suggested_name);
          }
          
          console.log('');
          console.log('📝 选择脚本:', response.selected_script_id);
          console.log('💬 台词:', response.script_text);
          console.log('');
          console.log('🎥 视频生成指令:');
          console.log('   ', response.video_model_prompt);
          
          if (response.motion_details) {
            console.log('');
            console.log('🎭 动作细节:');
            console.log('   开场:', response.motion_details.opening || '-');
            console.log('   说话时:', response.motion_details.during_speech || '-');
            console.log('   结束:', response.motion_details.closing || '-');
          }
          
          console.log('');
          console.log('💭 选择理由:', response.reasoning);
          console.log('⏱️ 耗时:', result.duration);
          console.log(LOG_DIVIDER);
          
          return {
            success: true,
            videoData: {
              selected_script_id: response.selected_script_id,
              script_text: response.script_text,
              video_model_prompt: response.video_model_prompt,
              motion_details: response.motion_details,
              character_persona: response.character_persona,
              suggested_name: response.suggested_name,
              reasoning: response.reasoning,
            },
            duration: result.duration,
            method: 'gemini',
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
        selected_script_id: 'intro_1',
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
  console.log(enabled ? '✅ 启用 Gemini AI 生成' : '⚠️ 切换到本地模板模式');
}
