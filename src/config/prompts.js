// Prompt 配置文件 - 你可以在这里修改和测试不同的 prompt

export const PROMPT_TEMPLATES = {
  // 图生图的 prompt 模板
  imageToImage: {
    // 基础 prompt
    base: "high quality, detailed, professional",
    
    // 风格 prompt（对应 4 种风格图）
    styles: [
      "neon cyberpunk style, vibrant colors, futuristic lighting",
      "oil painting style, artistic, classic art",
      "photorealistic, natural lighting, candid photo",
      "anime style, cel shading, vibrant colors",
    ],
    
    // 负面 prompt
    negative: "low quality, blurry, distorted, ugly, bad anatomy",
  },
  
  // 角色描述生成的 prompt 模板
  characterDescription: {
    template: `Based on the following persona tags: {tags}, generate a poetic character description in English. 
The description should be 1-2 sentences, evocative and atmospheric.`,
  },
  
  // 角色名字生成的 prompt 模板
  characterName: {
    template: `Based on these persona traits: {tags}, suggest a suitable character name. 
Just return the name, nothing else.`,
  },
};

// 构建完整的图生图 prompt
export function buildImageToImagePrompt(formData) {
  const { selectedStyleIndex, selectedTags } = formData;
  
  // 获取风格 prompt
  const stylePrompt = PROMPT_TEMPLATES.imageToImage.styles[selectedStyleIndex] || '';
  
  // 基础 prompt
  const basePrompt = PROMPT_TEMPLATES.imageToImage.base;
  
  // 可以根据标签添加额外的 prompt（这里只是示例）
  const tagPrompts = selectedTags.map(tagId => {
    // 这里可以根据 tagId 返回对应的 prompt 片段
    return '';
  }).filter(Boolean).join(', ');
  
  // 组合完整 prompt
  const fullPrompt = [basePrompt, stylePrompt, tagPrompts]
    .filter(Boolean)
    .join(', ');
  
  return {
    prompt: fullPrompt,
    negative_prompt: PROMPT_TEMPLATES.imageToImage.negative,
  };
}

// 构建 API 请求数据
export function buildAPIRequest(formData) {
  const { uploadedImage, selectedStyleIndex } = formData;
  const prompts = buildImageToImagePrompt(formData);
  
  return {
    // 根据你使用的 API 调整这个结构
    image: uploadedImage, // base64 图片
    prompt: prompts.prompt,
    negative_prompt: prompts.negative_prompt,
    style_index: selectedStyleIndex,
    // 其他参数...
    strength: 0.75, // 图生图强度
    guidance_scale: 7.5,
    num_inference_steps: 50,
  };
}
