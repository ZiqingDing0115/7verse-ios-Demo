# AI Character Builder - 后端 API 接口规范

> 📅 最后更新：2026-02-05  
> 📝 本文档描述前端调用的所有后端 API，供后端工程师对接参考

---

## 📋 目录

1. [系统架构概览](#系统架构概览)
2. [API 列表总览](#api-列表总览)
3. [详细接口文档](#详细接口文档)
   - [Gemini API](#1-gemini-api---ai-智能分析)
   - [Flux API](#2-flux-api---图生图)
   - [7verse Storage API](#3-7verse-storage-api---图片上传)
   - [7verse I2V API](#4-7verse-i2v-api---图生视频)
   - [ElevenLabs API](#5-elevenlabs-api---音色库--tts)
   - [Qwen API](#6-qwen-api---大语言模型备选)
4. [业务流程图](#业务流程图)
5. [环境变量配置](#环境变量配置)

---

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI Character Builder                             │
│                         (React + Vite 前端)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
   ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
   │  Gemini AI  │          │    Flux     │          │   7verse    │
   │ (标签/Prompt)│          │  (图生图)   │          │ (存储/视频) │
   └─────────────┘          └─────────────┘          └─────────────┘
          │                         │                         │
          ▼                         ▼                         ▼
   ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
   │ ElevenLabs  │          │    Qwen     │          │             │
   │ (音色/TTS)   │          │ (LLM 备选)  │          │             │
   └─────────────┘          └─────────────┘          └─────────────┘
```

---

## API 列表总览

| 步骤 | 功能 | API 服务 | Endpoint |
|------|------|----------|----------|
| Step 1 | 上传图片 | - | 本地 base64 处理 |
| Step 2 | 标签推荐 | Gemini | `generativelanguage.googleapis.com` |
| Step 3A | 图生图 Prompt | Gemini | `generativelanguage.googleapis.com` |
| Step 3B | 音色推荐 | Gemini + ElevenLabs | 多个 |
| Step 3C | 图片风格迁移 | Flux | `flux2.vivix.work` (代理) |
| Step 4 | 视频 Prompt | Gemini | `generativelanguage.googleapis.com` |
| Step 5 | 图片上传 | 7verse Storage | `uat.7verse.ai/storage/file` |
| Step 6 | 图生视频 | 7verse I2V | `uat.7verse.ai/gen/video/i2v` |
| Step 7 | 文字转语音 | ElevenLabs TTS | `api.elevenlabs.io/v1/text-to-speech` |

---

## 详细接口文档

### 1. Gemini API - AI 智能分析

> 用于：标签推荐、图生图 Prompt 生成、音色推荐、视频 Prompt 生成

#### 基础信息

| 配置项 | 值 |
|--------|-----|
| Endpoint | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` |
| Model | `gemini-2.0-flash` |
| Method | POST |
| Auth | URL Query: `?key={API_KEY}` |
| Timeout | 30000ms |

#### 请求参数

```json
{
  "contents": [{
    "parts": [
      { "text": "System prompt + User prompt" },
      {
        "inline_data": {
          "mime_type": "image/jpeg",
          "data": "BASE64_IMAGE_DATA"  // 可选，仅图片分析时需要
        }
      }
    ]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024
  }
}
```

#### 响应格式

```json
{
  "candidates": [{
    "content": {
      "parts": [{ "text": "AI 生成的 JSON 字符串" }]
    }
  }]
}
```

#### 业务场景

**1.1 标签推荐 (Step 2)**

- 输入：用户上传的图片 (base64)
- 输出 JSON：
```json
{
  "image_analysis": {
    "subject": "描述主体",
    "lighting": "光线描述",
    "mood": "氛围描述",
    "style": "风格描述"
  },
  "recommended_persona_tags": ["tag1", "tag2", ...],
  "recommended_relationship": "relationship_tag"
}
```

**1.2 图生图 Prompt (Step 3A)**

- 输入：用户选择的标签数组
- 输出 JSON：
```json
{
  "prompts": [
    "exact same person exact same face, scene1, angle1, lighting1, preserve facial features",
    "exact same person exact same face, scene2, angle2, lighting2, preserve facial features",
    "exact same person exact same face, scene3, angle3, lighting3, preserve facial features"
  ],
  "styleLabels": ["Scene1", "Scene2", "Scene3"]
}
```

**1.3 音色推荐 (Step 3B)**

- 输入：图片 + 标签 + 音色库
- 输出 JSON：
```json
{
  "character_voice_profile": {
    "perceived_gender": "male/female",
    "perceived_age": "young/adult/mature",
    "suggested_tempo": "fast/medium/slow",
    "suggested_timbre": "deep/warm/bright",
    "suggested_tone": "confident/gentle/mysterious"
  },
  "recommended_voice_id": "voice_id_xxx",
  "reasoning": "推荐理由",
  "alternative_voice_id": "备选音色 ID"
}
```

**1.4 视频 Prompt (Step 4)**

- 输入：图片描述 + 音色信息 + 标签
- 输出 JSON：
```json
{
  "character_persona": {
    "personality": "性格描述",
    "energy_level": "high/medium/low",
    "communication_style": "风格描述"
  },
  "selected_script_id": "intro_1",
  "script_text": "台词内容",
  "video_model_prompt": "视频生成指令",
  "motion_details": {
    "opening": "开场动作",
    "during_speech": "说话时动作",
    "closing": "结束动作"
  },
  "suggested_name": "建议的角色名称",
  "reasoning": "选择理由"
}
```

---

### 2. Flux API - 图生图

> 用于：根据 Prompt 将原图风格迁移生成新图

#### 基础信息

| 配置项 | 值 |
|--------|-----|
| Endpoint | `https://flux2.vivix.work/generate` |
| 代理路径 | `/api/flux/generate` |
| Method | POST |
| Content-Type | application/json |
| Timeout | 60000ms |

#### 请求参数

```json
{
  "prompt": "exact same person exact same face, gothic castle, low angle shot, dramatic lighting, preserve facial features",
  "image": "data:image/jpeg;base64,/9j/4AAQ...",  // 完整 data URI
  "width": 1024,
  "height": 1024
}
```

#### 响应格式

```json
{
  "success": true,
  "image_base64": "data:image/png;base64,iVBORw0...",  // 生成的图片
  "error": null
}
```

#### 注意事项

- 输入图片必须是完整的 `data:image/xxx;base64,xxx` 格式
- 返回图片也是 base64 格式，前端可直接用于 `<img src="">`
- 建议 Prompt 长度控制在 50 词以内，Flux 对短 Prompt 效果更好

---

### 3. 7verse Storage API - 图片上传

> 用于：将 base64 图片上传到 7verse 云存储，获取 URL

#### 基础信息

| 配置项 | 值 |
|--------|-----|
| Endpoint | `https://uat.7verse.ai/storage/file` |
| 代理路径 | `/api/7verse-storage/file` |
| Method | POST |
| Content-Type | multipart/form-data |
| Auth | Header: `Authorization: Bearer {TOKEN}` |

#### 请求参数 (FormData)

```
file: File 对象 (从 base64 转换)
mime_type: "image/jpeg" 或 "image/png"
```

#### 响应格式

```json
{
  "ok": true,
  "data": {
    "url": "https://cdn.7verse.ai/xxx/character_image.jpg",
    "success": true
  }
}
```

---

### 4. 7verse I2V API - 图生视频

> 用于：根据首帧图片 + Prompt 生成视频

#### 基础信息

| 配置项 | 值 |
|--------|-----|
| Endpoint | `https://uat.7verse.ai/gen/video/i2v` |
| 代理路径 | `/api/7verse/gen/video/i2v` |
| Method | POST |
| Content-Type | application/json |
| Auth | Header: `Authorization: Bearer {TOKEN}` |

#### 请求参数

```json
{
  "first_frame_url": "https://cdn.7verse.ai/xxx/image.jpg",  // 必须是 URL
  "prompt": "A close-up shot, the character smiles warmly, eyes bright",
  "duration": 5,          // 视频时长 4-12 秒
  "ratio": "9:16",        // 宽高比：9:16, 16:9, 1:1
  "async": true,          // 是否异步（推荐 true）
  "generate_audio": false,// 是否生成配音
  "vendor": "VIDEO_VENDOR_SEEDANCE"
}
```

#### 响应格式

```json
{
  "ok": true,
  "data": {
    "file_url": "https://cdn.7verse.ai/videos/xxx.mp4",
    "task_id": "task_xxx",   // 异步模式返回
    "status": "completed"    // pending / processing / completed / failed
  }
}
```

#### 异步轮询 (如需)

如果 `async: true`，需要轮询任务状态：

```
GET /api/7verse/gen/video/status/{task_id}
```

---

### 5. ElevenLabs API - 音色库 & TTS

> 用于：获取音色库、文字转语音

#### 5.1 获取官方音色

| 配置项 | 值 |
|--------|-----|
| Endpoint | `https://api.elevenlabs.io/v1/voices` |
| Method | GET |
| Auth | Header: `xi-api-key: {API_KEY}` |

**响应格式：**

```json
{
  "voices": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "category": "premade",
      "labels": {
        "accent": "american",
        "age": "young",
        "gender": "female",
        "use_case": "narration"
      },
      "preview_url": "https://...",
      "description": "Voice description"
    }
  ]
}
```

#### 5.2 获取社区音色

| 配置项 | 值 |
|--------|-----|
| Endpoint | `https://api.elevenlabs.io/v1/shared-voices` |
| Method | GET |
| Auth | Header: `xi-api-key: {API_KEY}` |

#### 5.3 文字转语音 (TTS)

| 配置项 | 值 |
|--------|-----|
| Endpoint | `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` |
| Method | POST |
| Auth | Header: `xi-api-key: {API_KEY}` |
| Accept | audio/mpeg |

**请求参数：**

```json
{
  "text": "Hey there! Welcome to my world.",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.5,
    "use_speaker_boost": true
  }
}
```

**响应：** 二进制音频流 (audio/mpeg)

---

### 6. Qwen API - 大语言模型（备选）

> 用于：LLM 备选方案，支持流式输出

#### 基础信息

| 配置项 | 值 |
|--------|-----|
| Endpoint | (内部代理) `/api/qwen/chat/completions` |
| Model | `Qwen3-235B-A22B-GPTQ-Int4` |
| Method | POST |
| Content-Type | application/json |

#### 请求参数

```json
{
  "model": "Qwen3-235B-A22B-GPTQ-Int4",
  "messages": [
    { "role": "system", "content": "System prompt" },
    { "role": "user", "content": "User message" }
  ],
  "max_tokens": 2000,
  "temperature": 0.7,
  "stream": true,
  "chat_template_kwargs": {
    "enable_thinking": false
  }
}
```

#### 响应格式 (流式)

```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" world"}}]}
data: [DONE]
```

---

## 业务流程图

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          AI Character Builder 完整流程                       │
└────────────────────────────────────────────────────────────────────────────┘

  ┌─────────┐
  │ Step 1  │ 用户上传图片 → 本地转 base64
  └────┬────┘
       ▼
  ┌─────────┐
  │ Step 2  │ 调用 Gemini API (带图片) → 返回推荐标签 (7个)
  └────┬────┘     └──→ 用户手动选择/调整标签
       ▼
  ┌─────────┐
  │ Step 3A │ 调用 Gemini API (带标签) → 返回 3 个风格 Prompt
  └────┬────┘
       ▼
  ┌─────────┐
  │ Step 3B │ 调用 ElevenLabs API → 获取音色库
  └────┬────┘     └──→ 调用 Gemini API → 推荐最佳音色
       ▼
  ┌─────────┐
  │ Step 3C │ 调用 Flux API (3次) → 返回 3 张风格图
  └────┬────┘     └──→ 用户选择最喜欢的 1 张
       ▼
  ┌─────────┐
  │ Step 4  │ 调用 Gemini API → 生成视频 Prompt + 台词
  └────┬────┘
       ▼
  ┌─────────┐
  │ Step 5  │ 调用 7verse Storage → 上传选中图片，获取 URL
  └────┬────┘
       ▼
  ┌─────────┐
  │ Step 6  │ 调用 7verse I2V API → 生成视频
  └────┬────┘     └──→ 输入：图片 URL + 视频 Prompt
       ▼
  ┌─────────┐
  │ Step 7  │ 调用 ElevenLabs TTS → 生成配音
  └────┬────┘
       ▼
  ┌─────────┐
  │  完成   │  展示最终角色：图片 + 视频 + 音频
  └─────────┘
```

---

## 环境变量配置

创建 `.env` 文件（参考 `.env.example`）：

```env
# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key

# 7verse API
VITE_7VERSE_TOKEN=your_7verse_token

# ElevenLabs API
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

---

## Vite 代理配置

`vite.config.js` 中的代理配置：

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api/flux': {
        target: 'https://flux2.vivix.work',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/flux/, '')
      },
      '/api/7verse-storage': {
        target: 'https://uat.7verse.ai/storage',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/7verse-storage/, '')
      },
      '/api/7verse': {
        target: 'https://uat.7verse.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/7verse/, '')
      },
      '/api/qwen': {
        target: 'YOUR_QWEN_ENDPOINT',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/qwen/, '')
      }
    }
  }
});
```

---

## 后端对接建议

### 1. 需要后端实现的部分

- **API Key 管理**：敏感 Key 不应暴露在前端，建议后端代理
- **速率限制**：部分 API 有调用频率限制，需要后端控制
- **异步任务轮询**：7verse I2V 视频生成是异步的，建议后端封装轮询逻辑
- **错误重试**：网络不稳定时的自动重试机制

### 2. 数据结构对接

前端使用的核心数据结构：

```typescript
// 角色数据
interface CharacterData {
  uploadedImage: string;      // base64 图片
  selectedTags: string[];     // 用户选择的标签
  selectedVoiceId: string;    // 音色 ID
  selectedImageIndex: number; // 选中的风格图索引
  videoPrompt: string;        // 视频 Prompt
  scriptText: string;         // 台词
}

// 生成结果
interface GenerationResult {
  images: Array<{
    id: number;
    url: string;       // base64 或 URL
    prompt: string;
    type: 'original' | 'generated';
  }>;
  videoUrl: string;
  audioUrl: string;
}
```

---

## 联系方式

如有问题，请联系前端开发：[your-email@example.com]
