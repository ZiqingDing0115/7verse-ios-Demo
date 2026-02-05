// API 配置文件 - Gemini + 7verse 图生图 + ElevenLabs 音色
// 所有 API Keys 通过环境变量配置，请参考 .env.example

export const API_CONFIG = {
  // Gemini API 配置（用于生成 Prompts）
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    model: 'gemini-2.0-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    timeout: 30000,
  },
  
  // 7verse 图生图 API 配置
  sevenVerse: {
    endpoint: '/api/7verse/gen/images',  // 通过 Vite 代理（uat.7verse.ai）
    token: import.meta.env.VITE_7VERSE_TOKEN || '',
    vendor: 'IMAGE_VENDOR_SEEDREAM',
    defaultSize: '2560x1440',  // 高清尺寸
    timeout: 60000,
  },

  // ElevenLabs 音色库 API 配置
  elevenLabs: {
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
    endpoint: 'https://api.elevenlabs.io/v1',
    timeout: 15000,
  },
};

// 调用 Gemini API
export async function callGeminiAPI(prompt, imageBase64 = null) {
  const startTime = performance.now();
  const { gemini } = API_CONFIG;
  
  try {
    const parts = [{ text: prompt }];
    
    if (imageBase64) {
      const base64Data = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64;
      
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64Data
        }
      });
    }
    
    const requestBody = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    };
    
    const url = `${gemini.endpoint}/${gemini.model}:generateContent?key=${gemini.apiKey}`;
    
    console.log('🤖 调用 Gemini API...', { model: gemini.model, hasImage: !!imageBase64 });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API 错误:', response.status, errorText);
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('Gemini 返回了空响应');
    }
    
    console.log(`✅ Gemini 响应成功，耗时: ${duration}s`);
    
    return {
      success: true,
      text: textResponse,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ Gemini API 调用失败:', error);
    
    return {
      success: false,
      error: error.message,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  }
}

// 调用 7verse 图生图 API
// 将 base64 转换为 Blob 文件对象
function base64ToBlob(base64Data) {
  // 解析 mime type
  const matches = base64Data.match(/^data:([^;]+);base64,/);
  const mimeType = matches ? matches[1] : 'image/jpeg';
  
  // 获取纯 base64 数据
  const pureBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  
  // 转换为二进制
  const byteCharacters = atob(pureBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  
  return { blob: new Blob([byteArray], { type: mimeType }), mimeType };
}

// 使用 7verse 后端上传图片获取 URL
export async function uploadImageToImgbb(base64Data) {
  console.log('📤 开始上传图片到 7verse 存储服务...');
  const startTime = performance.now();
  
  try {
    // 将 base64 转为 Blob
    const { blob, mimeType } = base64ToBlob(base64Data);
    console.log(`📦 文件大小: ${Math.round(blob.size / 1024)}KB, 类型: ${mimeType}`);
    
    // 确定文件扩展名
    const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    const fileName = `character_image.${extension}`;
    
    // 创建一个带有正确 MIME 类型的 File 对象
    const file = new File([blob], fileName, { type: mimeType });
    
    // 构建 FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mime_type', mimeType);  // 显式传递 mime_type
    
    console.log('📝 上传参数:', { fileName, mimeType });
    
    // 调用 7verse 存储 API（通过 Vite 代理）
    const response = await fetch('/api/7verse-storage/file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.sevenVerse.token}`,
      },
      body: formData,
    });
    
    const result = await response.json();
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    
    console.log('📨 7verse 存储响应:', response.status, JSON.stringify(result).substring(0, 200));
    
    // 处理各种成功响应格式
    if (result.ok && result.data?.url) {
      console.log(`✅ 7verse 上传成功，耗时: ${duration}s`);
      console.log('🔗 图片 URL:', result.data.url);
      return result.data.url;
    } else if (result.data?.success && result.data?.url) {
      console.log(`✅ 7verse 上传成功，耗时: ${duration}s`);
      console.log('🔗 图片 URL:', result.data.url);
      return result.data.url;
    } else if (result.url) {
      // 直接返回 url 的情况
      console.log(`✅ 7verse 上传成功，耗时: ${duration}s`);
      console.log('🔗 图片 URL:', result.url);
      return result.url;
    } else {
      console.error('❌ 7verse 上传失败:', result);
      console.error('❌ 错误信息:', result.data?.message || result.msg || '未知错误');
      return null;
    }
  } catch (error) {
    console.error('❌ 图片上传异常:', error);
    return null;
  }
}

// ============================================================================
// Flux API - 图生图（flux2.vivix.work）
// ============================================================================
// 更新：使用 seed 保持 ID 一致性，auto_size 自适应尺寸
// ============================================================================
export async function callFluxAPI(prompt, imageBase64, options = {}) {
  const startTime = performance.now();
  
  const {
    seed = null,           // 使用相同 seed 保持基础一致性（ID 保持）
    autoSize = true,       // 自动尺寸
    width = 1024,
    height = 1024,
  } = options;
  
  // 生成随机 seed（如果未指定）
  const useSeed = seed ?? Math.floor(Math.random() * 1000000);
  
  console.log('🎨 调用 Flux 图生图 API...');
  console.log(`📝 Prompt: ${prompt.substring(0, 60)}...`);
  console.log(`🎲 Seed: ${useSeed}${seed ? ' (固定)' : ' (随机)'}`);
  console.log(`📐 尺寸: ${autoSize ? '自适应' : `${width}x${height}`}`);
  
  try {
    const requestBody = {
      prompt: prompt,
      image: imageBase64,  // data:image/xxx;base64,xxx 格式
      seed: useSeed,
      auto_size: autoSize,
    };
    
    // 如果不使用自动尺寸，添加固定尺寸
    if (!autoSize) {
      requestBody.width = width;
      requestBody.height = height;
    }
    
    // 使用 Vite 代理解决 CORS 问题
    const response = await fetch('/api/flux/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      timeout: 120000,  // 2 分钟超时
    });
    
    const result = await response.json();
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    
    console.log('📨 Flux 响应:', response.status, result.success ? '成功' : '失败');
    
    // 支持两种返回格式：image_base64 或 image_url
    if (result.success) {
      let imageData = result.image_base64;
      
      // 如果返回的是 URL，需要获取完整地址
      if (!imageData && result.image_url) {
        const fullUrl = `https://flux2.vivix.work${result.image_url}`;
        console.log(`🔗 图片 URL: ${fullUrl}`);
        imageData = fullUrl;  // 返回 URL
      }
      
      if (imageData) {
        console.log(`✅ Flux 图生图成功，耗时: ${duration}s, job_id: ${result.job_id || '-'}`);
        return {
          success: true,
          imageBase64: imageData,  // 可能是 base64 或 URL
          imageUrl: result.image_url ? `https://flux2.vivix.work${result.image_url}` : null,
          jobId: result.job_id,
          seed: useSeed,
          duration: duration + 's',
        };
      }
    }
    
    console.error('❌ Flux API 失败:', result);
    return {
      success: false,
      error: result.error || result.message || '未知错误',
      duration: duration + 's',
    };
  } catch (error) {
    console.error('❌ Flux API 异常:', error);
    return {
      success: false,
      error: error.message,
      duration: '0s',
    };
  }
}

// ============================================================================
// 7verse API - 图生图（备用）
// ============================================================================
export async function call7verseAPI(imagePrompt, refImageUrl = null, count = 1) {
  const startTime = performance.now();
  const { sevenVerse } = API_CONFIG;
  
  try {
    const requestBody = {
      vendor: sevenVerse.vendor,
      image_prompt: imagePrompt,
      size: sevenVerse.defaultSize,
      count: count,
    };
    
    // 添加参考图片 URL（必须是 URL，不支持 base64）
    if (refImageUrl && refImageUrl.startsWith('http')) {
      requestBody.ref_image_url_list = [refImageUrl];
    }
    
    console.log('🎨 调用 7verse 图生图 API...', { 
      prompt: imagePrompt.substring(0, 50) + '...', 
      hasRefImage: !!requestBody.ref_image_url_list,
      count 
    });
    
    const response = await fetch(sevenVerse.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sevenVerse.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const responseText = await response.text();
    console.log('📨 7verse 响应:', response.status, responseText.substring(0, 200));
    
    if (!response.ok) {
      throw new Error(`7verse API Error: ${response.status} - ${responseText}`);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`响应解析失败: ${responseText}`);
    }
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ 7verse 图片生成成功，耗时: ${duration}s`);
    
    return {
      success: true,
      data: result,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ 7verse API 调用失败:', error);
    
    return {
      success: false,
      error: error.message,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  }
}

// 调用 ElevenLabs API 获取官方预设音色
export async function callElevenLabsOfficialAPI() {
  const startTime = performance.now();
  const { elevenLabs } = API_CONFIG;
  
  try {
    console.log('🎙️ 调用 ElevenLabs API 获取官方音色...');
    
    const response = await fetch(`${elevenLabs.endpoint}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': elevenLabs.apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs 官方音色 API 错误:', response.status, errorText);
      throw new Error(`ElevenLabs API Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ ElevenLabs 官方音色获取成功，耗时: ${duration}s，共 ${result.voices?.length || 0} 个音色`);
    
    return {
      success: true,
      voices: result.voices || [],
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ ElevenLabs 官方音色 API 调用失败:', error);
    
    return {
      success: false,
      error: error.message,
      voices: [],
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  }
}

// 调用 ElevenLabs API 获取社区共享音色库
export async function callElevenLabsSharedAPI() {
  const startTime = performance.now();
  const { elevenLabs } = API_CONFIG;
  
  try {
    console.log('🎙️ 调用 ElevenLabs API 获取社区音色...');
    
    const response = await fetch(`${elevenLabs.endpoint}/shared-voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': elevenLabs.apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs 社区音色 API 错误:', response.status, errorText);
      throw new Error(`ElevenLabs API Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ ElevenLabs 社区音色获取成功，耗时: ${duration}s，共 ${result.voices?.length || 0} 个音色`);
    
    return {
      success: true,
      voices: result.voices || [],
      hasMore: result.has_more || false,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ ElevenLabs 社区音色 API 调用失败:', error);
    
    return {
      success: false,
      error: error.message,
      voices: [],
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  }
}

// ============================================================================
// ElevenLabs TTS (Text-to-Speech) - 文字转语音
// ============================================================================
// 使用推荐的音色说出一段话，用于留住用户
// ============================================================================
export async function callElevenLabsTTS(voiceId, text) {
  const startTime = performance.now();
  const { elevenLabs } = API_CONFIG;
  
  try {
    console.log(`🎤 调用 ElevenLabs TTS...`);
    console.log(`   Voice ID: ${voiceId}`);
    console.log(`   Text: "${text}"`);
    
    const response = await fetch(`${elevenLabs.endpoint}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabs.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // 支持多语言的模型
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs TTS 错误:', response.status, errorText);
      throw new Error(`ElevenLabs TTS Error: ${response.status} - ${errorText}`);
    }
    
    // 返回的是音频流，转换为 Blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ ElevenLabs TTS 成功，耗时: ${duration}s`);
    
    return {
      success: true,
      audioUrl: audioUrl,
      audioBlob: audioBlob,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ ElevenLabs TTS 调用失败:', error);
    
    return {
      success: false,
      error: error.message,
      audioUrl: null,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  }
}

// ============================================================================
// 7verse Video Generation API - 图生视频 (Image-to-Video)
// ============================================================================
// 根据图片和音色样本生成视频
// ============================================================================
export async function callVideoGenAPI(imageUrl, voiceSampleUrl) {
  const startTime = performance.now();
  const { sevenVerse } = API_CONFIG;
  
  try {
    console.log('🎬 调用 7verse 视频生成 API...');
    console.log(`   Image URL: ${imageUrl.substring(0, 50)}...`);
    console.log(`   Voice Sample URL: ${voiceSampleUrl.substring(0, 50)}...`);
    
    const requestBody = {
      image_url: imageUrl,
      voice_sample_url: voiceSampleUrl,
    };
    
    const response = await fetch('/api/7verse/gen/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sevenVerse.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const result = await response.json();
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('📨 7verse 视频响应:', response.status, JSON.stringify(result).substring(0, 200));
    
    if (result.ok && result.data?.file_url) {
      console.log(`✅ 视频生成成功，耗时: ${duration}s`);
      console.log('🎥 视频 URL:', result.data.file_url);
      
      return {
        success: true,
        videoUrl: result.data.file_url,
        status: result.data.status,
        duration: `${duration}s`,
        durationMs: endTime - startTime,
      };
    } else {
      console.error('❌ 视频生成失败:', result);
      return {
        success: false,
        error: result.msg || result.message || '视频生成失败',
        duration: `${duration}s`,
        durationMs: endTime - startTime,
      };
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ 视频生成 API 调用失败:', error);
    
    return {
      success: false,
      error: error.message,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  }
}

// ============================================================================
// 7verse I2V API - 图生视频（Image to Video）
// ============================================================================
// 使用即梦/SeedDance 模型，根据首帧图片和 Prompt 生成视频
// ============================================================================
export async function callI2VAPI(firstFrameUrl, prompt, options = {}) {
  const startTime = performance.now();
  const { sevenVerse } = API_CONFIG;
  
  const {
    duration = 5,           // 视频时长 4-12 秒
    ratio = '9:16',         // 宽高比
    async: isAsync = true,  // 异步模式（推荐）
    generateAudio = false,  // 是否生成配音
    vendor = 'VIDEO_VENDOR_SEEDANCE',
  } = options;
  
  try {
    console.log('🎬 调用 I2V 图生视频 API...');
    console.log(`   首帧图片: ${firstFrameUrl.substring(0, 50)}...`);
    console.log(`   Prompt: ${prompt.substring(0, 50)}...`);
    console.log(`   时长: ${duration}s, 比例: ${ratio}`);
    
    const requestBody = {
      first_frame_url: firstFrameUrl,
      prompt: prompt,
      duration: duration,
      ratio: ratio,
      async: isAsync,
      generate_audio: generateAudio,
      vendor: vendor,
    };
    
    const response = await fetch('/api/7verse/gen/video/i2v', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sevenVerse.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const result = await response.json();
    const endTime = performance.now();
    const durationTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('📨 I2V 响应:', response.status, JSON.stringify(result).substring(0, 200));
    
    if (result.ok && result.data) {
      console.log(`✅ I2V 视频生成成功，耗时: ${durationTime}s`);
      
      return {
        success: true,
        videoUrl: result.data.file_url || result.data.video_url,
        taskId: result.data.task_id,  // 异步模式会返回 task_id
        status: result.data.status,
        duration: `${durationTime}s`,
        durationMs: endTime - startTime,
      };
    } else {
      console.error('❌ I2V 生成失败:', result);
      return {
        success: false,
        error: result.msg || result.message || 'I2V 生成失败',
        duration: `${durationTime}s`,
        durationMs: endTime - startTime,
      };
    }
  } catch (error) {
    const endTime = performance.now();
    const durationTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ I2V API 调用失败:', error);
    
    return {
      success: false,
      error: error.message,
      duration: `${durationTime}s`,
      durationMs: endTime - startTime,
    };
  }
}

// ============================================================================
// Qwen API - 大语言模型（支持流式输出）
// ============================================================================
// Qwen3-235B 模型，可选 thinking 模式
// ============================================================================
export async function callQwenAPI(messages, options = {}) {
  const startTime = performance.now();
  
  const {
    model = 'Qwen3-235B-A22B-GPTQ-Int4',
    stream = true,
    enableThinking = false,
    maxTokens = 2000,
    temperature = 0.7,
    onChunk = null,  // 流式回调函数
  } = options;
  
  try {
    console.log('🤖 调用 Qwen API...');
    console.log(`   模型: ${model}`);
    console.log(`   流式: ${stream}, Thinking: ${enableThinking}`);
    
    const requestBody = {
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
      stream: stream,
      chat_template_kwargs: {
        enable_thinking: enableThinking,
      },
    };
    
    const response = await fetch('/api/qwen/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error(`Qwen API Error: ${response.status}`);
    }
    
    // 流式处理
    if (stream) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim() === '[DONE]') continue;
            
            try {
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                // 调用回调函数（用于实时显示）
                if (onChunk) {
                  onChunk(content, fullContent);
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`✅ Qwen 流式响应完成，耗时: ${duration}s`);
      
      return {
        success: true,
        text: fullContent,
        duration: `${duration}s`,
        durationMs: endTime - startTime,
      };
    } else {
      // 非流式处理
      const result = await response.json();
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      const content = result.choices?.[0]?.message?.content || '';
      
      console.log(`✅ Qwen 响应成功，耗时: ${duration}s`);
      
      return {
        success: true,
        text: content,
        duration: `${duration}s`,
        durationMs: endTime - startTime,
      };
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ Qwen API 调用失败:', error);
    
    return {
      success: false,
      error: error.message,
      duration: `${duration}s`,
      durationMs: endTime - startTime,
    };
  }
}
