# ElevenLabs v2 Voices API — 按 Collection 拉取音色

> 直接拉取「我的音色」或指定 Collection 内的音色，支持分页。可直接复制下面内容作为调用参考。

---

## 1. 请求概览

| 项目 | 值 |
|------|-----|
| **Base URL** | `https://api.elevenlabs.io` |
| **路径** | `/v2/voices` |
| **方法** | `GET` |
| **认证** | Header `xi-api-key`（你的 API Key） |

---

## 2. 请求头（Headers）

| Header | 必填 | 说明 |
|--------|------|------|
| `xi-api-key` | ✅ | ElevenLabs API Key，如 `sk_xxxx...` |
| `Content-Type` | 建议 | `application/json` |

---

## 3. 查询参数（Query Parameters）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `collection_id` | string | 否 | Collection ID。**有则只返回该 Collection 内音色**；不传则返回账号下全部「My Voices」。从网页 URL 获取：`?collectionId=O61D3sjuAajNAZz5xVCo` |
| `page_size` | integer | 否 | 每页条数，**最大 100**，默认建议 100 |
| `next_page_token` | string | 否 | 分页用。响应里 `has_more === true` 时，下一请求带上本页返回的 `next_page_token` |

---

## 4. 请求示例

### 只拉取某个 Collection 的音色（第一页）

```
GET https://api.elevenlabs.io/v2/voices?collection_id=O61D3sjuAajNAZz5xVCo&page_size=100
```

**Headers：**
```
xi-api-key: sk_你的API_KEY
Content-Type: application/json
```

### cURL 示例（可直接复制，替换 API Key）

```bash
curl -X GET "https://api.elevenlabs.io/v2/voices?collection_id=O61D3sjuAajNAZz5xVCo&page_size=100" \
  -H "xi-api-key: sk_你的API_KEY" \
  -H "Content-Type: application/json"
```

### 拉取全部「My Voices」（不按 Collection）

```
GET https://api.elevenlabs.io/v2/voices?page_size=100
```

### 分页：拉取下一页

若上一页响应里 `has_more === true`，则用返回的 `next_page_token` 请求下一页：

```
GET https://api.elevenlabs.io/v2/voices?collection_id=O61D3sjuAajNAZz5xVCo&page_size=100&next_page_token=上一页返回的token
```

---

## 5. 响应结构

### 成功响应（200）

```json
{
  "voices": [
    {
      "voice_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "Gravel Midnight",
      "category": "cloned",
      "labels": {
        "accent": "american",
        "age": "young",
        "gender": "male",
        "use_case": "narration",
        "descriptive": "deep, rough"
      },
      "description": "A deep, rough character voice...",
      "preview_url": "https://...",
      "collection_ids": ["O61D3sjuAajNAZz5xVCo"]
    }
  ],
  "has_more": false,
  "next_page_token": null,
  "page_size": 100
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `voices` | array | 当前页的音色列表 |
| `has_more` | boolean | 是否还有下一页 |
| `next_page_token` | string \| null | 有下一页时，下一请求需带此参数 |
| `page_size` | integer | 本页请求的 page_size |

### 单个 voice 对象常用字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `voice_id` | string | 音色 ID，TTS 时使用 |
| `name` | string | 音色名称 |
| `category` | string | 如 `premade` / `cloned` / `generated` / `professional` |
| `labels` | object | accent, age, gender, use_case, descriptive 等 |
| `description` | string | 描述 |
| `preview_url` | string | 试听 URL |
| `collection_ids` | string[] | 所属 Collection ID 列表 |

### 错误响应（4xx/5xx）

Body 为错误信息文本或 JSON，如未授权、Collection 不存在等。

---

## 6. 使用逻辑（分页拉全量）

1. 第一请求：`GET /v2/voices?collection_id=你的CollectionID&page_size=100`
2. 若响应 `has_more === true`：再请求一次，在 query 中加上 `next_page_token=响应里的 next_page_token`
3. 重复步骤 2，直到 `has_more === false`
4. 把所有页的 `voices` 数组合并，即该 Collection 下全部音色

伪代码：

```
all_voices = []
next_token = null
do {
  url = "/v2/voices?page_size=100"
  if collection_id: url += "&collection_id=" + collection_id
  if next_token: url += "&next_page_token=" + next_token
  resp = GET(url)
  all_voices.push(...resp.voices)
  next_token = resp.has_more ? resp.next_page_token : null
} while (next_token)
```

---

## 7. 本项目中的调用方式

代码里已封装为 `callElevenLabsV2VoicesAPI`（`src/config/api.js`）：

```javascript
import { callElevenLabsV2VoicesAPI } from './config/api';

// 只拉取指定 Collection
const result = await callElevenLabsV2VoicesAPI({
  collectionId: 'O61D3sjuAajNAZz5xVCo',
  pageSize: 100,  // 可选，默认 100
});

// result: { success, voices: [...], pageCount, duration, durationMs }
// 内部已自动处理分页，result.voices 为合并后的全量列表
```

不传 `collectionId` 则拉取账号下全部 My Voices（同样会自动分页）。

---

## 8. 参考

- 官方文档：[List voices (v2)](https://elevenlabs.io/docs/api-reference/voices/get-all)
- Collection ID 获取：ElevenLabs 网页 → Voice Lab → 点进你的 Collection → 地址栏 `collectionId=xxx`
