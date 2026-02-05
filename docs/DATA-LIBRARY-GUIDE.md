# 📚 数据库设计文档 | Data Library Guide

> 本文档为 **7verse AI Character Creation Tool** 的标签库和音色库设计说明，适合产品经理、设计师和开发者阅读。

---

## 🏷️ 标签库 (Tag Library)

### 📍 文件位置
- **JS 模块**: `src/data/tagLibrary.js` (程序使用)
- **JSON 导出**: `src/data/tagLibrary.json` (文档/API 参考)

### 🎯 设计目标
让用户通过**直观、有趣的标签**快速定义 AI 角色的外观、性格和关系动态。

### 📊 三层标签体系

| 层级 | 名称 | 数量 | 说明 | 示例 |
|------|------|------|------|------|
| **Layer 1** | Visual Vibe (视觉风格) | 34 | AI 从图片直接分析出的特征 | Stunning ✨, Cyberpunk 🤖, Dreamy ☁️ |
| **Layer 2** | Persona (人设) | 33 | 角色的性格和身份原型 | Sunshine ☀️, CEO-Energy 💼, Yandere 🔪 |
| **Layer 3** | Relationship (关系) | 33 | 用户与角色的互动模式 | Soulmate 💞, Enemies-to-Lovers ⚔️❤️, Toxic ☠️ |

### 🔄 用户流程

```
Step 1: 上传图片
    ↓
Step 2: AI 推荐 7 个标签（自动选中）
    ↓
    用户可以：
    • 保留 AI 推荐
    • 点击 Shuffle 随机换一批
    • 点击"全部"展开查看 100 个标签
    • 手动添加/移除标签
    ↓
选中的标签传递给 Step 3 (图生图) 和 Step 4 (视频生成)
```

### 🧠 AI 推荐逻辑

```javascript
// AI Prompt 摘要 (完整版见 src/config/prompts-library.js)
{
  input: "用户上传的图片 (base64)",
  task: "分析图片，从标签库中选择 7 个最匹配的标签",
  output: {
    image_analysis: { subject, lighting, mood, style },
    recommended_tags: ["Tag1", "Tag2", ...]
  }
}
```

### 🎨 标签设计原则

1. **Fun over Formal**: 使用流行文化语言（如 "小狼狗"、"Yandere"）而非学术描述
2. **Emoji First**: 每个标签都有对应 emoji，增强视觉记忆
3. **Bilingual**: 中英双语支持，适配国际化
4. **Trope-Aware**: 包含经典影视/小说桥段（如 Enemies-to-Lovers）

---

## 🎙️ 音色库 (Voice Library)

### 📍 文件位置
- **服务层**: `src/services/voiceService.js` (API 调用 + 缓存)
- **本地备份**: `src/data/voiceLibrary.js` (降级方案)
- **JSON 导出**: `src/data/voiceLibrary.json` (文档/API 参考)

### 🎯 设计目标
为 AI 角色匹配**合适的声音**，并支持实时试听。

### 🔌 数据来源

```
┌─────────────────────────────────────────────────────┐
│                  ElevenLabs API                     │
├─────────────────────────────────────────────────────┤
│  Official Voices        Community Voices            │
│  (高质量官方音色)         (用户共享音色)              │
│      ↓                       ↓                      │
│           合并 + 去重 + 缓存                         │
│                    ↓                                │
│              voiceService.js                        │
│              (内存缓存)                              │
└─────────────────────────────────────────────────────┘
                       ↓
              降级时使用本地 voiceLibrary.js
```

### 📊 音色分类

| 类型 | 标签 | 说明 |
|------|------|------|
| **Female Voices** | Lively, Calm, Steady, Friendly, Attractive | 5 种女性音色 |
| **Male Voices** | Deep-toned, Jovial, Lively, Calm | 4 种男性音色 |

### 🔄 用户流程

```
Step 2: 上传图片 + 选择标签
    ↓
    (后台) AI 根据图片和标签推荐音色
    ↓
Step 3: 
    • 自动播放推荐音色的等待语音 🔊
    • 用户可试听其他音色
    • 图片加载完成后播放完成语音 🎉
    ↓
选中的音色用于 AI 角色的 TTS 语音
```

### 🧠 AI 推荐逻辑

```javascript
// AI Prompt 摘要 (完整版见 src/config/prompts-library.js)
{
  input: {
    image: "用户上传的图片",
    tags: ["Sunshine", "Golden-Retriever", ...],
    voiceLibrary: [{ id, name, tags, ... }]
  },
  task: "根据图片和标签，选择最匹配的音色",
  output: {
    character_voice_profile: { tone, energy, style },
    recommended_voice_id: "lively-woman",
    alternative_voice_id: "friendly-women",
    reasoning: "推荐理由"
  }
}
```

### 🗣️ TTS 互动设计

| 场景 | 语音内容 | 目的 |
|------|----------|------|
| **等待时** | "Hold tight! Magic takes a moment." | 留住用户，增加期待感 |
| **完成时** | "Tada! I'm ready! Which look do you like best?" | 庆祝完成，引导下一步 |

> 语音文本存储在 `src/data/waitingPhrases.js`，各 20 条，随机播放

---

## 🔗 数据流向图

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Step 1     │     │   Step 2     │     │   Step 3     │     │   Step 4     │
│  上传图片    │────▶│  选择标签    │────▶│ 图片+音色    │────▶│  预览发布    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
  ┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
  │ base64  │         │  tags[] │         │ images  │         │ video   │
  │  image  │         │ voiceId │         │  voice  │         │ prompt  │
  └─────────┘         └─────────┘         └─────────┘         └─────────┘
       │                    │                    │                    │
       └────────────────────┴────────────────────┴────────────────────┘
                                    │
                                    ▼
                           ┌───────────────┐
                           │   Gemini AI   │
                           │  (VLM + LLM)  │
                           └───────────────┘
```

---

## 📁 相关文件索引

| 文件 | 作用 |
|------|------|
| `src/data/tagLibrary.js` | 标签库 JS 模块（程序入口） |
| `src/data/tagLibrary.json` | 标签库 JSON 导出 |
| `src/data/voiceLibrary.js` | 音色库本地备份 |
| `src/data/voiceLibrary.json` | 音色库 JSON 导出 |
| `src/data/waitingPhrases.js` | TTS 等待/完成语音文本 |
| `src/services/voiceService.js` | 音色服务层（API + 缓存） |
| `src/config/prompts-library.js` | 所有 AI Prompt 定义 |

---

## 🎓 For 小白用户 / 产品经理

### Q: 标签是怎么被 AI 使用的？
**A**: 用户选择的标签会被拼接成文字，发送给 Gemini AI，用于生成图片提示词和音色推荐。

### Q: 音色数据从哪来？
**A**: 主要从 ElevenLabs API 实时获取，如果 API 失败，会用本地 9 个预设音色作为备份。

### Q: 可以增加/修改标签吗？
**A**: 可以！修改 `src/data/tagLibrary.js`，运行时会自动生效。JSON 文件仅作为文档参考。

### Q: 如何测试语音？
**A**: 在 Step 3 点击任意音色卡片的播放按钮，即可试听 ElevenLabs 提供的预览音频。

---

*Last Updated: 2026-02-03 | 7verse AI Character Creation Team*
