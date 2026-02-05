# 🧠 AI Prompts 使用指南

> 📅 最后更新：2026-02-04 23:45:00  
> 🏷️ 当前版本：**v0.4.0**  
> 📁 代码文件：`src/config/prompts-library.js`  
> 👤 适用人群：产品经理、设计师、开发者

## 📌 版本管理规范

| 版本格式 | 说明 | 示例 |
|---------|------|------|
| `0.x.0` | 大改动（新增模块、重构 Prompt） | v0.2.0 |
| `0.1.x` | 小改动（调整措辞、修复问题） | v0.1.1 |

## 📋 更新日志

| 版本 | 时间 | 改动内容 |
|-----|------|---------|
| v0.4.1 | 2026-02-05 00:15 | 🎲 **标签推荐去刻板印象**：不再只推荐"最合适"的标签，增加反差/爆款/好玩标签（如正经人配 Vampire/Yandere） |
| v0.4.0 | 2026-02-04 23:45 | 🎬 **场景化版 v0.6**：图生图不再是简单风格迁移，改为「角色身份→场景映射」+ 视角/角度随机变化；新增 Prompt Arena & Model Arena 测试工具 |
| v0.3.1 | 2026-02-04 22:30 | 🔒 **强化身份保持**：精简 Prompt 至 15 词以内；强化身份词 `exact same person exact same face`；身份词放开头+结尾；禁止服装/场景细节 |
| v0.3.0 | 2026-02-04 22:05 | 🎯 **最佳实践固化**：固定 Prompt 开头 `same person, same face, same identity` + 结尾 `clean background, no text, no watermark`；细化标签传参（逐个列出而非大类归纳） |
| v0.2.2 | 2026-02-04 21:55 | 🎨 **风格去重**：新增 5 大艺术类别（绘画/数字艺术/摄影/插画/风格化），强制要求 3 个风格来自不同类别，避免重复 |
| v0.2.1 | 2026-02-04 21:35 | 🔥 **风格强化**：Prompt 改为「大胆艺术风格」，去掉 beautiful/attractive 等弱化词，强调视觉冲击力 |
| v0.2.0 | 2026-02-04 21:15 | 🎨 **重大更新**：图生图 Prompt 增加「标签→风格映射规则」，让 AI 根据用户选择的标签类型生成对应风格 |
| v0.1.5 | 2026-02-04 19:50 | 图生图 Prompt 优化：强调美化、禁止文字/水印/杂乱背景 |
| v0.1.4 | 2026-02-04 19:35 | 图生图 Prompt 强化身份保持：每个 prompt 必须以 "same person, same face," 开头 |
| v0.1.3 | 2026-02-04 19:20 | 图生图改为 v0.5 动态标签版，AI 根据用户标签生成 Prompt |
| v0.1.0 | 2026-02-04 18:35 | 初版文档，4 个核心 Prompt 模块 |

本文档详细说明 AI Character Builder 中使用的 4 个核心 Prompt 模块。

---

## 📋 目录

| 序号 | 模块名称 | 用途 | 所在步骤 |
|:---:|---------|------|:-------:|
| 1 | [标签推荐](#1-标签推荐-tag-recommendation) | 根据上传图片推荐标签 | Step 2 |
| 2 | [音色推荐](#2-音色推荐-voice-recommendation) | 根据角色特征推荐音色 | Step 3 |
| 3 | [图生图](#3-图生图-image-to-image) | 生成风格迁移图片 | Step 3 |
| 4 | [视频生成](#4-视频生成-video-generation) | 生成角色预览视频 | Step 4 |
| 💡 | [工作经验 & 最佳实践](#-工作经验--最佳实践) | 迭代中发现的问题和解决方案 | - |

---

## 1. 标签推荐 (Tag Recommendation)

### 📍 使用场景
用户上传图片后，AI 自动分析图片并推荐 7 个最匹配的标签。

### 🎯 System Prompt

```
# Role
You are an Expert Visual Style Analyst with a deep understanding of aesthetics, 
photography, and mood. Your task is to analyze the user's uploaded image and 
recommend the most suitable style tags from the provided "Tag Library".

# Instructions
Please follow these steps strictly:
1. Analyze: deeply analyze the visual features of the image, including:
   - Lighting & Color: (e.g., Neon, Low-key, Pastel, High contrast)
   - Composition: (e.g., Wide shot, Close-up, Symmetrical)
   - Mood/Vibe: (e.g., Melancholic, Energetic, Cold, Warm)
   - Subject: (e.g., person's appearance, expression, style)
2. Select: Select exactly **7 tags** from the Tag Library that best match.
   - Constraint: You must ONLY use tags from the provided Tag Library.
   - Diversity: Try to cover different dimensions (Style, Mood, Lighting).
3. Output: Output the result as a JSON object with analysis and tags.

# Output Format
{
  "image_analysis": {
    "subject": "Brief description of what/who is in the image",
    "lighting": "Lighting characteristics",
    "mood": "Overall mood/vibe",
    "style": "Visual style"
  },
  "recommended_tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7"]
}
```

<details>
<summary>📖 中文翻译</summary>

```
# 角色
你是一位专业的视觉风格分析师，对美学、摄影和情绪有深刻理解。
你的任务是分析用户上传的图片，并从提供的"标签库"中推荐最合适的风格标签。

# 指令
请严格按照以下步骤执行：
1. 分析：深入分析图片的视觉特征，包括：
   - 光线与色彩：（如霓虹、低调、柔和、高对比度）
   - 构图：（如远景、特写、对称）
   - 情绪/氛围：（如忧郁、活力、冷淡、温暖）
   - 主体：（如人物外貌、表情、风格）
2. 选择：从标签库中精确选择 **7 个** 最匹配的标签。
   - 约束：只能使用标签库中的标签，不能自创。
   - 多样性：尽量覆盖不同维度（风格、情绪、光线）。
3. 输出：以 JSON 格式输出分析结果和标签。

# 输出格式
{
  "image_analysis": {
    "subject": "图片主体简述",
    "lighting": "光线特征",
    "mood": "整体情绪/氛围",
    "style": "视觉风格"
  },
  "recommended_tags": ["标签1", "标签2", "标签3", "标签4", "标签5", "标签6", "标签7"]
}
```

</details>

### 📥 输入
| 参数 | 类型 | 说明 |
|-----|------|------|
| imageBase64 | string | 用户上传的图片（Base64 格式） |
| tagLibrary | array | 标签库（约 75 个标签） |

### 📤 输出
| 字段 | 说明 |
|-----|------|
| `image_analysis` | AI 对图片的理解分析 |
| `recommended_tags` | 推荐的 7 个标签 |

---

## 2. 音色推荐 (Voice Recommendation)

### 📍 使用场景
根据用户选择的标签和图片特征，推荐最匹配的 ElevenLabs 音色。

### 🎯 System Prompt

```
# Role
You are a top-tier Audio Casting Director with expert synesthesia skills. 
Your task is to recommend the single **best-fitting default voice** from a 
provided "Voice Library" based on an image description and user-selected style tags.

# Instructions
Please follow these steps strictly:

1. **Character Voice Profiling**: Based on the image, determine the character's 
   likely voice characteristics:
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
}
```

<details>
<summary>📖 中文翻译</summary>

```
# 角色
你是一位顶级音频选角导演，具备专业的联觉能力。
你的任务是根据图片描述和用户选择的风格标签，从"音色库"中推荐 **最匹配的音色**。

# 指令
请严格按照以下步骤执行：

1. **角色声音画像**：根据图片，判断角色可能的声音特征：
   - 性别：男性/女性
   - 年龄段：年轻 (18-25)、成年 (26-40)、成熟 (40+)
   - 语速：快/中/慢
   - 音色：低沉、明亮、沙哑、柔和、温暖
   - 情感基调：冷静、活力、温柔、严肃、俏皮

2. **匹配**：将画像与音色库进行对比，关注：
   - 性别匹配
   - 标签重叠度
   - 声音描述契合度

3. **决策**：精确选择 **1 个** 音色作为推荐。

# 输出格式
{
  "character_voice_profile": {
    "perceived_gender": "男性/女性",
    "perceived_age": "年轻/成年/成熟",
    "suggested_tempo": "快/中/慢",
    "suggested_timbre": "理想声音特质描述",
    "suggested_tone": "情感特质"
  },
  "recommended_voice_id": "推荐的音色ID",
  "reasoning": "为什么这个音色匹配（2-3句话）",
  "alternative_voice_id": "备选音色ID"
}
```

</details>

### 📥 输入
| 参数 | 类型 | 说明 |
|-----|------|------|
| imageBase64 | string | 用户上传的图片 |
| selectedTags | array | 用户选择的标签 |
| voiceLibrary | array | 音色库（9 个 ElevenLabs 官方音色） |

### 📤 输出
| 字段 | 说明 |
|-----|------|
| `character_voice_profile` | AI 推断的角色声音特征 |
| `recommended_voice_id` | 推荐的音色 ID |
| `reasoning` | 推荐理由 |
| `alternative_voice_id` | 备选音色 |

---

## 3. 图生图 (Image-to-Image)

### 📍 使用场景
基于用户上传的原图和选择的标签，AI 动态生成 3 种个性化风格的迁移图片。

### 🎯 System Prompt（v0.5 动态标签版 - 强风格化）

```
You are a BOLD artistic director. Generate 3 DRAMATICALLY DIFFERENT style transformation prompts.

USER'S PERSONA TAGS: These tags describe the character's personality and vibe. Use them to choose fitting artistic styles.

TAG → STYLE MAPPING (choose styles that match the persona):
- Romantic/Gentle/Lover → oil painting, watercolor, soft dreamy glow, golden hour
- Bold/Confident/Fierce → cyberpunk neon, dramatic noir, high fashion editorial  
- Mysterious/Dark/Enigmatic → film noir, dark academia, gothic Renaissance
- Playful/Fun/Cute → anime style, pop art, vibrant illustration
- Elegant/Professional → Vogue cover, cinematic portrait, classic Hollywood glamour

CRITICAL: Each prompt must create a VISUALLY STRIKING transformation!

STYLE INTENSITY EXAMPLES (be this bold):
- "anime style portrait, cel shading, vibrant colors, Studio Ghibli inspired"
- "cyberpunk neon portrait, blue and pink lights, rain reflections, Blade Runner"
- "Renaissance oil painting, dramatic chiaroscuro, Caravaggio lighting"
- "Vogue magazine cover, high fashion, perfect studio lighting, editorial"
- "watercolor portrait, soft brushstrokes, dreamy pastel colors, ethereal"

RULES:
1. Generate 3 prompts with MAXIMUM visual difference
2. Each prompt: 8-12 words, focus on STYLE not beauty
3. Start each with the style name (e.g., "anime style", "oil painting", "cyberpunk")
4. End each with: "clean background"
5. NO generic words like "beautiful", "attractive" - focus on ART STYLE

OUTPUT (JSON only):
{
  "prompts": ["[bold style 1] clean background", "[bold style 2] clean background", "[bold style 3] clean background"],
  "styleLabels": ["Style Name 1", "Style Name 2", "Style Name 3"]
}
```

<details>
<summary>📖 中文翻译</summary>

```
你是一个「大胆的」艺术总监。生成 3 个「视觉差异极大」的风格转换提示词。

用户的 PERSONA 标签：这些标签描述角色的性格和氛围。用它们来选择匹配的艺术风格。

标签 → 风格映射（选择匹配人设的风格）：
- 浪漫/温柔/恋人 → 油画、水彩、柔和梦幻光晕、黄金时刻
- 大胆/自信/强势 → 赛博朋克霓虹、戏剧黑色、高级时尚大片
- 神秘/黑暗/深邃 → 黑色电影、暗黑学院风、哥特文艺复兴
- 俏皮/有趣/可爱 → 动漫风格、波普艺术、鲜艳插画
- 优雅/专业 → Vogue 封面、电影肖像、经典好莱坞魅力

关键：每个提示词必须创造「视觉冲击力强」的转换！

风格强度示例（要这么大胆）：
- "anime style portrait, cel shading, vibrant colors, Studio Ghibli inspired"
- "cyberpunk neon portrait, blue and pink lights, rain reflections, Blade Runner"
- "Renaissance oil painting, dramatic chiaroscuro, Caravaggio lighting"
- "Vogue magazine cover, high fashion, perfect studio lighting, editorial"
- "watercolor portrait, soft brushstrokes, dreamy pastel colors, ethereal"

规则：
1. 生成 3 个「视觉差异最大化」的提示词
2. 每个提示词 8-12 个词，专注于「风格」而不是「美化」
3. 每个提示词以风格名称开头（如 "anime style", "oil painting", "cyberpunk"）
4. 每个提示词以 "clean background" 结尾
5. 禁止使用 "beautiful", "attractive" 等通用词 - 专注于艺术风格

输出格式（仅 JSON）：
{
  "prompts": ["[大胆风格1] clean background", "[大胆风格2] clean background", "[大胆风格3] clean background"],
  "styleLabels": ["风格名称1", "风格名称2", "风格名称3"]
}
```

</details>

### 📥 输入
| 参数 | 类型 | 说明 |
|-----|------|------|
| selectedTags | array | 用户选择的 Persona + Relationship 标签 |

### 📤 输出
| 字段 | 说明 |
|-----|------|
| `prompts` | 3 个动态生成的风格迁移 Prompt（5-10 词） |
| `styleLabels` | 对应的风格标签名称 |

### 🎯 标签 → 风格映射示例

| 用户选择的标签 | AI 生成的 Prompts |
|--------------|------------------|
| `Bold, Confident, Rival` | `dramatic noir portrait high contrast`, `fierce warrior cinematic lighting`, `powerful editorial fashion shot` |
| `Gentle, Romantic, Lover` | `soft dreamy romantic portrait`, `warm golden hour glow`, `intimate watercolor illustration` |
| `Mysterious, Dark, Mentor` | `moody noir detective style`, `dark academia aesthetic`, `mystic sage oil painting` |

### 🔄 版本历史

| 版本 | 特点 | 状态 |
|-----|------|:----:|
| v0.5 | 动态标签版 - AI 根据标签生成 | ✅ 当前 |
| v0.4 | 固定风格版 - 3 种预设风格 | 备用 |
| v0.1 | 长 Prompt 版 | 已弃用 |

> 💡 实际生成时：原图 + 3 张风格图 = 4 张图片  
> ⚡ Prompt 长度：5-10 词，适配小模型两步推理

---

## 4. 视频生成 (Video Generation)

### 📍 使用场景
为角色生成预览视频，包括选择合适的台词、表情动作描述。

### 🎯 System Prompt

```
# Role
You are an AI Video Director skilled in character consistency and expressive 
performance direction. Your task is to select the best script for a user's 
Avatar and write a specific prompt to drive the video generation model.

# Instructions
Please follow these steps strictly:

1. **Character Persona Analysis**: Based on the image description, voice, and tags:
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

4. **Character Name**: Suggest a fitting name for the character.

# Output Format
{
  "character_persona": {
    "personality": "Personality description",
    "energy_level": "High/Medium/Low",
    "communication_style": "Style description"
  },
  "suggested_name": "A fitting character name",
  "selected_script_id": "The_Script_ID",
  "script_text": "The_Actual_Script_Text",
  "video_model_prompt": "Detailed prompt for video generation",
  "motion_details": {
    "opening": "How the character starts",
    "during_speech": "Expressions during main content",
    "closing": "How the character ends"
  },
  "reasoning": "Why this script and style fit the character"
}
```

<details>
<summary>📖 中文翻译</summary>

```
# 角色
你是一位 AI 视频导演，擅长角色一致性和表演指导。
你的任务是为用户的虚拟形象选择最佳台词，并编写驱动视频生成模型的提示词。

# 指令
请严格按照以下步骤执行：

1. **角色性格分析**：根据图片描述、音色和标签，定义：
   - 性格类型（如外向、内敛、神秘、友好）
   - 能量等级（高/中/低）
   - 沟通风格（正式、随意、俏皮、严肃）

2. **台词选择**：选择与性格最匹配的台词：
   - 考虑情绪契合度
   - 考虑能量等级匹配
   - 考虑角色真实性

3. **视频提示词生成**：编写详细的动作提示词，包括：
   - 镜头构图（如特写、中景）
   - 面部微表情（眼睛、嘴巴、眉毛的具体动作）
   - 头部动作（倾斜、点头、转动）
   - 节奏/时机建议
   - 说话过程中的情感变化

4. **角色命名**：为角色建议一个合适的名字。

# 输出格式
{
  "character_persona": {
    "personality": "性格描述",
    "energy_level": "高/中/低",
    "communication_style": "沟通风格描述"
  },
  "suggested_name": "合适的角色名字",
  "selected_script_id": "选中的台词ID",
  "script_text": "实际台词内容",
  "video_model_prompt": "详细的视频生成提示词",
  "motion_details": {
    "opening": "角色如何开始",
    "during_speech": "说话过程中的表情",
    "closing": "角色如何结束"
  },
  "reasoning": "为什么这个台词和风格适合该角色"
}
```

</details>

### 📥 输入
| 参数 | 类型 | 说明 |
|-----|------|------|
| imageDescription | string | 选中图片的描述 |
| voiceMetadata | object | 选中音色的元信息 |
| selectedTags | array | 用户选择的标签 |

### 📤 输出
| 字段 | 说明 |
|-----|------|
| `character_persona` | 角色性格分析 |
| `suggested_name` | 建议的角色名称 |
| `selected_script_id` | 选中的台词 ID |
| `script_text` | 台词内容 |
| `video_model_prompt` | 视频生成 Prompt |
| `motion_details` | 动作细节描述 |

### 📜 候选台词库

| ID | 台词 | 情绪 | 能量 |
|----|------|:----:|:----:|
| intro_1 | Hey there! Welcome to my world. Let me show you around. | friendly | high |
| intro_2 | I've been waiting for you. Ready to explore? | mysterious | medium |
| intro_3 | Life is an adventure. Let's make it unforgettable. | adventurous | high |
| intro_4 | Sometimes the best moments are the quiet ones. | calm | low |

---

## 💡 工作经验 & 最佳实践

> 📝 这部分记录了迭代过程中发现的问题和解决方案，是宝贵的工程经验沉淀。

### 🎯 图生图 Prompt 最佳实践

#### 1. 固定元素（必须包含）- v0.3.1 更新

每个图生图 Prompt 必须包含以下固定元素：

| 位置 | 固定内容 | 作用 |
|------|---------|------|
| **开头** | `exact same person exact same face,` | 强化人物 ID 保持 |
| **结尾** | `preserve facial features, clean background` | 再次强调身份 + 干净输出 |

**完整 Prompt 格式（v0.3.1）**：
```
exact same person exact same face, [风格名称] style, [2-3 个风格词], preserve facial features, clean background
```

**⚠️ 关键限制**：
- 总长度 ≤ 15 词
- 风格描述只用 2-3 个词
- **禁止**添加服装、场景、天气等细节（会干扰身份保持）

#### 2. 标签传参规则

**❌ 错误做法：大类归纳**
```
Tag category: Playful/Fun type
```
问题：AI 理解模糊，容易重复选择相似风格

**✅ 正确做法：逐个列出具体标签**
```
1. Playful
2. Sarcastic
3. Mischievous
4. Roommate
```
优点：AI 能理解每个标签的具体含义，生成更匹配的风格

#### 3. 风格多样性规则

**⚠️ 核心原则**：3 个风格必须来自不同的艺术媒介

| 艺术类别 | 风格示例 |
|---------|---------|
| 传统绘画 | oil painting, watercolor, impressionist, Renaissance |
| 数字艺术 | anime, manga, 3D render, pixel art |
| 摄影风格 | film noir, Vogue editorial, vintage film |
| 插画风格 | pop art, comic book, cartoon, vector art |
| 风格化 | cyberpunk neon, vaporwave, gothic, steampunk |

**❌ 错误示例**：
```
Style 1: anime portrait
Style 2: manga illustration  ← 与 Style 1 太相似！
Style 3: cartoon style       ← 与 Style 1&2 太相似！
```

**✅ 正确示例**：
```
Style 1: anime portrait (数字艺术)
Style 2: Renaissance oil painting (传统绘画)
Style 3: cyberpunk neon (风格化)
```

---

### 🏷️ 标签展示最佳实践

#### 1. 同页面标签互斥原则

在 Step 2 的同一页面中展示的标签应该：
- 含义尽量互斥，避免语义重叠
- 覆盖不同的人设维度

#### 2. AI 推荐标签规则

AI 推荐的 7 个标签绝对不能有风格重叠，应该：
- 覆盖不同类别（如：外向+内敛、活泼+沉稳）
- 提供用户有意义的选择差异

#### 3. Shuffle 多样性

Shuffle 时要保证：
- 不同类别的标签均匀分布
- 已选中的标签始终可见

---

### 🔬 迭代问题记录

| 问题 | 原因分析 | 解决方案 |
|------|---------|---------|
| 三张风格图太雷同 | Prompt 中使用 "beautiful" 等弱化词 | 去掉美化词，直接用风格名称开头 |
| Style 2&3 都是 Anime | AI 把同类标签映射到同一风格 | 强制要求 3 个风格来自不同艺术类别 |
| 标签传参效果差 | 把标签归纳成大类传给 AI | 改为逐个列出具体标签 |
| 人物 ID 不一致 (v0.3.0) | Prompt 缺少身份保持指令 | 固定开头加 `same person, same face, same identity` |
| **人物 ID 仍不一致 (v0.3.1)** | **Prompt 太长，风格细节过多覆盖身份词** | **① 精简至 15 词以内 ② 强化为 `exact same person exact same face` ③ 身份词放开头+结尾 ④ 禁止服装/场景细节** |
| 输出有文字/水印 | Prompt 缺少禁止指令 | 固定结尾加 `no text, no watermark` |
| 背景杂乱 | Prompt 缺少背景控制 | 固定结尾加 `clean background` |

---

### 📋 测试验证清单

每次测试时，检查以下项目：

| 检查项 | 期望结果 |
|--------|---------|
| 三张图风格是否明显不同？ | 应该能一眼区分 |
| 人物 ID 是否保持一致？ | 应该能认出是同一人 |
| 是否有文字/水印出现？ | 不应该有 |
| 背景是否干净？ | 应该干净简洁 |
| 风格是否匹配标签 vibe？ | 应该与选择的标签气质一致 |

---

## 🔧 技术细节

### 使用的 AI 模型
- **Gemini 2.0 Flash** - 所有 Prompt 推理
- **Flux** - 图生图风格迁移
- **7verse I2V** - 视频生成

### 调用方式
```javascript
import { AI_PROMPTS } from './prompts-library';

// 获取标签推荐 Prompt 配置
const tagPrompt = AI_PROMPTS.tagRecommendation.buildPrompt(imageBase64);

// 获取音色推荐 Prompt 配置
const voicePrompt = AI_PROMPTS.voiceRecommendation.buildPrompt(
  imageBase64, 
  selectedTags, 
  voiceLibrary
);
```

### 版本历史
| 版本 | 日期 | 改动 |
|-----|------|------|
| v0.4 | 2026-02-04 | 图生图改为纯风格版，Prompt 更短 |
| v0.3 | 2026-02-03 | 新增视频生成 Prompt |
| v0.2 | 2026-02-02 | 新增音色推荐模块 |
| v0.1 | 2026-02-01 | 初版标签推荐 |

---

## 🏟️ 测试 Arena

为了迭代优化 Prompt 效果，我们提供了两个本地测试工具：

### 1. Prompt Arena（图生图测试）

**访问地址**: `http://localhost:5173/prompt-arena.html`

**功能**:
- 上传测试图片
- 选择角色标签
- 同时测试 3 个不同 Prompt
- 对比生成效果和耗时
- 导出测试记录

**使用场景**:
- A/B 测试不同 Prompt 表达方式
- 验证场景化 vs 简单风格迁移的效果差异
- 调试身份保持问题

### 2. Model Arena（模型对比）

**访问地址**: `http://localhost:5173/model-arena.html`

**功能**:
- 对比 Qwen 235B vs Gemini 3 Flash
- 支持 Qwen 流式输出（可看到首 Token 时间）
- 预设 4 种任务（标签推荐/音色推荐/图生图 Prompt/视频 Prompt）
- 记录评分和 Insights
- 导出对比报告

**使用场景**:
- 选择最佳模型（速度 vs 质量权衡）
- 测试 Qwen 流式输出体验
- 沉淀模型选择最佳实践

### 📝 Insights 记录模板

```markdown
## Test #N: [日期]

### 输入
- 图片类型: [人像/全身/...]
- 标签: [tag1, tag2, ...]

### Prompt 对比
| 版本 | Prompt | 效果评分 | 备注 |
|-----|--------|---------|-----|
| A   | xxx    | 7/10    | ... |
| B   | xxx    | 8/10    | ... |

### 问题诊断
- [ ] 身份不一致
- [ ] 风格不明显
- [ ] 背景杂乱
- [ ] 出现文字/水印

### 解决方案
- 改动: xxx
- 效果: xxx

### 沉淀
> 写入 PROMPTS-GUIDE.md 最佳实践部分
```

---

## 📂 相关文件

| 文件 | 说明 |
|-----|------|
| `src/config/prompts-library.js` | Prompt 代码实现 |
| `src/config/image-prompt-versions.js` | 图生图 Prompt 版本管理 |
| `src/data/tagLibrary.js` | 标签库定义 |
| `src/data/voiceLibrary.js` | 音色库定义 |
| `src/services/aiService.js` | AI 调用服务 |
| `public/prompt-arena.html` | 🆕 图生图 Prompt 测试工具 |
| `public/model-arena.html` | 🆕 模型对比测试工具 |

---

> 💡 **提示**：如需修改 Prompt，请直接编辑 `src/config/prompts-library.js`，修改后会自动生效。
> 
> 🏟️ **测试**：使用 Arena 工具验证效果后再发布修改！