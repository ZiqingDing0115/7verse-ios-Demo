import { call7verseAPI, uploadImageToImgbb } from '../config/api';

// 图生图服务 - 使用 7verse API
export const imageService = {
  // 调用 7verse API 生成 4 张风格图
  async generateImage(formData, prompts) {
    const startTime = performance.now();
    
    console.log('🚀 开始调用 7verse 图生图 API...');
    console.log('📝 Prompts 数量:', prompts.length);
    
    try {
      const TEST_IMAGE_URL = 'https://p02-be-dev-1305923417.cos.accelerate.myqcloud.com/creator/images/3fe7f8d9-61eb-4f8d-8f63-96b07c7b0500/20260115/a2eeef40.png';
      
      // ===== 步骤 1: 预先上传用户图片获取 URL =====
      // 7verse 只支持 ref_image_url_list，不支持 base64
      let refImageUrl = null;
      
      if (formData.uploadedImage && formData.uploadedImage.startsWith('data:image')) {
        console.log('🖼️ 检测到用户上传的 base64 图片，正在上传到图床...');
        refImageUrl = await uploadImageToImgbb(formData.uploadedImage);
        
        if (refImageUrl) {
          console.log('✅ 用户图片上传成功！URL:', refImageUrl.substring(0, 60) + '...');
          // 保存 URL 供后续使用（避免重复上传）
          formData.uploadedImageUrl = refImageUrl;
        } else {
          console.warn('⚠️ 图片上传失败，将使用测试图片');
          refImageUrl = TEST_IMAGE_URL;
        }
      } else if (formData.uploadedImageUrl) {
        console.log('🖼️ 使用已有的图片 URL:', formData.uploadedImageUrl.substring(0, 60) + '...');
        refImageUrl = formData.uploadedImageUrl;
      } else {
        console.log('⚠️ 无用户图片，使用测试图片进行图生图');
        refImageUrl = TEST_IMAGE_URL;
      }
      
      console.log('🔗 最终使用的参考图片 URL:', refImageUrl);
      
      const results = [];
      
      // ===== 步骤 2: 串行生成 4 张图片（复用同一个 URL） =====
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        console.log(`🎨 生成图片 ${i + 1}/${prompts.length}...`);
        console.log(`   Prompt: ${prompt.substring(0, 60)}...`);
        
        // 直接传 URL，不再传 base64
        const result = await call7verseAPI(prompt, refImageUrl, 1);
        
        if (result.success && result.data) {
          // 解析 7verse 返回的图片数据
          const imageUrl = this.extractImageUrl(result.data);
          
          if (imageUrl) {
            console.log(`✅ 图片 ${i + 1} 生成成功，耗时: ${result.duration}`);
            results.push({
              id: i + 1,
              url: imageUrl,
              prompt: prompt,
              duration: result.duration,
              type: 'generated',
            });
          } else {
            console.warn(`⚠️ 图片 ${i + 1} 返回数据异常:`, result.data);
            results.push({
              id: i + 1,
              url: null,
              prompt: prompt,
              error: '返回数据异常',
              type: 'error',
            });
          }
        } else {
          console.error(`❌ 图片 ${i + 1} 生成失败:`, result.error);
          results.push({
            id: i + 1,
            url: null,
            prompt: prompt,
            error: result.error || '生成失败',
            type: 'error',
          });
        }
        
        // 等待 500ms 避免请求过快
        if (i < prompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const endTime = performance.now();
      const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
      
      const successCount = results.filter(r => r.url).length;
      console.log(`🎉 图片生成完成！成功 ${successCount}/${prompts.length}，总耗时: ${totalDuration}s`);
      
      return {
        success: true,
        images: results,
        generatedImages: results,
        duration: totalDuration + 's',
        successCount,
        totalCount: prompts.length,
        isMock: false,
        modelId: '7verse-seedream',
      };
    } catch (error) {
      console.error('❌ 图生图服务异常:', error);
      return this.mockGenerate(formData, prompts);
    }
  },

  // 从 7verse 响应中提取图片 URL
  extractImageUrl(responseData) {
    if (!responseData) return null;
    
    // 7verse UAT 返回格式:
    // { ok: true, data: { image_list: [{ image_id: "...", image_url: "..." }] } }
    
    // 优先处理 7verse 的标准格式
    if (responseData.ok && responseData.data?.image_list?.length > 0) {
      const img = responseData.data.image_list[0];
      console.log('✅ 解析 7verse image_list 格式:', img.image_url);
      return img.image_url || img.url;
    }
    
    // data.image_list 格式（不带 ok 字段）
    if (responseData.data?.image_list?.length > 0) {
      const img = responseData.data.image_list[0];
      return img.image_url || img.url;
    }
    
    // image_list 格式
    if (responseData.image_list?.length > 0) {
      const img = responseData.image_list[0];
      return img.image_url || img.url;
    }
    
    // 其他可能的格式
    if (responseData.images && responseData.images.length > 0) {
      const img = responseData.images[0];
      return typeof img === 'string' ? img : (img.url || img.image_url);
    }
    
    if (responseData.data?.images && responseData.data.images.length > 0) {
      const img = responseData.data.images[0];
      return typeof img === 'string' ? img : (img.url || img.image_url);
    }
    
    if (responseData.result?.images && responseData.result.images.length > 0) {
      const img = responseData.result.images[0];
      return typeof img === 'string' ? img : (img.url || img.image_url);
    }
    
    if (responseData.url) return responseData.url;
    if (responseData.image_url) return responseData.image_url;
    if (responseData.image) return responseData.image;
    
    // 如果响应本身是数组
    if (Array.isArray(responseData) && responseData.length > 0) {
      const img = responseData[0];
      return typeof img === 'string' ? img : (img.url || img.image_url);
    }
    
    console.warn('⚠️ 无法解析图片 URL，原始数据:', JSON.stringify(responseData).substring(0, 200));
    return null;
  },

  // 模拟生成（备用）
  async mockGenerate(formData, prompts) {
    console.log('🔧 使用模拟模式生成图片');
    
    const mockImages = prompts.map((prompt, index) => ({
      id: index + 1,
      url: formData.uploadedImage,
      prompt: prompt,
      duration: '0.0s',
      type: 'mock',
      isMock: true,
    }));

    return {
      success: true,
      images: mockImages,
      generatedImages: mockImages,
      duration: '0.0s',
      isMock: true,
      message: '使用模拟数据（API 不可用时的备用方案）',
    };
  },

  // 转换图片为 base64
  async imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // 从摄像头捕获图片
  async captureFromCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      return stream;
    } catch (error) {
      console.error('无法访问摄像头:', error);
      throw new Error('无法访问摄像头，请检查权限设置');
    }
  },
};

// 获取当前使用的模型信息
export function getCurrentModel() {
  return {
    id: '7verse-seedream',
    name: '7verse Seedream',
    provider: '7verse',
    features: ['文生图', '图生图'],
  };
}
