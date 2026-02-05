# 🎯 图生图 Prompt 最佳实践

> 📅 最后更新：2026-02-04 22:05:00  
> 🏷️ 版本：v1.0  
> 📁 对应代码：`src/services/aiService.js`

---

## 📌 必须包含的固定元素

### ✅ Prompt 开头（保持人物ID）
```
same person, same face, same identity,
```
**作用**：确保风格迁移后人物身份一致

### ✅ Prompt 结尾（干净输出）
```
clean background, no text, no watermark
```
**作用**：避免生成杂乱背景、文字、水印

---

## 📌 Prompt 完整格式

```
same person, same face, same identity, [艺术风格 + 3-5个描述词], clean background, no text, no watermark
```

**示例**：
```
same person, same face, same identity, anime portrait cel shading vibrant colors Studio Ghibli, clean background, no text, no watermark
```

---

## 📌 风格多样性规则

### ❌ 错误示例（风格雷同）
```
1. anime portrait...
2. manga style...
3. cartoon illustration...
```
问题：三个都是「数字艺术/动漫」类别，视觉效果相似

### ✅ 正确示例（风格差异化）
```
1. anime portrait cel shading vibrant colors...  (数字艺术)
2. Renaissance oil painting dramatic chiaroscuro...  (传统绘画)
3. cyberpunk neon blue pink lights Blade Runner...  (风格化)
```
特点：三种完全不同的艺术媒介

---

## 📌 艺术风格分类参考

| 类别 | 风格示例 |
|------|---------|
| **传统绘画** | oil painting, watercolor, impressionist, Renaissance, Baroque |
| **数字艺术** | anime, manga, 3D render, pixel art, video game art |
| **摄影风格** | film noir, Vogue editorial, vintage film, glamour shot |
| **插画风格** | pop art, comic book, cartoon, vector art, sketch |
| **风格化** | cyberpunk neon, vaporwave, retro 80s, gothic, steampunk |

---

## 📌 标签传参规则

### ❌ 不要这样传（大类归纳）
```
Tag category: Playful/Fun type
```
问题：AI 理解模糊，可能重复选择相似风格

### ✅ 应该这样传（具体标签）
```
1. Playful
2. Sarcastic  
3. Mischievous
4. Roommate
```
特点：逐个列出，让 AI 理解每个标签的具体含义

---

## 📌 AI 推荐标签展示规则

1. **同一页面的标签应互斥**：避免展示意义相近的标签
2. **AI 推荐的标签绝对不能有风格重叠**
3. **Shuffle 时要保证多样性**：不同类别的标签应均匀分布

---

## 📌 测试验证清单

| 检查项 | 状态 |
|--------|:----:|
| 三张图风格是否明显不同？ | ☐ |
| 人物 ID 是否保持一致？ | ☐ |
| 是否有文字/水印出现？ | ☐ |
| 背景是否干净？ | ☐ |
| 风格是否匹配用户标签的 vibe？ | ☐ |

---

## 📋 版本历史

| 版本 | 时间 | 改动 |
|-----|------|------|
| v1.0 | 2026-02-04 22:05 | 初版：固定元素、风格多样性规则、标签传参规则 |
