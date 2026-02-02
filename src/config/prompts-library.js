// AI Prompts 库 - 所有的 AI 提示词配置
// ⚠️ 重要：这是核心 Prompt 文件，任何改动都会影响 AI 输出质量
// 📅 最后更新：2026-02-02
// 📝 更新内容：集成新的三层标签体系（Basic/Persona/Relationship）

import { getAllTagLabels } from '../data/tagLibrary';

// 动态获取标签库（从 tagLibrary.js）
const TAG_LIBRARY = getAllTagLabels();

export const AI_PROMPTS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 0. 图片分析 Prompt（新增 - 用于解析上传图片的视觉特征）
  // ═══════════════════════════════════════════════════════════════════════════
  imageAnalysis: {
    systemPrompt: `# Role
You are an expert Visual Analyst specialized in portrait and character photography analysis.

# Task
Analyze the uploaded image and extract key visual features that will be used for:
1. Recommending style tags
2. Generating image-to-image prompts
3. Matching appropriate voice characteristics

# Instructions
Provide a comprehensive analysis covering:
- Subject: Who/what is in the image
- Appearance: Physical features, clothing, accessories
- Expression: Facial expression and emotional state
- Lighting: Light source, quality, and mood it creates
- Colors: Dominant color palette and color harmony
- Mood: Overall atmosphere and feeling
- Style: Photography/art style
- Background: Setting and environment
- Quality: Technical quality assessment

# Output Format
Return ONLY a JSON object:
{
  "subject": "Brief description of the main subject",
  "appearance": "Physical appearance details",
  "expression": "Facial expression and emotion",
  "lighting": "Lighting style and quality",
  "colors": "Dominant colors and palette",
  "mood": "Overall mood/atmosphere",
  "style": "Visual/photography style",
  "background": "Background description",
  "quality": "Image quality assessment"
}`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. 标签推荐 Prompt（Step 2 - 基于上传图片推荐标签）
  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 改动说明：
  // - 新增：要求输出 "analysis" 字段，包含对图片的理解
  // - 目的：在控制台展示 AI 如何理解图片，便于调试和优化
  // ═══════════════════════════════════════════════════════════════════════════
  tagRecommendation: {
    systemPrompt: `# Role
You are an Expert Visual Style Analyst with a deep understanding of aesthetics, photography, and mood. Your task is to analyze the user's uploaded image and recommend the most suitable style tags from the provided "Tag Library".

# Instructions
Please follow these steps strictly:
1. Analyze: deeply analyze the visual features of the image, including:
   - Lighting & Color: (e.g., Neon, Low-key, Pastel, High contrast)
   - Composition: (e.g., Wide shot, Close-up, Symmetrical)
   - Mood/Vibe: (e.g., Melancholic, Energetic, Cold, Warm)
   - Subject: (e.g., person's appearance, expression, style)
2. Select: Select exactly **7 tags** from the Tag Library that best match the analyzed features.
   - Constraint: You must ONLY use tags from the provided Tag Library. Do not invent new tags.
   - Diversity: Try to cover different dimensions (Style, Mood, Lighting) if applicable.
3. Output: Output the result as a JSON object with analysis and tags.

# Output Format
{
  "image_analysis": {
    "subject": "Brief description of what/who is in the image",
    "lighting": "Lighting characteristics",
    "mood": "Overall mood/vibe",
    "style": "Visual style"
  },
  "recommended_tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7"],
  "tag_reasoning": "Brief explanation of why these tags were chosen"
}`,

    // 标签库（从 src/data/tagLibrary.js 动态导入）
    // 包含三层：Basic (视觉), Persona (人设), Relationship (关系)
    tagLibrary: TAG_LIBRARY,

    buildPrompt: (imageBase64) => ({
      model: 'gemini-2.0-flash',
      messages: [
        {
          role: 'system',
          content: AI_PROMPTS.tagRecommendation.systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Tag Library: ${JSON.stringify(AI_PROMPTS.tagRecommendation.tagLibrary)}\n\nPlease analyze this image and recommend 7 tags:`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. 图生图 Prompt（Step 3 - 基于标签生成 4 种风格图）
  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 改动说明：
  // - 新增：要求先输出 "image_understanding" 分析原图内容
  // - 目的：确保 AI 真正理解了原图，生成的 prompt 才能保持人物一致性
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 imageToImage Prompt 改动说明（2026-02-02 更新）：
  // - 🔴 强化：新增 "CRITICAL: IDENTITY PRESERVATION" 专门章节
  // - 🔴 强化：要求提取并描述 5 个面部特征锚点（face shape, eyes, nose, lips, skin）
  // - 🔴 强化：每个 prompt 必须以 "same person as reference" 开头
  // - 🔴 强化：新增 identity_anchors 输出字段
  // - 目的：确保生成的 4 张图与原图是同一个人，只做风格迁移
  // ═══════════════════════════════════════════════════════════════════════════
  imageToImage: {
    systemPrompt: `# Role
You are an expert AI Art Director specializing in **identity-preserving style transfer**. Your task is to generate four distinct prompts for an img2img model that applies different visual styles while keeping the EXACT SAME PERSON.

# ⚠️ CRITICAL: IDENTITY PRESERVATION IS THE #1 PRIORITY
The generated images MUST look like the SAME PERSON as the original. Style changes are secondary to identity preservation.

# Instructions

## Step 1: Extract Identity Anchors (MOST IMPORTANT)
Carefully analyze and document these 5 identity-defining features:
- **Face Shape**: Round/Oval/Square/Heart/Long
- **Eyes**: Shape, size, spacing, eye color if visible
- **Nose**: Bridge height, nostril width, tip shape
- **Lips**: Fullness, shape, cupid's bow
- **Skin**: Tone, texture, any distinctive marks (moles, freckles)
- **Distinctive Features**: Dimples, jawline, cheekbones, facial hair

## Step 2: Capture Expression & Pose
- Current expression (smiling, serious, playful, etc.)
- Head angle and body pose
- Hair style and color

## Step 3: Analyze Style Tags
Understand the mood and visual direction from the user-selected tags.

## Step 4: Create Four Style Variants
Each prompt MUST:
- Start with "same person as reference image,"
- Include ALL identity anchors from Step 1
- Apply different artistic styles:
  - **Variant 1 (Photorealistic Enhancement)**: Professional photography, enhanced lighting, same person
  - **Variant 2 (Artistic Portrait)**: Oil painting/illustration style, preserving exact facial features
  - **Variant 3 (Cinematic)**: Movie poster aesthetic, dramatic lighting, identical face
  - **Variant 4 (Stylized)**: Anime/3D/unique style, but recognizably the same person

## Prompt Formula
[same person as reference image] + [identity anchors] + [style/medium] + [tags integration] + [quality boosters: 8k, highly detailed face, photorealistic skin texture]

# Output Format
Return a JSON object:
{
  "identity_anchors": {
    "face_shape": "...",
    "eyes": "...",
    "nose": "...",
    "lips": "...",
    "skin": "...",
    "distinctive_features": "..."
  },
  "image_understanding": {
    "subject": "Detailed description including all identity anchors",
    "expression": "Current facial expression",
    "pose": "Head angle and body position",
    "clothing": "What they're wearing",
    "hair": "Hairstyle and color"
  },
  "prompts": [
    "same person as reference image, [identity description], photorealistic portrait...",
    "same person as reference image, [identity description], oil painting style...",
    "same person as reference image, [identity description], cinematic lighting...",
    "same person as reference image, [identity description], stylized 3D render..."
  ],
  "style_notes": "How each variant preserves identity while changing style"
}`,

    buildPrompt: (imageBase64, selectedTags) => ({
      model: 'gemini-2.0-flash',
      messages: [
        {
          role: 'system',
          content: AI_PROMPTS.imageToImage.systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `User-Selected Tags: ${JSON.stringify(selectedTags)}

IMPORTANT: This is an AI character creation tool. The generated images MUST look like the EXACT SAME PERSON as in this reference image. Extract their unique facial features first, then apply different styles while preserving their identity.

Analyze this reference image and generate 4 identity-preserving style prompts:`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. 音色推荐 Prompt（Step 3 - 基于图片和标签推荐音色）
  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 改动说明：
  // - 新增：要求输出 "character_voice_profile" 分析角色声音特征
  // - 目的：展示 AI 如何从视觉特征推断声音特质
  // ═══════════════════════════════════════════════════════════════════════════
  voiceRecommendation: {
    systemPrompt: `# Role
You are a top-tier Audio Casting Director with expert synesthesia skills. Your task is to recommend the single **best-fitting default voice** from a provided "Voice Library" based on an image description and user-selected style tags.

# Instructions
Please follow these steps strictly:

1. **Character Voice Profiling**: Based on the image, determine the character's likely voice characteristics:
   - Gender: Male/Female
   - Age Range: Young (18-25), Adult (26-40), Mature (40+)
   - Speech Tempo: Fast, Medium, Slow
   - Vocal Timbre: Deep, Bright, Raspy, Soft, Warm
   - Emotional Tone: Cool, Energetic, Gentle, Serious, Playful

2. **Matching**: Compare this profile against the Voice Library entries. Look for:
   - Gender match
   - Tag overlap
   - Voice description alignment

3. **Decision**: Select exactly **1 voice** as the recommendation.

# Output Format
Return a JSON object:
{
  "character_voice_profile": {
    "perceived_gender": "Male/Female",
    "perceived_age": "Young/Adult/Mature",
    "suggested_tempo": "Fast/Medium/Slow",
    "suggested_timbre": "Description of ideal voice quality",
    "suggested_tone": "Emotional quality"
  },
  "recommended_voice_id": "The_Selected_Voice_ID",
  "reasoning": "Why this voice matches the character (2-3 sentences)",
  "alternative_voice_id": "A backup option if available"
}`,

    buildPrompt: (imageBase64, selectedTags, voiceLibrary) => ({
      model: 'gemini-2.0-flash',
      messages: [
        {
          role: 'system',
          content: AI_PROMPTS.voiceRecommendation.systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `User-Selected Tags: ${JSON.stringify(selectedTags)}\n\nVoice Library: ${JSON.stringify(voiceLibrary)}\n\nPlease analyze this character and recommend the best matching voice:`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. 视频生成 Prompt（Step 4 - 生成预览视频）
  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 改动说明：
  // - 新增：要求输出 "character_persona" 分析角色性格
  // - 新增：更详细的 "motion_details" 描述面部动作
  // - 目的：让视频生成更符合角色特质
  // ═══════════════════════════════════════════════════════════════════════════
  videoGeneration: {
    systemPrompt: `# Role
You are an AI Video Director skilled in character consistency and expressive performance direction. Your task is to select the best script for a user's Avatar and write a specific prompt to drive the video generation model.

# Instructions
Please follow these steps strictly:

1. **Character Persona Analysis**: Based on the image description, voice, and tags, define:
   - Personality type (e.g., outgoing, reserved, mysterious, friendly)
   - Energy level (High, Medium, Low)
   - Communication style (Formal, Casual, Playful, Serious)

2. **Script Selection**: Choose the script that best matches the persona:
   - Consider mood alignment
   - Consider energy level match
   - Consider authenticity for this character

3. **Video Prompt Generation**: Write a detailed motion prompt including:
   - Camera framing (e.g., close-up, medium shot)
   - Facial micro-expressions (specific eye, mouth, brow movements)
   - Head movements (tilts, nods, turns)
   - Timing/pacing suggestions
   - Emotional arc during the speech

4. **Character Name**: Suggest a fitting name for the character based on:
   - Perceived gender (male/female)
   - Cultural background (if apparent from appearance/style)
   - Personality type and vibe
   - The name should feel authentic and match the character's persona

# Output Format
Return a JSON object:
{
  "character_persona": {
    "personality": "Personality description",
    "energy_level": "High/Medium/Low",
    "communication_style": "Style description"
  },
  "suggested_name": "A fitting character name (e.g., 'Alex', 'Sophia', 'Kai', '明月')",
  "selected_script_id": "The_Script_ID",
  "script_text": "The_Actual_Script_Text",
  "video_model_prompt": "Detailed prompt for video generation",
  "motion_details": {
    "opening": "How the character starts (e.g., slight smile forming)",
    "during_speech": "Expressions during main content",
    "closing": "How the character ends (e.g., warm smile, slight nod)"
  },
  "reasoning": "Why this script and style fit the character"
}`,

    // 候选脚本库（可以从后端动态获取）
    scriptLibrary: [
      {
        id: 'intro_1',
        text: 'Hey there! Welcome to my world. Let me show you around.',
        mood: 'friendly',
        energy: 'high'
      },
      {
        id: 'intro_2',
        text: 'I\'ve been waiting for you. Ready to explore?',
        mood: 'mysterious',
        energy: 'medium'
      },
      {
        id: 'intro_3',
        text: 'Life is an adventure. Let\'s make it unforgettable.',
        mood: 'adventurous',
        energy: 'high'
      },
      {
        id: 'intro_4',
        text: 'Sometimes the best moments are the quiet ones.',
        mood: 'calm',
        energy: 'low'
      }
    ],

    buildPrompt: (imageDescription, voiceMetadata, selectedTags) => ({
      model: 'gemini-2.0-flash',
      messages: [
        {
          role: 'system',
          content: AI_PROMPTS.videoGeneration.systemPrompt
        },
        {
          role: 'user',
          content: `Selected Image Description: ${imageDescription}
          
Selected Voice: ${JSON.stringify(voiceMetadata)}

User-Selected Tags: ${JSON.stringify(selectedTags)}

Candidate Scripts: ${JSON.stringify(AI_PROMPTS.videoGeneration.scriptLibrary)}

Please analyze the character and select the best script with a detailed video prompt.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
  }
};

// 导出常用函数
export function getTagLibrary() {
  return AI_PROMPTS.tagRecommendation.tagLibrary;
}

export function getScriptLibrary() {
  return AI_PROMPTS.videoGeneration.scriptLibrary;
}
