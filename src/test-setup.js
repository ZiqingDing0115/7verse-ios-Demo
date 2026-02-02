// 测试工具初始化 - Gemini + 7verse

import { imageService, getCurrentModel } from './services/imageService';
import { aiService } from './services/aiService';

console.log('');
console.log('🚀 AI 图片生成服务已配置');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📋 当前配置:');
console.log('  • Prompt 生成: Gemini 2.0 Flash');
console.log('  • 图生图: 7verse Seedream');
console.log('  • 模型:', getCurrentModel().name);
console.log('');
console.log('📝 测试流程:');
console.log('  1. Step 1: 上传图片');
console.log('  2. Step 2: 选择 7 个标签');
console.log('  3. Step 3: 自动生成 4 张风格图');
console.log('  4. Step 4: 查看预览结果');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 导出测试工具到浏览器控制台
window.testTools = {
  imageService,
  aiService,
  getCurrentModel,
  
  // 测试 Gemini Prompt 生成
  async testGeminiPrompts(tags = ['Professional', 'Creative', 'Warm']) {
    console.log('🧪 测试 Gemini Prompt 生成...');
    console.log('  输入标签:', tags);
    
    const result = await aiService.generateImagePrompts(null, tags);
    
    if (result.success) {
      console.log('✅ 成功生成 Prompts:');
      result.prompts.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.substring(0, 80)}...`);
      });
      console.log('  方法:', result.method);
      console.log('  耗时:', result.duration);
    } else {
      console.error('❌ 生成失败:', result.error);
    }
    
    return result;
  },
  
  // 测试 7verse API
  async test7verseAPI(prompt = 'a beautiful landscape, cinematic lighting, 8k') {
    console.log('🧪 测试 7verse API...');
    console.log('  Prompt:', prompt);
    
    const { call7verseAPI } = await import('./config/api');
    const result = await call7verseAPI(prompt, null, 1);
    
    if (result.success) {
      console.log('✅ 生成成功！');
      console.log('  响应数据:', result.data);
      console.log('  耗时:', result.duration);
    } else {
      console.error('❌ 生成失败:', result.error);
    }
    
    return result;
  },
  
  // 测试完整流程
  async testFullFlow(imageUrl, tags = ['Professional', 'Creative', 'Warm', 'Modern']) {
    console.log('🧪 测试完整图片生成流程...');
    
    // 1. 生成 Prompts
    console.log('📝 Step 1: 生成 Prompts...');
    const promptResult = await aiService.generateImagePrompts(null, tags);
    
    if (!promptResult.success) {
      console.error('❌ Prompt 生成失败');
      return promptResult;
    }
    
    // 2. 调用图生图 API
    console.log('🎨 Step 2: 调用 7verse 图生图...');
    const formData = {
      uploadedImageUrl: imageUrl,
      selectedTags: tags,
    };
    
    const imageResult = await imageService.generateImage(formData, promptResult.prompts);
    
    console.log('');
    console.log('📊 测试结果:');
    console.log('  Prompt 方法:', promptResult.method);
    console.log('  Prompt 耗时:', promptResult.duration);
    console.log('  图片生成:', imageResult.success ? '成功' : '失败');
    console.log('  成功数量:', imageResult.successCount || 0);
    console.log('  总耗时:', imageResult.duration);
    
    return { promptResult, imageResult };
  },
  
  // 帮助
  help() {
    console.log('');
    console.log('🎮 可用命令:');
    console.log('');
    console.log('  testTools.testGeminiPrompts(tags)');
    console.log('    测试 Gemini Prompt 生成');
    console.log('    示例: testTools.testGeminiPrompts(["Creative", "Warm"])');
    console.log('');
    console.log('  testTools.test7verseAPI(prompt)');
    console.log('    单独测试 7verse 图生图');
    console.log('    示例: testTools.test7verseAPI("a cat, cute, 8k")');
    console.log('');
    console.log('  testTools.testFullFlow(imageUrl, tags)');
    console.log('    测试完整流程（Prompt + 图生图）');
    console.log('    示例: testTools.testFullFlow("https://...", ["Creative"])');
    console.log('');
  }
};

console.log('🎮 测试工具已加载: window.testTools');
console.log('   输入 testTools.help() 查看命令');
console.log('');
