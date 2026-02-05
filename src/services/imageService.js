import { callFluxAPI } from '../config/api';

// 图生图服务 - 使用 Flux API（flux2.vivix.work）
// 更新：使用 seed 保持 ID 一致性，auto_size 自适应尺寸
export const imageService = {
  
  // 调用 Flux API 生成图片
  // onImageGenerated: 回调函数，每生成一张图就调用，参数 (image, index)
  async generateImage(formData, promptConfig, onImageGenerated = null) {
    const startTime = performance.now();
    
    const prompts = promptConfig.prompts || [];
    const styleLabels = promptConfig.styleLabels || [];
    
    console.log('🚀 开始调用 Flux 图生图 API...');
    console.log(`📝 共 ${prompts.length} 个风格需要生成`);
    
    try {
      // ===== 获取用户上传的图片（base64 格式）=====
      let imageBase64 = formData.uploadedImage;
      
      if (!imageBase64 || !imageBase64.startsWith('data:image')) {
        console.error('❌ 没有找到用户上传的图片');
        throw new Error('请先上传图片');
      }
      
      console.log('🖼️ 使用用户上传的 base64 图片');
      
      // ===== 生成统一 seed，保持所有图片的 ID 一致性 =====
      const baseSeed = Math.floor(Math.random() * 1000000);
      console.log(`🎲 Base Seed: ${baseSeed} (用于保持 ID 一致性)`);
      
      const results = [];
      
      // ===== 步骤 1: 图片 1 为原图（立即返回）=====
      console.log('📷 图片 1: 保留原图');
      const originalImage = {
        id: 1,
        url: imageBase64,  // 原图用 base64
        prompt: 'Original image',
        duration: '0.0s',
        type: 'original',
        label: 'Original',
      };
      results.push(originalImage);
      
      // 立即回调原图
      if (onImageGenerated) {
        onImageGenerated(originalImage, 0);
      }
      
      // ===== 步骤 2: 为每个 prompt 调用 Flux API =====
      for (let i = 0; i < prompts.length; i++) {
        const promptItem = prompts[i];
        const promptText = promptItem.prompt || promptItem;
        const styleLabel = styleLabels[i] || promptItem.style || `Style ${i + 1}`;
        
        console.log(`🎨 生成图片 ${i + 2}/${prompts.length + 1}: ${styleLabel}`);
        console.log(`   Prompt: ${promptText.substring(0, 60)}...`);
        
        // 使用统一的 base seed 保持 ID 一致性
        // 每个风格用 seed + i 确保不同但相关
        const result = await callFluxAPI(promptText, imageBase64, {
          seed: baseSeed,  // 使用相同 seed 保持 ID
          autoSize: true,   // 自动尺寸
        });
        
        if (result.success && result.imageBase64) {
          console.log(`✅ 图片 ${i + 2} 生成成功，耗时: ${result.duration}`);
          const generatedImage = {
            id: i + 2,
            url: result.imageBase64,  // Flux 返回 base64 或 URL
            imageUrl: result.imageUrl,  // 完整 URL（如果有）
            prompt: promptText,
            duration: result.duration,
            type: 'generated',
            style: styleLabel,
            label: styleLabel,
            seed: result.seed,
            jobId: result.jobId,
          };
          results.push(generatedImage);
          
          // 每生成一张就回调
          if (onImageGenerated) {
            onImageGenerated(generatedImage, i + 1);
          }
        } else {
          console.error(`❌ 图片 ${i + 2} 生成失败:`, result.error);
          const errorImage = {
            id: i + 2,
            url: null,
            prompt: promptText,
            error: result.error || '生成失败',
            type: 'error',
            style: styleLabel,
            label: styleLabel,
          };
          results.push(errorImage);
          
          // 失败也回调
          if (onImageGenerated) {
            onImageGenerated(errorImage, i + 1);
          }
        }
        
        // 避免请求过快
        if (i < prompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      const endTime = performance.now();
      const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
      
      const successCount = results.filter(r => r.url).length;
      console.log(`🎉 图片生成完成！成功 ${successCount}/${prompts.length + 1}（原图 1 张 + 风格迁移 ${prompts.length} 张），总耗时: ${totalDuration}s`);
      
      return {
        success: true,
        images: results,
        generatedImages: results,
        duration: totalDuration + 's',
        successCount,
        totalCount: prompts.length + 1,
        originalCount: 1,
        generatedCount: prompts.length,
        baseSeed: baseSeed,  // 返回使用的 seed
        isMock: false,
        modelId: 'flux-vivix',
      };
    } catch (error) {
      console.error('❌ 图生图服务异常:', error);
      return this.mockGenerate(formData, promptConfig);
    }
  },

  // 模拟生成（备用）
  async mockGenerate(formData, promptConfig) {
    console.log('🔧 使用模拟模式生成图片');
    
    const imageCount = promptConfig.prompts?.length || 3;
    
    const mockImages = [];
    // 原图
    mockImages.push({
      id: 1,
      url: formData.uploadedImage,
      prompt: 'Original',
      duration: '0.0s',
      type: 'original',
    });
    
    // 模拟生成图
    for (let i = 0; i < imageCount; i++) {
      mockImages.push({
        id: i + 2,
        url: formData.uploadedImage,
        prompt: promptConfig.prompts?.[i] || `Style ${i + 1}`,
        duration: '0.0s',
        type: 'mock',
        isMock: true,
      });
    }

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
    id: 'flux-vivix',
    name: 'Flux (vivix.work)',
    provider: 'Vivix',
    features: ['图生图', '风格迁移'],
  };
}
