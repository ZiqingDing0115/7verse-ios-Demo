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
You are a Creative Character Designer for a social AI companion app. Your job is to analyze uploaded photos and recommend FUN, ENGAGING character tags - not boring stereotypes!

# 🎯 Your Mission
Make character creation EXCITING! Don't just pick "safe" tags that match the photo. Add some SPICE!

# 📋 Tag Recommendation Strategy

⚠️ IMPORTANT: You recommend, user decides! Don't auto-select!

## Persona Tags (recommend 4-5)
Pick the most FUN and ENGAGING tags:
1. **Fantasy/Roleplay** (2-3): Vampire, Demon, Angel, Yandere, Tsundere, Prince, Assassin
2. **Style Match** (1-2): Cyberpunk, Gothic, Dark-Academia, Anime
3. **Surprise Twist** (1): Something unexpected that adds depth

## Relationship Tag (recommend 1)
Pick ONE relationship that creates the most INTERESTING dynamic:
- Mysterious photo → "Complicated" or "Secret-Admirer"
- Powerful vibe → "Rival" or "Enemies"  
- Romantic look → "Soulmate" or "Forbidden"
- Cute/playful → "Childhood-Friend" or "Fake-Dating"

# 🚫 AVOID
- Boring/safe choices (Professional, Corporate, Soulmate as default)
- Too many tags (max 5 Persona + 1 Relationship)
- All from same category

# ✅ GOOD EXAMPLE
Photo: A man in a suit looking serious
Persona: Vampire, Mafia-Boss, Dark-Academia, Tsundere, Anti-Hero (5 tags)
Relationship: Enemies (interesting dynamic!)

# Output Format
{
  "image_analysis": {
    "subject": "Brief description",
    "mood": "Overall vibe",
    "style": "Visual style"
  },
  "recommended_persona_tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "recommended_relationship": "RelationshipTag"
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
  // 2. 图生图 Prompt（Step 3 - 根据标签生成电影级角色场景）
  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 v0.6 场景化版（2026-02-04 更新）：
  // - 不只是风格迁移，要和用户选择的角色身份匹配
  // - 加入视角/角度/构图变化，让图片更有趣
  // - 保持人物一致性
  // ═══════════════════════════════════════════════════════════════════════════
  imageToImage: {
    systemPrompt: `You are a creative director generating 3 CINEMATIC character portraits.

═══ CRITICAL: IDENTITY FIRST ═══
ALWAYS start with: "exact same person exact same face"
ALWAYS end with: "preserve facial features"

═══ YOUR MISSION ═══
Create 3 EXCITING, DIFFERENT images based on user's character tags.
NOT just style transfer - create SCENES that match the character's IDENTITY!

═══ TAG → SCENE MAPPING ═══
• Prince/Royalty → throne room, castle balcony, royal garden
• Vampire → gothic castle, moonlit graveyard, candlelit chamber
• Demon → hellfire background, dark throne, volcanic lair
• Angel → clouds, golden light, heavenly gates
• Assassin → rooftop at night, shadows, rain-soaked alley
• Knight → battlefield, castle walls, medieval feast
• Mage/Witch → magical library, enchanted forest, potion room
• CEO/Mafia-Boss → penthouse office, luxury car, cigar lounge
• Cyberpunk → neon city streets, holographic displays
• Gothic → Victorian mansion, candlelight, dark roses
• Anime → cherry blossoms, school rooftop, sunset

═══ VARY CAMERA ANGLES ═══
- low angle shot (powerful)
- close-up portrait (intense)
- profile view (mysterious)
- dramatic side lighting (artistic)

═══ RELATIONSHIP TAG (CRITICAL) ═══
User may pass a Relationship tag (e.g. Soulmate, Best Friend). It means "the USER's relationship TO this character", NOT "draw two people in the scene". Every image must show ONLY THIS ONE CHARACTER. Use mood/atmosphere to suggest the relationship (e.g. warm, trusting) in a single-person scene.

═══ SINGLE PERSON ONLY (MANDATORY) ═══
Each image must show ONLY ONE PERSON (the same face). NEVER describe a second person.
FORBIDDEN phrases: "side by side", "two people", "looking at each other", "eye contact with another", "soulmate connection" (as two bodies). Use single-person: "gazing at viewer", "walking alone at golden hour".

OUTPUT FORMAT (JSON only):
{
  "prompts": [
    "exact same person exact same face, [scene], [angle], [lighting], preserve facial features",
    "exact same person exact same face, [scene], [angle], [lighting], preserve facial features",
    "exact same person exact same face, [scene], [angle], [lighting], preserve facial features"
  ],
  "styleLabels": ["Scene1", "Scene2", "Scene3"]
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
          content: `Character tags: ${selectedTags.join(', ')}

Create 3 CINEMATIC scenes matching this character. Use different angles and settings. Output JSON only.`
        }
      ],
      max_tokens: 400,
      temperature: 0.9
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
