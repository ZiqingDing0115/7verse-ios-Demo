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

Please analyze this image and recommend 7 tags. Output a JSON object with image_analysis, recommended_tags, and tag_reasoning.`;

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
          
          const tags = response.recommended_tags || response.tags || [];
          console.log('');
          console.log('🏷️ 推荐标签:', tags.join(', '));
          
          if (response.tag_reasoning) {
            console.log('💭 推荐理由:', response.tag_reasoning);
          }
          
          console.log('⏱️ 耗时:', result.duration);
          console.log(LOG_DIVIDER);
          
          return {
            success: true,
            tags,
            imageAnalysis: response.image_analysis,
            reasoning: response.tag_reasoning,
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
  // 2. 生成图生图 Prompts（Step 3 - 生成 4 个风格化 prompts）
  // ═══════════════════════════════════════════════════════════════════════════
  async generateImagePrompts(imageBase64, selectedTags) {
    console.log('🎨 生成图生图 Prompts（身份保持优先）...', { selectedTags });

    if (!USE_AI_FOR_PROMPTS) {
      return this.generatePromptsLocally(selectedTags);
    }

    try {
      const systemPrompt = AI_PROMPTS.imageToImage.systemPrompt;
      
      // 🔴 更新：强调身份保持的重要性
      const userPrompt = `User-Selected Tags: ${JSON.stringify(selectedTags)}

IMPORTANT: This is an AI character creation tool. The generated images MUST look like the EXACT SAME PERSON as in this reference image. Extract their unique facial features first, then apply different styles while preserving their identity.

Analyze this reference image and generate 4 identity-preserving style prompts. Output JSON with identity_anchors, image_understanding, prompts array, and style_notes.`;

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
          console.log('🖼️ STEP 3A: Gemini 图片理解 & 身份保持 Prompts');
          console.log(LOG_DIVIDER);
          
          // 🔴 新增：显示身份锚点
          if (response.identity_anchors) {
            console.log('🔒 身份锚点（Identity Anchors）:');
            console.log('   👤 脸型:', response.identity_anchors.face_shape || '-');
            console.log('   👁️ 眼睛:', response.identity_anchors.eyes || '-');
            console.log('   👃 鼻子:', response.identity_anchors.nose || '-');
            console.log('   👄 嘴唇:', response.identity_anchors.lips || '-');
            console.log('   🎨 肤色:', response.identity_anchors.skin || '-');
            console.log('   ✨ 特征:', response.identity_anchors.distinctive_features || '-');
            console.log('');
          }
          
          if (response.image_understanding) {
            console.log('📸 原图理解:');
            console.log('   👤 主体:', response.image_understanding.subject || '-');
            console.log('   😊 表情:', response.image_understanding.expression || '-');
            console.log('   💇 发型:', response.image_understanding.hair || '-');
            console.log('   👔 服装:', response.image_understanding.clothing || '-');
            console.log('   🧍 姿势:', response.image_understanding.pose || '-');
          }
          
          const prompts = response.prompts || [];
          console.log('');
          console.log('✨ 生成的 4 个身份保持 Prompts:');
          prompts.forEach((p, i) => {
            const labels = ['写实增强', '艺术肖像', '电影风格', '风格化'];
            console.log(`   ${i + 1}. [${labels[i] || '风格' + (i+1)}]`);
            console.log(`      ${p.substring(0, 120)}...`);
          });
          
          if (response.style_notes) {
            console.log('');
            console.log('💭 风格说明:', response.style_notes);
          }
          
          console.log('⏱️ 耗时:', result.duration);
          console.log(LOG_DIVIDER);
          
          if (Array.isArray(prompts) && prompts.length >= 4) {
            return {
              success: true,
              prompts: prompts.slice(0, 4),
              identityAnchors: response.identity_anchors,
              imageUnderstanding: response.image_understanding,
              styleNotes: response.style_notes,
              duration: result.duration,
              method: 'gemini',
            };
          } else {
            throw new Error('Gemini 返回的 prompts 数量不足');
          }
        } catch (e) {
          console.error('❌ 解析 Prompts JSON 失败:', e, '原始响应:', result.text);
          return this.generatePromptsLocally(selectedTags);
        }
      }

      console.warn('⚠️ Gemini 调用失败，使用本地逻辑:', result.error);
      return this.generatePromptsLocally(selectedTags);
    } catch (error) {
      console.error('❌ 生成 Prompts 异常:', error);
      return this.generatePromptsLocally(selectedTags);
    }
  },

  // 本地生成 Prompts（备用方案，不需要 AI）
  generatePromptsLocally(selectedTags) {
    console.log('🔧 使用本地逻辑生成 Prompts（备用方案）');
    
    const tagsText = selectedTags.join(', ');
    
    const prompts = [
      `A photorealistic portrait with ${tagsText} style, professional photography, natural lighting, highly detailed, 8k resolution, sharp focus, masterpiece quality`,
      `An artistic illustration with ${tagsText} aesthetic, painted style, vibrant colors, expressive brushstrokes, creative composition, trending on artstation`,
      `A cinematic shot with ${tagsText} atmosphere, dramatic lighting, shallow depth of field, film grain, moody color grading, professional cinematography`,
      `A stylized digital art with ${tagsText} vibe, creative interpretation, unique artistic style, bold colors, award-winning design, highly creative`,
    ];

    return {
      success: true,
      prompts,
      duration: '0.0s',
      method: 'local_template',
      message: '使用本地模板生成（备用方案）',
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
    
    const defaultTags = ['Professional', 'Creative', 'Warm', 'Modern', 'Friendly', 'Cinematic', 'Natural'];
    
    return {
      success: true,
      tags: defaultTags,
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
