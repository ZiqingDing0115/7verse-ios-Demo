# AI Character Builder

一款基于 AI 的角色创建工具，通过上传图片，自动生成个性化角色，支持风格图生成、智能音色推荐和 TTS 语音互动。

## 🔗 测试地址（固定）

```
http://localhost:5173
```

> 💡 如果 5173 端口被占用，会自动使用 5174、5175 等

## ✨ 核心功能

- **📸 智能图片分析** - 上传图片，AI 自动分析并推荐 7 个最匹配的标签
- **🎨 4 种风格图生成** - 基于选中标签，AI 生成 4 种不同风格的角色图片
- **🎙️ 音色智能推荐** - 根据图片特征和标签，AI 推荐最匹配的音色
- **🔊 TTS 语音互动** - 加载过程中播放等待语音，提升用户体验
- **📝 自动生成角色信息** - AI 自动生成角色名称和描述

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | 前端框架 |
| Vite | 构建工具 |
| Tailwind CSS | 样式框架 |
| Gemini 2.0 Flash | AI Prompt 生成（标签/图生图/音色/视频） |
| 7verse API | 图生图服务 |
| ElevenLabs | 音色库和 TTS |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/ai-character-builder.git
cd ai-character-builder

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 API Keys

# 4. 启动开发服务器
npm run dev

# 5. 打开浏览器访问
# http://localhost:5173
```

## ⚙️ 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
# Gemini API（必需）
# 获取地址：https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key

# 7verse 图生图 API（必需）
# 联系 7verse 团队获取
VITE_7VERSE_TOKEN=your_7verse_token

# ElevenLabs API（必需）
# 获取地址：https://elevenlabs.io/
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## 📖 使用流程

### Step 1: 拍照/上传
- 上传一张图片或使用摄像头拍照
- 支持拖拽上传

### Step 2: 选择标签
- AI 自动分析图片，推荐 7 个标签
- 100 个精选标签，分为 3 个类别：
  - **Visual Vibe** - 外观特征（34 个）
  - **Persona** - 性格特点（33 个）
  - **Relationship** - 关系定位（33 个）
- 可随机刷新标签，也可展开查看全部

### Step 3: 选择风格图和音色
- AI 生成 4 张不同风格的角色图片
- AI 推荐最匹配的音色，自动播放试听
- 加载过程中播放等待语音，保持用户参与感

### Step 4: 预览和发布
- 查看最终角色效果
- 编辑角色名称和描述
- AI 自动生成视频 Prompt（控制台可见）

## 📂 项目结构

```
src/
├── components/          # 通用组件
│   ├── Stepper.jsx      # 步骤条
│   ├── StepLayout.jsx   # 页面布局
│   └── ShimmerReference.jsx  # 加载动画参考
├── config/
│   ├── api.js           # API 配置和调用
│   ├── prompts.js       # Prompt 配置
│   └── prompts-library.js  # Prompt 库（核心）
├── context/
│   └── AppContext.jsx   # 全局状态管理
├── data/
│   ├── tagLibrary.js    # 100 个标签定义
│   ├── voiceLibrary.js  # 音色库备用数据
│   └── waitingPhrases.js # TTS 等待语句
├── services/
│   ├── aiService.js     # AI 服务（Gemini）
│   ├── imageService.js  # 图生图服务
│   └── voiceService.js  # 音色服务
├── steps/
│   ├── Step1TakePicture.jsx   # 拍照上传
│   ├── Step2AddPersona.jsx    # 标签选择
│   ├── Step3PickImageVoice.jsx # 风格图和音色
│   └── Step4Preview.jsx       # 预览发布
├── App.jsx              # 主应用
├── main.jsx             # 入口文件
└── index.css            # 全局样式
```

## 🎯 Prompt 系统

项目使用 4 个 AI Prompt 驱动核心功能：

| Prompt | 作用 | 输入 | 输出 |
|--------|------|------|------|
| 标签推荐 | 分析图片推荐标签 | 图片 + 标签库 | 7 个推荐标签 |
| 图生图 | 生成风格化 Prompt | 图片 + 标签 | 4 个风格 Prompt |
| 音色推荐 | 匹配最佳音色 | 图片 + 标签 | 推荐音色 ID |
| 视频生成 | 生成视频脚本 | 图片 + 标签 + 音色 | 角色名称 + 脚本 |

Prompt 定义位置：`src/config/prompts-library.js`

## 🌐 Vercel 部署

### 方式一：一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/ai-character-builder)

### 方式二：手动部署

1. Fork 或导入 GitHub 仓库到 Vercel
2. 在 Vercel 项目设置中添加环境变量：
   - `VITE_GEMINI_API_KEY`
   - `VITE_7VERSE_TOKEN`
   - `VITE_ELEVENLABS_API_KEY`
3. 点击部署

### API 代理配置

项目使用 `vercel.json` 配置 API 代理，解决跨域问题：

```json
{
  "rewrites": [
    {
      "source": "/api/7verse/:path*",
      "destination": "https://uat.7verse.ai/api/v1/:path*"
    }
  ]
}
```

## 🔧 本地开发

```bash
# 开发模式（热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 💡 功能亮点

### Shimmer 加载效果
所有加载状态使用 Shimmer 动画，提升视觉体验。

### 语音互动
- 加载时自动播放等待语音（20 句随机）
- 加载完成播放提示语音（20 句随机）
- 语音库：`src/data/waitingPhrases.js`

### 响应式设计
- 移动端优先设计
- 类原生相机界面（Step 1）
- 毛玻璃效果和现代 UI

## 📝 常见问题

### Q: 图片生成失败？
A: 检查 7verse Token 是否过期，联系团队获取新 Token。

### Q: 没有声音播放？
A: 检查 ElevenLabs API Key 是否正确，浏览器是否允许自动播放。

### Q: Gemini API 报错？
A: 确认 API Key 有效，检查是否超出配额限制。

## 📄 License

MIT License

---

Made with ❤️ for AI Character Creation
