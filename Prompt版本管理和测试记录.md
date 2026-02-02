# Prompt 版本管理和测试记录

> 本文档用于记录和对比不同版本的 Prompt 效果，方便迭代优化

---

## 📋 Prompt 清单

### 1. 标签推荐 Prompt
**版本**: v1.0  
**最后更新**: 2026-01-31  
**状态**: ✅ 已实现  
**位置**: `src/config/prompts-library.js` → `AI_PROMPTS.tagRecommendation`

#### 当前版本内容
```markdown
# Role
You are an Expert Visual Style Analyst with a deep understanding of aesthetics, photography, and mood. Your task is to analyze the user's uploaded image and recommend the most suitable style tags from the provided "Tag Library".

# Instructions
Please follow these steps strictly:
1. Analyze: deeply analyze the visual features of the image, including:
   - Lighting & Color: (e.g., Neon, Low-key, Pastel, High contrast)
   - Composition: (e.g., Wide shot, Close-up, Symmetrical)
   - Mood/Vibe: (e.g., Melancholic, Energetic, Cold, Warm)
2. Select: Select exactly **7 tags** from the Tag Library that best match the analyzed features.
   - Constraint: You must ONLY use tags from the provided Tag Library. Do not invent new tags.
   - Diversity: Try to cover different dimensions (Style, Mood, Lighting) if applicable.
3. Output: Output the result strictly as a JSON Array of strings.

# Output Format
["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7"]
```

#### 测试记录

| 测试ID | 测试图片 | 推荐标签 | 准确度评分 | 备注 |
|--------|---------|---------|-----------|------|
| T001 | ___ | ___ | ___ / 10 | ___ |
| T002 | ___ | ___ | ___ / 10 | ___ |
| T003 | ___ | ___ | ___ / 10 | ___ |

#### 优化建议
- [ ] ___
- [ ] ___

---

### 2. 图生图 Prompt 生成
**版本**: v1.0  
**最后更新**: 2026-01-31  
**状态**: ✅ 已实现  
**位置**: `src/config/prompts-library.js` → `AI_PROMPTS.imageToImage`

#### 当前版本内容
```markdown
# Role
You are an expert AI Art Director and Prompt Engineer. Your task is to take an original image's content description and a list of user-selected style tags, and then generate **four distinct, high-quality prompts** for an image-to-image (img2img) model.

# Instructions
Please follow these steps strictly:

1. Analyze & Synthesize: Deeply understand the core theme, mood, and visual elements implied by the User-Selected Tags and how they apply to the Original Image Content.

2. Create Four Variants: Construct four separate prompts in English. Each prompt must combine the original content with the tags, but interpret the style differently to create variety:
   - Variant 1: The Direct Interpretation: Focus on a literal, high-quality application of the tags, maintaining realism or the original tone.
   - Variant 2: The Artistic Stylization: Apply the tags through a specific art medium (e.g., illustration, oil painting, comic book, 3D render).
   - Variant 3: The Cinematic/Atmospheric Take: Focus on lighting, mood, and dramatic composition based on the tags (e.g., depth of field, dramatic lighting).
   - Variant 4: The Creative/Abstract Twist: A more unique, interpretive, or slightly fantastical version of the theme (e.g., glitch art, surrealism).

3. Prompt Structure: All output prompts must be in English and follow this structure:
   [Style/Medium based on tags] + [Original Image Content] + [Specific visual elements from tags] + [Quality boosters (e.g., highly detailed, 8k, masterpiece, trending on artstation)]

4. Output Format: Return ONLY a JSON array containing the four prompt strings. Do not include any markdown formatting or conversational text.

# Example Output
[
  "A photorealistic cyberpunk portrait...",
  "A stylized comic book panel...",
  "A cinematic film still...",
  "A futuristic glitch art..."
]
```

#### 测试记录

| 测试ID | 原图 | 标签 | 生成的4个Prompts | 图片质量 | 风格多样性 | 综合评分 |
|--------|------|------|-----------------|---------|-----------|----------|
| G001 | ___ | ___ | 1. ___<br>2. ___<br>3. ___<br>4. ___ | ___ / 10 | ___ / 10 | ___ / 10 |
| G002 | ___ | ___ | 1. ___<br>2. ___<br>3. ___<br>4. ___ | ___ / 10 | ___ / 10 | ___ / 10 |

#### 优化建议
- [ ] ___
- [ ] ___

---

### 3. 音色推荐 Prompt
**版本**: v1.0  
**最后更新**: 2026-01-31  
**状态**: ✅ 已实现  
**位置**: `src/config/prompts-library.js` → `AI_PROMPTS.voiceRecommendation`

#### 当前版本内容
```markdown
# Role
You are a top-tier Audio Casting Director with expert synesthesia skills. Your task is to recommend the single **best-fitting default voice** from a provided "Voice Library" based on an image description and user-selected style tags.

# Instructions
Please follow these steps strictly:

1. Persona Profiling: Combine the Original Image Content and User-Selected Tags to profile the character's likely voice. Consider:
   - What is the character's gender and approximate age?
   - Should the speech tempo be fast or slow?
   - Is the vocal timbre deep, bright, raspy, or soft?
   - Is the emotional tone cool, energetic, gentle, or serious?

2. Matching: Compare this profile against the entries in the Voice Library Metadata. Look for the voice with the highest overlap in gender, style tags, and voice description.

3. Decision: Select exactly **1 voice** as the default recommendation. If there are multiple fits, prioritize the one with the highest tag overlap.

# Output Format
Return ONLY a JSON object containing the recommendation result. Do not include any conversational text.
{
  "recommended_voice_id": "The_Selected_Voice_ID",
  "reasoning": "A short sentence explaining the choice"
}
```

#### 测试记录

| 测试ID | 图片 | 标签 | 推荐音色 | 匹配度 | 推荐理由 | 评分 |
|--------|------|------|---------|-------|---------|------|
| V001 | ___ | ___ | ___ | ___ / 10 | ___ | ___ / 10 |
| V002 | ___ | ___ | ___ | ___ / 10 | ___ | ___ / 10 |

#### 优化建议
- [ ] ___
- [ ] ___

---

### 4. 视频生成 Prompt（可选）
**版本**: v1.0  
**最后更新**: 2026-01-31  
**状态**: ⏳ 待实现  
**位置**: `src/config/prompts-library.js` → `AI_PROMPTS.videoGeneration`

#### 当前版本内容
```markdown
# Role
You are an AI Video Director skilled in character consistency. Your task is to select the best script for a user's Avatar and **write a specific prompt to drive the video generation model**.

# Instructions
Please follow these steps strictly:

1. Persona Analysis: Analyze the combined vibe of the Image and Voice.

2. Script Selection: Select the single best script from the library that matches the persona.

3. **Video Prompt Generation (Motion Generation)**:
   - Write a specific **English prompt** based on the selected script and persona to drive the video generation model.
   - Requirements: Include specific facial micro-expressions and head movements.
   - Example: "A close-up shot, the character smiles gently, eyes crinkling, maintaining eye contact, natural head movement."

# Output Format
Return ONLY a JSON object:
{
  "selected_script_id": "The_ID",
  "script_text": "The_Text",
  "video_model_prompt": "The generated prompt for the video model",
  "reasoning": "Short reasoning"
}
```

#### 测试记录

| 测试ID | 图片 | 音色 | 生成的视频Prompt | 视频质量 | 评分 |
|--------|------|------|-----------------|---------|------|
| D001 | ___ | ___ | ___ | ___ / 10 | ___ / 10 |

#### 优化建议
- [ ] ___
- [ ] ___

---

## 📊 整体测试汇总

### 测试环境
- **测试日期**: ___
- **测试人员**: ___
- **测试图片数**: ___
- **LLM 模型**: GPT-4 Vision / Claude 3 / 其他

### 综合评分

| Prompt类型 | 平均准确度 | 平均响应时间 | 成功率 | 综合评分 |
|-----------|-----------|-------------|--------|----------|
| 标签推荐 | ___ / 10 | ___ 秒 | ___ % | ___ / 10 |
| 图生图Prompt | ___ / 10 | ___ 秒 | ___ % | ___ / 10 |
| 音色推荐 | ___ / 10 | ___ 秒 | ___ % | ___ / 10 |
| 视频Prompt | ___ / 10 | ___ 秒 | ___ % | ___ / 10 |

### 典型问题
1. ___
2. ___
3. ___

### 优化方向
1. ___
2. ___
3. ___

---

## 🔄 版本历史

### v1.0 (2026-01-31)
- ✅ 初始版本
- ✅ 4 个核心 Prompt 定义完成
- ✅ 测试表格创建完成

### v1.1 (待定)
- ⏳ 根据测试结果优化标签推荐
- ⏳ 优化图生图 Prompt 的风格多样性
- ⏳ 提升音色推荐准确度

---

## 📝 测试指南

### 测试流程
1. **准备测试数据**
   - 选择 3-5 张不同风格的测试图片
   - 记录测试图片的特征

2. **运行测试**
   - 使用相同图片测试所有 Prompt
   - 记录每次的输出结果
   - 记录响应时间

3. **效果评估**
   - 标签推荐：准确度（是否符合图片特征）
   - 图生图：质量（清晰度、风格还原度、多样性）
   - 音色推荐：匹配度（是否符合人物气质）

4. **记录结果**
   - 填写测试表格
   - 截图保存生成结果
   - 记录典型问题

5. **优化迭代**
   - 分析问题原因
   - 调整 Prompt
   - 重新测试验证

### 评分标准

**准确度（1-10分）**
- 10分：完美匹配，超出预期
- 8-9分：非常准确，符合预期
- 6-7分：基本准确，有小瑕疵
- 4-5分：部分准确，有明显问题
- 1-3分：不准确，需要大幅优化

**响应时间（秒）**
- < 2秒：优秀 ⭐⭐⭐⭐⭐
- 2-5秒：良好 ⭐⭐⭐⭐
- 5-10秒：一般 ⭐⭐⭐
- > 10秒：需优化 ⭐⭐

---

## 💡 Prompt 优化技巧

### 1. 明确角色和目标
```markdown
❌ You are an AI.
✅ You are an Expert Visual Style Analyst with a deep understanding of aesthetics, photography, and mood.
```

### 2. 结构化指令
```markdown
✅ Please follow these steps strictly:
1. Analyze...
2. Select...
3. Output...
```

### 3. 明确约束
```markdown
✅ - Constraint: You must ONLY use tags from the provided Tag Library.
✅ - Output Format: Return ONLY a JSON array.
```

### 4. 提供示例
```markdown
✅ # Example Output
["Tag1", "Tag2", "Tag3", ...]
```

### 5. 强调关键点
```markdown
✅ Select exactly **7 tags**
✅ Do not include any conversational text.
```

---

## 🎯 下一步

- [ ] 提供 API Key，开始真实测试
- [ ] 完成第一轮测试（至少 5 张图片）
- [ ] 分析测试结果
- [ ] 优化 Prompt
- [ ] 第二轮测试验证
- [ ] 选定最优版本
