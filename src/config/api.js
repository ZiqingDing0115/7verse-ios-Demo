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
    
    // 构建 FormData
    const formData = new FormData();
    formData.append('file', blob, 'character_image.jpg');
    formData.append('mime_type', mimeType);
    
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
    
    if (result.ok && result.data?.url) {
      console.log(`✅ 7verse 上传成功，耗时: ${duration}s`);
      console.log('🔗 图片 URL:', result.data.url);
      return result.data.url;
    } else if (result.data?.success && result.data?.url) {
      console.log(`✅ 7verse 上传成功，耗时: ${duration}s`);
      console.log('🔗 图片 URL:', result.data.url);
      return result.data.url;
    } else {
      console.error('❌ 7verse 上传失败:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ 图片上传异常:', error);
    return null;
  }
}

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
