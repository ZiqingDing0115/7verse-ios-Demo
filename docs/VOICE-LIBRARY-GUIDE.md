# 🎙️ 音色库维护指南

> 📅 最后更新：2026-02-05  
> 🔄 实时同步：在 ElevenLabs 维护 → 前端 10 分钟内自动同步  
> 👤 适用人群：运营、产品经理

---

## 📋 音色来源

当前音色库**从 ElevenLabs 账号实时同步**，包括：

- ✅ **你账号里的音色**（My Voices）
  - 官方预设音色（premade）
  - 自定义克隆音色（cloned）
  - AI 生成音色（generated）
  - 专业音色（professional）
- ❌ 社区共享音色（默认关闭，可配置开启）

---

## 🔧 配置项

所有配置在 **`src/services/voiceService.js`** 文件顶部：

```javascript
const VOICE_CONFIG = {
  // 使用的音色类别
  allowedCategories: ['premade', 'cloned', 'generated', 'professional'],
  
  // 是否包含社区共享音色
  includeCommunityVoices: false,
  
  // 🆕 按 Collection ID 拉取（推荐）
  // 从 ElevenLabs 网页 URL 获取，如 collectionId=O61D3sjuAajNAZz5xVCo
  // 若非空，则通过 v2 API 只拉取该 Collection 内的音色
  collectionId: 'O61D3sjuAajNAZz5xVCo', // [iOS] 7verse投稿音色库 by Katherine
  
  // 可选：只要名字包含特定关键词的音色
  nameKeywords: null, // 例如：['7verse', 'ios']
};
```

### 常见配置场景

#### 1. 只用特定 Collection 的音色（推荐）

**步骤**：
1. 在 ElevenLabs 网页打开 [Voice Lab](https://elevenlabs.io/app/voice-lab)
2. 左侧点击你的 Collection（如「[iOS] 7verse投稿音色库 by Katherine」）
3. 查看浏览器 URL，找到 `collectionId=` 后面的 ID：
   ```
   https://elevenlabs.io/app/voice-lab?collectionId=O61D3sjuAajNAZz5xVCo
                                                   ^^^^^^^^^^^^^^^^^^^^^^^^
   ```
4. 把这个 ID 填入配置：

```javascript
collectionId: 'O61D3sjuAajNAZz5xVCo'
```

**优点**：
- 使用 v2 API，服务端只返回该 Collection 内的音色
- 不需要拉取 2000+ 音色再过滤，速度更快
- 无需匹配 Collection 名称，直接用 ID

#### 2. 拉取全部账号音色（不按 Collection）

```javascript
collectionId: null  // 或删掉这行
```

此时会使用 v1 API 拉取账号下所有音色。

#### 3. 只用名字包含特定关键词的音色

```javascript
nameKeywords: ['7verse', 'tom hardy', 'taylor']
```

#### 4. 包含社区热门音色

```javascript
includeCommunityVoices: true
```

#### 5. 只用官方预设音色

```javascript
allowedCategories: ['premade']
```

---

## 🔄 运营维护流程

### 方式 1：在 ElevenLabs 网站维护（推荐）

1. **登录 [ElevenLabs](https://elevenlabs.io/app/voice-library)**
2. **进入 My Voices**
3. **操作**：
   - ➕ **添加音色**：点击「Add Voice」或「Clone Voice」
   - ✏️ **编辑音色**：修改名称、描述、标签
   - 🗑️ **删除音色**：移除不需要的音色
   - 📁 **整理 Collection**：创建 Collection 并分组管理
4. **等待同步**：前端会在 **10 分钟内**自动拉取最新音色

**优点**：
- ✅ 无需改代码
- ✅ 运营友好，可视化操作
- ✅ 自动同步，实时生效

---

### 方式 2：在控制台动态更新配置（高级）

如果需要临时切换音色来源，可在浏览器控制台执行：

```javascript
// 导入服务
import { voiceService } from './services/voiceService';

// 切换到特定 Collection（使用 Collection ID）
await voiceService.updateVoiceConfig({
  collectionId: 'O61D3sjuAajNAZz5xVCo'
});

// 开启社区音色
await voiceService.updateVoiceConfig({
  includeCommunityVoices: true
});

// 查看当前状态
voiceService.getVoiceLibraryStatus();
```

---

## 📊 音色库状态查看

### 在浏览器控制台查看

打开控制台，音色库加载时会显示：

```
═══════════════════════════════════════════════════════════════
🎙️ 预加载 ElevenLabs 音色库（实时同步）...
📋 配置:
   类别: premade, cloned, generated, professional
   社区音色: ❌ 关闭
   🆕 Collection ID: O61D3sjuAajNAZz5xVCo (使用 v2 API)
🎙️ 调用 ElevenLabs v2 API 拉取 Collection(O61D3sjuAajNAZz5xVCo)...
   📄 第 1 页: 6 个音色
✅ ElevenLabs v2 拉取完成，共 6 个音色，1 页，耗时 0.85s
✅ Collection 音色加载成功！共 6 个
   1. Gravel Midnight (Male) - cloned
   2. Peter Parker gamer (Male) - cloned
   3. bitchy sassy gay friend (Male) - cloned
   4. tom hardy (Male) - cloned
   5. Taylor Swift (Female) - cloned
═══════════════════════════════════════════════════════════════
```

### 查看详细状态

```javascript
voiceService.getVoiceLibraryStatus()
// 返回：
// {
//   loaded: true,
//   count: 25,
//   officialCount: 25,
//   communityCount: 0,
//   cacheAge: 180000, // 毫秒
//   isStale: false,
//   config: { ... } // 当前配置
// }
```

---

## 🆕 如何添加新音色

### 方法 1：在 ElevenLabs 克隆音色

1. 访问 [Voice Library](https://elevenlabs.io/app/voice-library)
2. 搜索或筛选想要的音色
3. 点击「Add to My Voices」
4. 前端 10 分钟内自动同步

### 方法 2：自己录制克隆音色

1. 进入 [Voice Lab](https://elevenlabs.io/voice-lab)
2. 点击「Instant Voice Cloning」
3. 上传音频样本（建议 1-2 分钟高质量录音）
4. 填写名称、描述、标签
5. 克隆完成后，前端 10 分钟内同步

### 方法 3：使用 AI 生成音色

1. 进入 [Voice Design](https://elevenlabs.io/voice-design)
2. 输入描述（例如：「年轻女性，温柔甜美」）
3. 生成并试听
4. 满意后添加到 My Voices
5. 前端 10 分钟内同步

---

## ⚡ 强制刷新音色库

如果改了音色但前端还没同步，可以：

### 方法 1：刷新页面（推荐）

硬刷新浏览器：**Cmd+Shift+R**（Mac）或 **Ctrl+Shift+R**（Windows）

### 方法 2：在控制台强制刷新

```javascript
await voiceService.getCachedVoices(true); // forceRefresh = true
```

---

## 🎯 最佳实践

### 音色命名规范

建议命名格式：**`[标签] 音色名 - 特征`**

示例：
- ✅ `[iOS] Taylor Swift - Young Female Pop`
- ✅ `[7verse] Tom Hardy - British Male Deep`
- ✅ `bitchy sassy gay friend`
- ❌ `voice_001`（不直观）

### 音色描述规范

在 ElevenLabs 的音色描述里填写：
- 性别（Male/Female）
- 年龄（Young/Adult/Mature/Elderly）
- 口音（American/British/Australian 等）
- 特点（Gentle/Bold/Professional 等）

示例：
```
Warm, natural male voice in his 19-20s. Friendly, casual, and relatable.
Perfect for the best guy friend character.
```

### Collection 组织建议

按**用途**或**项目**分组：
- `[iOS] 7verse投稿音色库` - iOS 应用专用
- `[Web] 网站角色音色` - 网站版专用
- `[Test] 测试音色` - 内部测试用

---

## 🐛 常见问题

### Q1: 添加了音色但前端看不到？

**A**: 等待 10 分钟或硬刷新页面（Cmd+Shift+R）。音色库有 10 分钟缓存。

### Q2: 如何只显示某个 Collection 的音色？

**A**: 
1. 在 ElevenLabs 网页进入你的 Collection，复制 URL 里的 `collectionId=` 后面的 ID
2. 修改 `voiceService.js` 里的配置：
```javascript
collectionId: 'O61D3sjuAajNAZz5xVCo'
```

### Q3: 音色太多了，如何筛选？

**A**: 推荐使用 Collection ID 筛选：
1. 在 ElevenLabs 网站里创建 Collection，把需要的音色加进去
2. 把 Collection ID 填到 `collectionId` 配置项
3. 也可以用 `nameKeywords` 按关键词筛选：`['7verse', 'ios']`

### Q4: 能否混入社区热门音色？

**A**: 可以，设置 `includeCommunityVoices: true`。但注意：
- 社区音色数量很大（可能几千个）
- 加载速度会变慢
- 建议只在需要多样性时开启

### Q5: 音色库加载失败怎么办？

**A**: 会自动回退到本地备用音色库（`src/data/voiceLibrary.js`）。检查：
- ElevenLabs API Key 是否配置正确（`.env.local`）
- 网络是否正常
- ElevenLabs 服务是否可用

---

## 📂 相关文件

| 文件 | 说明 |
|------|------|
| `src/services/voiceService.js` | 音色库服务，配置在顶部 |
| `src/data/voiceLibrary.js` | 本地备用音色库（失败时使用） |
| `src/config/api.js` | ElevenLabs API 调用封装 |
| `.env.local` | 配置 `VITE_ELEVENLABS_API_KEY` |

---

## 🔗 参考链接

- [ElevenLabs Voice Library](https://elevenlabs.io/app/voice-library)
- [ElevenLabs Voice Lab](https://elevenlabs.io/app/voice-lab) - 查看 Collection ID
- [ElevenLabs API 文档 - v1 Get Voices](https://elevenlabs.io/docs/api-reference/voices/get-voices)
- [ElevenLabs API 文档 - v2 Get Voices](https://elevenlabs.io/docs/api-reference/voices/get-all) - 支持 collection_id 参数
- [ElevenLabs API 文档 - Shared Voices](https://elevenlabs.io/docs/api-reference/voices/voice-library/get-shared)

---

> 💡 **提示**：运营可直接在 ElevenLabs 网站维护音色，无需改代码。前端会自动同步！
