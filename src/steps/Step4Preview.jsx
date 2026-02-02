import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import StepLayout from '../components/StepLayout';
import { aiService } from '../services/aiService';

// 第四步：预览和发布
const Step4Preview = () => {
  const { formData, updateFormData } = useAppContext();
  const [characterName, setCharacterName] = useState(''); // 空白，等待 AI 生成
  const [description, setDescription] = useState(''); // 空白，等待 AI 生成
  const [persona, setPersona] = useState('');
  const [visibility, setVisibility] = useState('Everyone');
  
  // AI 视频 Prompt 状态
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoData, setVideoData] = useState(formData.videoData || null);

  // 使用用户选择的标签作为 hashtags
  const hashtags = formData.selectedTagLabels || ['Seeker', 'InnerVoice', 'Awakening', 'Listener'];

  // 当角色名称改变时，更新 Persona 描述
  useEffect(() => {
    if (formData.selectedTagLabels && formData.selectedTagLabels.length > 0) {
      const tags = formData.selectedTagLabels.slice(0, 3).join(' and ');
      setPersona(`${characterName} is ${tags.toLowerCase()}.`);
    }
  }, [characterName, formData.selectedTagLabels]);

  // 组件加载时，生成视频 Prompt
  useEffect(() => {

    // 调用 AI 生成视频 Prompt
    const generateVideoPrompt = async () => {
      // 如果已经生成过，跳过
      if (formData.videoData) {
        setVideoData(formData.videoData);
        return;
      }

      setIsGeneratingVideo(true);
      console.log('🎬 开始调用 Gemini 生成视频 Prompt...');

      try {
        // 获取所需数据
        const imageDescription = formData.selectedImagePrompt || 'A stylized portrait';
        const voiceInfo = formData.selectedVoiceInfo || { id: 'lively-woman', name: 'Lively woman' };
        const tagLabels = formData.selectedTagLabels || [];

        console.log('📝 视频 Prompt 输入数据:');
        console.log('   图片描述:', imageDescription);
        console.log('   音色信息:', voiceInfo);
        console.log('   标签:', tagLabels);

        const result = await aiService.generateVideoPrompt(
          imageDescription,
          voiceInfo,
          tagLabels
        );

        if (result.success && result.videoData) {
          console.log('✅ Gemini 生成的视频数据:');
          console.log('   推荐名称:', result.videoData.suggested_name);
          console.log('   脚本 ID:', result.videoData.selected_script_id);
          console.log('   脚本文本:', result.videoData.script_text);
          console.log('   视频 Prompt:', result.videoData.video_model_prompt);
          console.log('   推理理由:', result.videoData.reasoning);
          console.log('   耗时:', result.duration);

          setVideoData(result.videoData);
          updateFormData('videoData', result.videoData);
          
          // 用 AI 生成的名称更新角色名
          if (result.videoData.suggested_name) {
            setCharacterName(result.videoData.suggested_name);
          }
          
          // 用生成的脚本更新描述
          if (result.videoData.script_text) {
            setDescription(result.videoData.script_text);
          }
        }
      } catch (error) {
        console.error('❌ 视频 Prompt 生成失败:', error);
      } finally {
        setIsGeneratingVideo(false);
      }
    };

    generateVideoPrompt();
  }, []);

  return (
    <StepLayout showNext={false}>
      <div className="h-full flex flex-col overflow-y-auto px-8 pt-2">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center mb-4">
          <button className="text-white text-2xl">←</button>
          <h2 className="text-xl font-semibold text-white">Preview</h2>
          <button 
            onClick={() => {
              if (confirm('确定要退出吗？当前进度将会丢失。')) {
                window.location.reload();
              }
            }}
            className="text-white text-3xl font-light hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>

        {/* 角色图片 */}
        <div className="flex justify-center mb-6">
          <div className="w-48 h-64 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500 rounded-[2rem] overflow-hidden relative">
            {formData.generatedImage || formData.uploadedImage ? (
              <>
                <img
                  src={formData.generatedImage || formData.uploadedImage}
                  alt="Character"
                  className="w-full h-full object-cover"
                />
                {formData.generatedImage && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    AI
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm opacity-60">
                预览图
              </div>
            )}
          </div>
        </div>

        {/* 角色名称 - 可编辑 */}
        <div className="mb-4">
          {isGeneratingVideo ? (
            <div className="shimmer-line h-9 w-full max-w-xs rounded-lg"></div>
          ) : (
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="输入角色名称..."
              className="text-3xl font-bold text-white bg-transparent border-b-2 border-gray-700 focus:border-purple-500 outline-none w-full transition-colors placeholder:text-gray-600"
            />
          )}
        </div>

        {/* 描述/脚本 - 可编辑 */}
        <div className="mb-6">
          {isGeneratingVideo ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-300 mb-2">
                <div className="shimmer-circle w-4 h-4"></div>
                <span className="text-sm">✨ AI 正在生成...</span>
              </div>
              <div className="shimmer-line h-4 w-full"></div>
              <div className="shimmer-line h-4 w-5/6"></div>
              <div className="shimmer-line h-4 w-3/4"></div>
            </div>
          ) : (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入角色描述..."
              rows={3}
              className="w-full text-gray-300 text-base leading-relaxed bg-transparent border border-gray-700 focus:border-purple-500 rounded-lg p-3 outline-none resize-none transition-colors placeholder:text-gray-600"
            />
          )}
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-gray-800/60 text-gray-300 rounded-full text-sm font-medium"
            >
              # {tag}
            </span>
          ))}
        </div>

        {/* Persona 区域 - Shimmer Effect */}
        <div className="mb-6">
          <h3 className="text-white font-bold text-lg mb-3">Persona</h3>
          <div className="bg-gray-800/60 rounded-3xl p-4">
            {isGeneratingVideo ? (
              <div className="space-y-2">
                <div className="shimmer-line h-3 w-3/4"></div>
                <div className="shimmer-line h-3 w-1/2"></div>
              </div>
            ) : persona ? (
              <p className="text-gray-300 text-sm leading-relaxed">
                {persona}
              </p>
            ) : (
              <div className="h-4 w-2/3 bg-gray-700/30 rounded"></div>
            )}
          </div>
        </div>

        {/* Video Prompt 只在控制台展示，不在 UI 显示 */}

        {/* 可见性设置 */}
        <div className="mb-6">
          <div className="flex justify-between items-center py-2">
            <h3 className="text-white font-bold text-lg">Who can view</h3>
            <button className="flex items-center gap-2 text-gray-300 text-base">
              <span>{visibility}</span>
              <span className="text-xl">›</span>
            </button>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-4 mb-6">
          <button className="flex-1 py-4 bg-gray-800/60 text-white rounded-full font-bold text-base">
            Save draft
          </button>
          <button className="flex-1 py-4 bg-white text-black rounded-full font-bold text-base">
            Publish
          </button>
        </div>

        {/* 数据摘要（开发用） */}
        <div className="mt-2 p-3 bg-gray-900 rounded-lg">
          <p className="text-gray-400 text-[10px] mb-2 font-semibold">📊 调试信息：</p>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-gray-400">原图:</span>
              <span className="text-gray-300">{formData.uploadedImage ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">生成图:</span>
              <span className="text-gray-300">{formData.generatedImage ? '✅' : '⏳'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">标签:</span>
              <span className="text-gray-300">{formData.selectedTagLabels?.slice(0, 3).join(', ') || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">风格:</span>
              <span className="text-gray-300">{formData.selectedStyleIndex ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">音色:</span>
              <span className="text-gray-300">{formData.selectedVoice || '默认'}</span>
            </div>
            {formData.aiRecommendedVoice && (
              <div className="flex justify-between">
                <span className="text-gray-400">AI推荐音色:</span>
                <span className="text-purple-300">{formData.aiRecommendedVoice}</span>
              </div>
            )}
            {formData.generationTime && (
              <div className="flex justify-between">
                <span className="text-gray-400">图片耗时:</span>
                <span className="text-green-400 font-semibold">{formData.generationTime}</span>
              </div>
            )}
            {videoData && (
              <div className="flex justify-between">
                <span className="text-gray-400">脚本ID:</span>
                <span className="text-purple-300">{videoData.selected_script_id}</span>
              </div>
            )}
            {formData.isMockGeneration && (
              <div className="mt-2 p-2 bg-yellow-900 bg-opacity-30 rounded text-yellow-400 text-[9px]">
                ⚠️ 模拟模式
              </div>
            )}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step4Preview;
