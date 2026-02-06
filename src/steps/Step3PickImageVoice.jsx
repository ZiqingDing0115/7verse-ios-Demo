import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import StepLayout from '../components/StepLayout';
import { imageService } from '../services/imageService';
import { aiService } from '../services/aiService';
import { callElevenLabsTTS } from '../config/api';

// 第三步：选择风格图和音色
const Step3PickImageVoice = () => {
  const { formData, updateFormData, nextStep, prevStep, voiceLibrary, voiceLibraryLoading } = useAppContext();
  const [view, setView] = useState('image'); // 'image' 或 'voice'
  const [selectedImageIndex, setSelectedImageIndex] = useState(formData.selectedStyleIndex ?? null);
  // 优先使用用户选择的音色，其次使用 AI 推荐的音色
  const [selectedVoice, setSelectedVoice] = useState(
    formData.selectedVoice ?? formData.aiRecommendedVoice ?? null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(null);
  const [generatedImages, setGeneratedImages] = useState(formData.generatedImages || []);
  const [generationError, setGenerationError] = useState(null);
  
  // 音频播放状态
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef(null);
  const hasStartedGeneration = useRef(false); // 防止重复生成（React StrictMode）
  const voiceFileInputRef = useRef(null); // 音色文件上传 input
  
  // 克隆音色状态
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [clonedVoiceUrl, setClonedVoiceUrl] = useState(formData.clonedVoiceUrl || null);
  const [clonedVoiceName, setClonedVoiceName] = useState(formData.clonedVoiceName || null);
  
  // 音色推荐状态 - 从 Step 2 的 formData 获取（不再在此处调用 AI）
  const aiRecommendedVoice = formData.aiRecommendedVoice || null;
  const aiVoiceReasoning = formData.aiVoiceReasoning || '';

  // 当 AI 推荐的音色更新时，自动选中并播放预览
  useEffect(() => {
    if (aiRecommendedVoice && !selectedVoice) {
      setSelectedVoice(aiRecommendedVoice);
      updateFormData('selectedVoice', aiRecommendedVoice);
      
      // 自动播放 AI 推荐音色的预览（如果音色库已加载）
      if (voiceLibrary && voiceLibrary.length > 0) {
        const recommendedVoice = voiceLibrary.find(v => v.id === aiRecommendedVoice);
        if (recommendedVoice) {
          console.log('🎙️ 自动播放 AI 推荐音色:', recommendedVoice.name);
          // 延迟一点播放，让用户有心理准备
          setTimeout(() => {
            playVoicePreview(recommendedVoice);
          }, 500);
        }
      }
    }
  }, [aiRecommendedVoice, voiceLibrary]);



  // 播放音色预览（可被自动播放调用）
  const playVoicePreview = (voice) => {
    if (!voice?.previewUrl) {
      console.warn('⚠️ 该音色没有预览音频:', voice?.name);
      return;
    }

    // 停止当前播放的音频
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // 创建新的音频并播放
    setIsAudioLoading(true);
    setPlayingVoiceId(voice.id);
    
    const audio = new Audio(voice.previewUrl);
    audioRef.current = audio;
    
    audio.oncanplaythrough = () => {
      setIsAudioLoading(false);
      audio.play().catch(err => {
        console.error('❌ 音频播放失败:', err);
        setPlayingVoiceId(null);
      });
    };
    
    audio.onended = () => {
      setPlayingVoiceId(null);
    };
    
    audio.onerror = (err) => {
      console.error('❌ 音频加载失败:', err);
      setIsAudioLoading(false);
      setPlayingVoiceId(null);
    };
    
    audio.load();
  };

  // 风格图数据（从生成结果获取，或显示占位图）
  // 第一张始终是原图，后 3 张是生成的风格图
  // 支持逐步生成：每生成一张图就更新 UI
  const styleImages = (() => {
    // 构建 4 个位置的数组
    const result = [];
    
    // 位置 0：原图（始终显示）
    if (generatedImages[0] && generatedImages[0].url) {
      result.push(generatedImages[0]);
    } else if (formData.uploadedImage) {
      result.push({ id: 0, url: formData.uploadedImage, type: 'original', label: 'Original' });
    } else {
      result.push({ id: 0, url: null, type: 'placeholder' });
    }
    
    // 位置 1-3：风格图（逐步显示，未生成的显示占位符）
    for (let i = 1; i <= 3; i++) {
      if (generatedImages[i] && generatedImages[i].url) {
        result.push(generatedImages[i]);
      } else {
        result.push({ id: i, url: null, type: 'placeholder', label: `Style ${i}` });
      }
    }
    
    return result;
  })();

  // 使用 Context 中缓存的 ElevenLabs 音色库
  const voices = voiceLibrary;

  const voiceCategories = ['All', 'Male', 'Female', 'Warm', 'Calm', 'Energetic'];

  // 组件加载时自动生成图片
  useEffect(() => {
    // 如果已经有生成的图片，就不用再生成了
    if (formData.generatedImages && formData.generatedImages.length > 0) {
      console.log('✅ 已有生成的图片，跳过生成');
      setGeneratedImages(formData.generatedImages);
      return;
    }

    // 防止 React StrictMode 导致的重复调用
    if (hasStartedGeneration.current) {
      console.log('⚠️ 图片生成已在进行中，跳过重复调用');
      return;
    }
    hasStartedGeneration.current = true;

    // 自动开始生成图片
    generateStyleImages();
  }, []); // 只在组件首次加载时执行

  // 清理音频播放
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 播放/暂停音色预览（用户点击按钮）
  const handlePlayVoice = async (e, voice) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发选择
    
    // 如果没有 previewUrl，使用 TTS 生成预览
    if (!voice.previewUrl) {
      console.log('🎤 没有预览URL，使用TTS生成预览:', voice.name);
      setIsAudioLoading(true);
      setPlayingVoiceId(voice.id);
      
      try {
        const ttsResult = await callElevenLabsTTS(voice.id, `Hi, I'm ${voice.name}. Nice to meet you!`);
        if (ttsResult.success && ttsResult.audioUrl) {
          const audio = new Audio(ttsResult.audioUrl);
          audioRef.current = audio;
          audio.onended = () => {
            setPlayingVoiceId(null);
          };
          audio.play();
        }
      } catch (error) {
        console.error('TTS预览失败:', error);
      } finally {
        setIsAudioLoading(false);
      }
      return;
    }

    // 如果正在播放同一个音色，则暂停
    if (playingVoiceId === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingVoiceId(null);
      return;
    }

    // 播放新的音色
    playVoicePreview(voice);
  };

  // 重新生成风格图片（用于 Regenerate 按钮）
  const handleRegenerate = async () => {
    console.log('🔄 用户请求重新生成图片...');
    console.log('🗑️ 清除所有缓存数据，重新调用 AI...');
    
    // 清除当前生成的图片（保留原图）
    setGeneratedImages(prev => {
      const original = prev[0];
      return original ? [original] : [];
    });
    
    // 清除 formData 中的所有图片相关缓存
    updateFormData('generatedImages', null);
    updateFormData('stylePrompts', null);  // 清除缓存的 Prompts
    updateFormData('generationTime', null);
    
    // 重置生成标记
    hasStartedGeneration.current = false;
    
    // 开始重新生成
    await generateStyleImages();
  };

  // 生成风格图片的函数
  const generateStyleImages = async () => {
    setIsGenerating(true);
    setGenerationTime(null);
    setGenerationError(null);

    try {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🚀 开始图片生成流程');
      console.log('═══════════════════════════════════════════════════════════════');
      
      // ===== 可复制的用户选择标签日志 =====
      const personaTagIds = formData.selectedPersonaTags || [];
      const relationshipTagId = formData.selectedRelationship;
      const tagLabels = formData.selectedTagLabels || [];
      
      // 获取标签文本（用于显示）
      const personaLabels = tagLabels.filter((_, i) => i < personaTagIds.length);
      const relationshipLabel = relationshipTagId ? tagLabels[tagLabels.length - 1] : null;
      
      console.log('');
      console.log('📋 ═══ 用户选择标签（可复制）═══');
      console.log(`📌 SelectedPersonaTags: ${personaLabels.join(', ') || '(无)'}`);
      console.log(`📌 SelectedRelationshipTag: ${relationshipLabel || '(无)'}`);
      console.log(`📌 AllTags: ${tagLabels.join(', ') || '(无)'}`);
      console.log('═══════════════════════════════════════');
      console.log('');
      
      if (tagLabels.length === 0) {
        console.warn('⚠️ 没有选择标签！将使用默认标签');
      }
      
      // 1. 使用 AI 生成 4 个不同风格的 prompts（只传 Persona，不传 Relationship，避免生图出现两人）
      console.log('🧠 生成图生图 Prompts...');
      const promptResult = await aiService.generateImagePrompts(
        formData.uploadedImage,
        personaLabels  // 仅 Persona 标签，不传 Relationship
      );

      if (!promptResult.success) {
        throw new Error('Prompt 生成失败: ' + promptResult.error);
      }

      const prompts = promptResult.prompts || [];
      console.log('📋 生成的提示词:');
      prompts.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));

      // 2. 使用生成的 prompts 调用图生图 API
      console.log('🎨 开始调用 Flux 图生图 API...');
      const startTime = performance.now();
      
      // 定义回调函数：每生成一张图就更新 UI
      const handleImageGenerated = (image, index) => {
        console.log(`📷 图片 ${index + 1} 已生成:`, image.type || image.style);
        
        // 使用函数式更新，确保拿到最新的状态
        setGeneratedImages(prev => {
          const newImages = [...prev];
          newImages[index] = image;
          return newImages;
        });
      };
      
      // 传入完整的 promptResult 对象（包含 prompts, styleLabels 等）+ 回调函数
      const result = await imageService.generateImage(formData, promptResult, handleImageGenerated);

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2) + 's';

      if (result.success) {
        console.log('✅ 生成成功！总耗时:', duration);
        console.log('📊 生成结果:', result);
        
        // 检查返回的图片数据
        const images = result.generatedImages || result.images || [];
        console.log('🖼️ 生成的图片数量:', images.length);
        console.log('🖼️ 图片数据:', images);
        
        if (images.length === 0) {
          throw new Error('API 返回了空的图片列表');
        }
        
        // 转换成统一格式
        const formattedImages = images.map((img, index) => ({
          id: index + 1,
          url: img.url || img.image || null,
          type: img.type || 'generated',
          prompt: img.prompt || prompts[index],
          duration: img.duration || 'N/A',
          label: img.label || img.style,
        }));
        
        console.log('✅ 格式化后的图片:', formattedImages);
        
        setGenerationTime(duration);
        setGeneratedImages(formattedImages);
        
        // 保存生成的图片到全局状态
        updateFormData('generatedImages', formattedImages);
        updateFormData('stylePrompts', prompts);
        updateFormData('generationTime', duration);
        updateFormData('isMockGeneration', result.isMock);
        updateFormData('modelUsed', result.modelId);
        
        setIsGenerating(false);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('❌ 生成失败:', error);
      setGenerationError(error.message);
      setIsGenerating(false);
      
      // 显示错误提示
      alert('图片生成失败: ' + error.message + '\n\n将使用占位图片，你可以继续流程。');
    }
  };

  // 选择风格图
  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
    updateFormData('selectedStyleIndex', index);
    
    // 保存选中的图片信息
    if (styleImages[index]) {
      updateFormData('generatedImage', styleImages[index].url);
      updateFormData('selectedImagePrompt', styleImages[index].prompt);
    }
  };

  // 处理音色文件上传（克隆声音）
  const handleVoiceFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('audio/')) {
      alert('请上传音频文件 (MP3, WAV, M4A 等)');
      return;
    }
    
    // 检查文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('音频文件过大，请上传小于 10MB 的文件');
      return;
    }
    
    setIsUploadingVoice(true);
    console.log('🎤 开始上传克隆音色:', file.name);
    
    try {
      // 上传到 7verse 存储获取 URL
      const { uploadImageToImgbb } = await import('../config/api');
      
      // 将音频文件转为 base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = reader.result;
        
        // 注意：7verse 存储 API 可能只支持图片
        // 这里我们直接使用本地 URL 或者需要其他音频上传方案
        // 暂时使用 URL.createObjectURL 创建本地 URL
        const localUrl = URL.createObjectURL(file);
        
        console.log('✅ 音色文件已加载:', file.name);
        
        // 保存到状态
        setClonedVoiceUrl(localUrl);
        setClonedVoiceName(file.name.replace(/\.[^/.]+$/, '')); // 去掉扩展名
        updateFormData('clonedVoiceUrl', localUrl);
        updateFormData('clonedVoiceName', file.name.replace(/\.[^/.]+$/, ''));
        
        // 自动选择克隆的音色
        setSelectedVoice('cloned');
        updateFormData('selectedVoice', 'cloned');
        updateFormData('selectedVoicePreviewUrl', localUrl);
        
        setIsUploadingVoice(false);
        
        // 提示成功
        alert(`✅ 音色 "${file.name}" 已上传成功！`);
      };
      
      reader.onerror = () => {
        console.error('❌ 音频文件读取失败');
        setIsUploadingVoice(false);
        alert('音频文件读取失败，请重试');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ 音色上传失败:', error);
      setIsUploadingVoice(false);
      alert('音色上传失败: ' + error.message);
    }
  };

  // 选择音色
  const handleVoiceSelect = (voiceId) => {
    setSelectedVoice(voiceId);
    updateFormData('selectedVoice', voiceId);
    
    // 保存音色详细信息
    const voiceInfo = voices.find(v => v.id === voiceId);
    if (voiceInfo) {
      updateFormData('selectedVoiceInfo', voiceInfo);
      // 保存音色样本 URL（用于视频生成）
      if (voiceInfo.previewUrl) {
        updateFormData('selectedVoicePreviewUrl', voiceInfo.previewUrl);
        console.log('🎤 已保存音色样本 URL:', voiceInfo.previewUrl);
      }
    }
    
    // 选择后自动返回图片选择页面
    setTimeout(() => {
      setView('image');
    }, 300);
  };

  // 获取音色名称（支持 ElevenLabs 格式）
  const getVoiceName = (voiceId) => {
    if (!voiceId || !voices.length) return 'Select a voice';
    const voice = voices.find(v => v.id === voiceId);
    return voice?.name || voiceId;
  };

  // 只要选了风格图就可以继续，音色是可选的
  const isNextDisabled = selectedImageIndex === null || isGenerating;

  // 处理下一步
  const handleNext = async () => {
    if (isNextDisabled) return;
    // 停止所有音频播放
    if (audioRef.current) {
      audioRef.current.pause();
    }
    nextStep();
  };

  return (
    <StepLayout nextDisabled={isNextDisabled} onNext={handleNext}>
      <div className="h-full flex flex-col px-6 pt-2 min-h-0">
        {/* 顶部关闭按钮 */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevStep} className="text-white text-2xl hover:opacity-70 transition-opacity">←</button>
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

        <h1 className="text-3xl font-bold text-white italic text-center mb-3" style={{ fontStyle: 'italic' }}>
          Pick an image and voice
        </h1>

        {/* Regenerate 按钮 */}
        {!isGenerating && generatedImages.length > 1 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-white text-sm font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate Styles
            </button>
          </div>
        )}

        {/* 生成中状态提示 */}
        {isGenerating && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 rounded-full text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
              Generating styles...
            </div>
          </div>
        )}

        {/* 生成错误提示 */}
        {generationError && !isGenerating && (
          <div className="bg-red-900/50 border border-red-500 rounded-2xl p-4 mb-4">
            <p className="text-red-200 text-sm">
              ⚠️ 生成失败: {generationError}
            </p>
            <button 
              onClick={generateStyleImages}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white text-sm font-medium"
            >
              重试
            </button>
          </div>
        )}

        {/* 图片/音色切换 */}
        {view === 'image' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* 风格图选择 */}
            <div className="grid grid-cols-2 gap-4 mb-4 flex-shrink-0">
              {styleImages.map((image, index) => (
                <button
                  key={`style-${index}-${image.type || 'img'}`}
                  onClick={() => image.url && handleImageSelect(index)}
                  disabled={!image.url}
                  className={`relative aspect-[3/4] rounded-3xl overflow-hidden transition-all ${
                    selectedImageIndex === index
                      ? 'ring-[3px] ring-white'
                      : image.url ? 'opacity-70 hover:opacity-100' : 'opacity-50'
                  } ${!image.url ? 'cursor-wait' : 'cursor-pointer'}`}
                >
                  {image.url ? (
                    // 显示图片
                    <>
                      <img 
                        src={image.url} 
                        alt={image.type === 'original' ? 'Original' : `Style ${index}`}
                        className="w-full h-full object-cover"
                      />
                      {/* 原图标签 */}
                      {image.type === 'original' && (
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          Original
                        </div>
                      )}
                      {/* 风格标签 */}
                      {image.label && image.type !== 'original' && (
                        <div className="absolute bottom-2 left-2 bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full">
                          {image.label}
                        </div>
                      )}
                    </>
                  ) : (
                    // 占位背景 - Shimmer 加载效果
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center w-full px-4">
                        {/* Shimmer 动画 */}
                        <div className="shimmer-circle w-16 h-16 mx-auto mb-3"></div>
                        <div className="shimmer-line w-3/4 mx-auto mb-2"></div>
                        <div className="shimmer-line w-1/2 mx-auto h-2"></div>
                        <span className="text-white/40 text-xs mt-3 block">
                          {image.label || `Style ${index}`}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* 显示 AI 推荐音色 */}
            {aiRecommendedVoice && (
              <div className="rounded-xl p-3 mb-3 bg-green-500/20 border border-green-500/50">
                <p className="text-green-300 text-sm">
                  ✨ AI 推荐音色：{getVoiceName(aiRecommendedVoice)}
                </p>
                {aiVoiceReasoning && (
                  <p className="text-green-200/70 text-xs mt-1">
                    💭 {aiVoiceReasoning}
                  </p>
                )}
              </div>
            )}

            {/* 推荐音色 - 整个区域都可点击 */}
            <button 
              onClick={() => setView('voice')}
              className="w-full bg-gray-800/60 rounded-3xl p-4 flex items-center justify-between hover:bg-gray-800 transition-all flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">
                    {getVoiceName(selectedVoice)}
                    {selectedVoice === aiRecommendedVoice && selectedVoice && <span className="ml-1 text-xs">✨</span>}
                  </p>
                  <p className="text-gray-400 text-xs">
                    · {selectedVoice === aiRecommendedVoice && selectedVoice ? 'AI Recommend' : selectedVoice ? 'Selected' : 'Tap to select'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* 音色库标题 */}
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <button 
                onClick={() => setView('image')}
                className="text-white text-2xl"
              >
                ←
              </button>
              <h2 className="text-lg font-bold text-white">Pick a voice</h2>
              <div className="w-8" />
            </div>

            {/* 克隆音色按钮 - 收起为紧凑版 */}
            <input
              ref={voiceFileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleVoiceFileUpload}
              className="hidden"
            />
            <button 
              onClick={() => voiceFileInputRef.current?.click()}
              disabled={isUploadingVoice}
              className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-3 flex items-center justify-between mb-3 hover:opacity-90 transition-all flex-shrink-0 ${
                isUploadingVoice ? 'opacity-50 cursor-not-allowed' : ''
              } ${clonedVoiceUrl ? 'ring-2 ring-green-400' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  {isUploadingVoice ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : clonedVoiceUrl ? (
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-xs">
                    {clonedVoiceUrl ? clonedVoiceName || 'Voice Uploaded' : 'Clone Your Voice'}
                  </p>
                  <p className="text-white/60 text-[10px]">
                    {isUploadingVoice ? 'Uploading...' : clonedVoiceUrl ? '✓ Ready' : 'Upload audio'}
                  </p>
                </div>
              </div>
              <span className="text-white text-lg">{clonedVoiceUrl ? '✓' : '+'}</span>
            </button>

            {/* 当前选中的音色 - 收起为紧凑版 */}
            {selectedVoice && (
              <div className="bg-gray-800/60 rounded-xl p-2.5 flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-xs">
                      {getVoiceName(selectedVoice)}
                    </p>
                    <p className="text-gray-400 text-[10px]">
                      {selectedVoice === aiRecommendedVoice ? '✨ AI' : 'Selected'}
                    </p>
                  </div>
                </div>
                <span className="text-green-400 text-xs">✓</span>
              </div>
            )}

            {/* 分类标签 - 更紧凑 */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide flex-shrink-0">
              {voiceCategories.map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    category === 'All'
                      ? 'bg-white text-black'
                      : 'bg-gray-800/60 text-gray-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 音色库加载状态 - Shimmer Effect */}
            {voiceLibraryLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-gray-800/60 rounded-3xl p-4 flex items-center gap-3">
                    <div className="shimmer-circle w-10 h-10"></div>
                    <div className="flex-1">
                      <div className="shimmer-line w-3/4 mb-2"></div>
                      <div className="shimmer-line w-1/2 h-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 音色列表 - 更紧凑的间距 */}
            {!voiceLibraryLoading && (
              <div className="space-y-2 flex-1 overflow-y-auto pb-4">
                {voices.map((voice, index) => {
                  const isAIRecommended = voice.id === aiRecommendedVoice;
                  const isPlaying = playingVoiceId === voice.id;
                  const hasPreview = !!voice.previewUrl;
                  const isOfficial = voice.isOfficial;
                  
                  // 在官方和社区音色之间添加分隔
                  const prevVoice = voices[index - 1];
                  const showDivider = index > 0 && prevVoice?.isOfficial && !isOfficial;
                  
                  return (
                    <React.Fragment key={voice.id}>
                      {/* 分隔标题 */}
                      {showDivider && (
                        <div className="flex items-center gap-2 py-1">
                          <div className="h-px flex-1 bg-gray-700"></div>
                          <span className="text-gray-500 text-[10px]">社区音色</span>
                          <div className="h-px flex-1 bg-gray-700"></div>
                        </div>
                      )}
                      {/* 第一个音色前显示来源标识 */}
                      {index === 0 && (
                        <div className="flex items-center gap-2 pb-1">
                          <span className="text-amber-400 text-[10px] font-medium">
                            {isOfficial ? '🏆 我的音色库' : '👥 社区音色'}
                          </span>
                        </div>
                      )}
                      <div
                        onClick={() => handleVoiceSelect(voice.id)}
                        className={`w-full bg-gray-800/60 rounded-2xl p-3 flex items-center justify-between transition-all cursor-pointer ${
                          selectedVoice === voice.id ? 'ring-2 ring-white' : ''
                        } ${isAIRecommended ? 'ring-2 ring-purple-400' : ''} ${isOfficial ? 'border-l-2 border-amber-400' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {/* 播放按钮 - 更小 */}
                          <button
                            onClick={(e) => handlePlayVoice(e, voice)}
                            disabled={!hasPreview}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                              isPlaying 
                                ? 'bg-purple-500' 
                                : hasPreview 
                                  ? 'bg-gray-700 hover:bg-gray-600' 
                                  : 'bg-gray-800 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {isAudioLoading && isPlaying ? (
                              <div className="shimmer-circle w-4 h-4"></div>
                            ) : isPlaying ? (
                              // 暂停图标
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                              </svg>
                            ) : (
                              // 播放图标
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-white font-medium text-xs flex items-center gap-1 truncate">
                              {voice.name}
                              {isOfficial && <span className="text-amber-400 text-[10px]">🏆</span>}
                              {isAIRecommended && <span className="text-purple-300 text-[9px] bg-purple-500/20 px-1 py-0.5 rounded flex-shrink-0">✨ AI</span>}
                            </p>
                            <p className="text-gray-500 text-[10px] truncate">
                              {voice.gender} · {voice.accent || voice.tags?.slice(0, 2).join(', ') || voice.description?.substring(0, 20)}
                            </p>
                          </div>
                        </div>
                        {/* 选择指示器 */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedVoice === voice.id 
                            ? 'border-white bg-white' 
                            : 'border-gray-600'
                        }`}>
                          {selectedVoice === voice.id && (
                            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* 底部确认按钮 */}
            <button 
              onClick={() => setView('image')}
              className="w-full mt-4 py-4 bg-white rounded-full text-black font-bold text-base"
            >
              Confirm Voice
            </button>
          </div>
        )}
      </div>
    </StepLayout>
  );
};

export default Step3PickImageVoice;
