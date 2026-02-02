import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import StepLayout from '../components/StepLayout';
import { imageService } from '../services/imageService';
import { aiService } from '../services/aiService';
import { callElevenLabsTTS } from '../config/api';
import { getRandomWaitingPhrase, getRandomCompletionPhrase } from '../data/waitingPhrases';

// 第三步：选择风格图和音色
const Step3PickImageVoice = () => {
  const { formData, updateFormData, nextStep, voiceLibrary, voiceLibraryLoading } = useAppContext();
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
  const [ttsPhrase, setTtsPhrase] = useState(''); // 当前正在说的话
  const [isTtsPlaying, setIsTtsPlaying] = useState(false); // TTS 是否正在播放
  const audioRef = useRef(null);
  const ttsAudioRef = useRef(null); // TTS 音频引用
  const hasAutoPlayed = useRef(false); // 是否已自动播放过
  const hasStartedGeneration = useRef(false); // 防止重复生成（React StrictMode）
  
  // 音色推荐状态 - 从 Step 2 的 formData 获取（不再在此处调用 AI）
  const aiRecommendedVoice = formData.aiRecommendedVoice || null;
  const aiVoiceReasoning = formData.aiVoiceReasoning || '';

  // 当 AI 推荐的音色更新时，自动选中
  useEffect(() => {
    if (aiRecommendedVoice && !selectedVoice) {
      setSelectedVoice(aiRecommendedVoice);
      updateFormData('selectedVoice', aiRecommendedVoice);
    }
  }, [aiRecommendedVoice]);

  // 进入 Step3 时立即播放等待语（在图片开始加载前）
  useEffect(() => {
    // 只播放一次，且需要有推荐的音色
    if (aiRecommendedVoice && !hasAutoPlayed.current) {
      console.log('🔊 立即播放等待语，使用音色 ID:', aiRecommendedVoice);
      hasAutoPlayed.current = true;
      
      // 立即播放，不等待 voiceLibrary
      playTTSGreeting(aiRecommendedVoice);
    }
  }, [aiRecommendedVoice]); // 只依赖 aiRecommendedVoice，不等待 voiceLibrary

  // 使用 TTS 播放等待语
  const playTTSGreeting = async (voiceId) => {
    const phrase = getRandomWaitingPhrase();
    setTtsPhrase(phrase);
    setIsTtsPlaying(true);
    
    console.log(`🎤 TTS 播放等待语: "${phrase}"`);
    
    try {
      const result = await callElevenLabsTTS(voiceId, phrase);
      
      if (result.success && result.audioUrl) {
        // 停止之前的音频
        if (ttsAudioRef.current) {
          ttsAudioRef.current.pause();
        }
        
        const audio = new Audio(result.audioUrl);
        ttsAudioRef.current = audio;
        
        audio.onended = () => {
          // 延迟 1.5 秒后再清除 TTS 状态
          setTimeout(() => {
            setIsTtsPlaying(false);
            setTtsPhrase('');
            // 释放 Blob URL
            URL.revokeObjectURL(result.audioUrl);
          }, 1500);
        };
        
        audio.onerror = (err) => {
          console.error('❌ TTS 音频播放失败:', err);
          setIsTtsPlaying(false);
          setTtsPhrase('');
        };
        
        await audio.play();
        console.log('✅ TTS 音频开始播放');
      } else {
        console.warn('⚠️ TTS 生成失败，回退到预览音频');
        // 回退：播放预览音频
        const voice = voiceLibrary.find(v => v.id === voiceId);
        if (voice?.previewUrl) {
          playVoicePreview(voice);
        }
        setIsTtsPlaying(false);
        setTtsPhrase('');
      }
    } catch (error) {
      console.error('❌ TTS 调用失败:', error);
      setIsTtsPlaying(false);
      setTtsPhrase('');
    }
  };

  // 播放完成语（图片生成完成后）
  const playTTSCompletion = async (voiceId) => {
    const phrase = getRandomCompletionPhrase();
    setTtsPhrase(phrase);
    setIsTtsPlaying(true);
    
    console.log(`🎉 TTS 播放完成语: "${phrase}"`);
    
    try {
      const result = await callElevenLabsTTS(voiceId, phrase);
      
      if (result.success && result.audioUrl) {
        // 停止之前的音频
        if (ttsAudioRef.current) {
          ttsAudioRef.current.pause();
        }
        
        const audio = new Audio(result.audioUrl);
        ttsAudioRef.current = audio;
        
        audio.onended = () => {
          // 延迟 1.5 秒后再清除 TTS 状态
          setTimeout(() => {
            setIsTtsPlaying(false);
            setTtsPhrase('');
            URL.revokeObjectURL(result.audioUrl);
          }, 1500);
        };
        
        audio.onerror = (err) => {
          console.error('❌ TTS 完成语播放失败:', err);
          setIsTtsPlaying(false);
          setTtsPhrase('');
        };
        
        await audio.play();
        console.log('✅ TTS 完成语开始播放');
      } else {
        console.warn('⚠️ TTS 完成语生成失败');
        setIsTtsPlaying(false);
        setTtsPhrase('');
      }
    } catch (error) {
      console.error('❌ TTS 完成语调用失败:', error);
      setIsTtsPlaying(false);
      setTtsPhrase('');
    }
  };

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
  const styleImages = generatedImages.length > 0 ? generatedImages : [
    { id: 1, url: null, type: 'placeholder' },
    { id: 2, url: null, type: 'placeholder' },
    { id: 3, url: null, type: 'placeholder' },
    { id: 4, url: null, type: 'placeholder' },
  ];

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
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
    };
  }, []);

  // 播放/暂停音色预览（用户点击按钮）
  const handlePlayVoice = (e, voice) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发选择
    
    if (!voice.previewUrl) {
      console.warn('⚠️ 该音色没有预览音频:', voice.name);
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

  // 生成风格图片的函数
  const generateStyleImages = async () => {
    setIsGenerating(true);
    setGenerationTime(null);
    setGenerationError(null);

    try {
      console.log('🚀 开始图片生成流程...');
      
      // 使用标签文本（不是 ID）来生成 prompts
      const tagLabels = formData.selectedTagLabels || [];
      console.log('📝 用户选择的标签（文本）:', tagLabels);
      
      if (tagLabels.length === 0) {
        console.warn('⚠️ 没有选择标签！将使用默认标签');
      }
      
      // 1. 使用 AI 生成 4 个不同风格的 prompts
      console.log('🧠 生成图生图 Prompts...');
      const promptResult = await aiService.generateImagePrompts(
        formData.uploadedImage,
        tagLabels  // 传递标签文本，不是 ID
      );

      if (!promptResult.success) {
        throw new Error('Prompt 生成失败: ' + promptResult.error);
      }

      const prompts = promptResult.prompts;
      console.log('📋 Gemini 生成的提示词:');
      prompts.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));

      // 2. 使用生成的 prompts 调用图生图 API
      console.log('🎨 开始调用 7verse 图生图 API...');
      const startTime = performance.now();
      
      const result = await imageService.generateImage(formData, prompts);

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
        
        // 播放完成语 - 用 AI 推荐的音色说一句庆祝的话
        if (formData.aiRecommendedVoice) {
          // 短暂延迟，让用户看到图片后再说话
          setTimeout(() => {
            playTTSCompletion(formData.aiRecommendedVoice);
          }, 800);
        }
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

  // 选择音色
  const handleVoiceSelect = (voiceId) => {
    setSelectedVoice(voiceId);
    updateFormData('selectedVoice', voiceId);
    
    // 保存音色详细信息
    const voiceInfo = voices.find(v => v.id === voiceId);
    if (voiceInfo) {
      updateFormData('selectedVoiceInfo', voiceInfo);
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
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
    }
    setIsTtsPlaying(false);
    setTtsPhrase('');
    nextStep();
  };

  return (
    <StepLayout nextDisabled={isNextDisabled} onNext={handleNext}>
      <div className="h-full flex flex-col px-6 pt-2">
        {/* 顶部关闭按钮 */}
        <div className="flex justify-between items-center mb-4">
          <button className="text-white text-2xl">←</button>
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

        <h1 className="text-3xl font-bold text-white italic text-center mb-5" style={{ fontStyle: 'italic' }}>
          Pick a image and voice
        </h1>

        {/* 加载状态提示 - Shimmer Effect */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center mx-6">
              {/* Wave Loader */}
              <div className="wave-loader mb-6">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="text-white text-xl font-semibold mb-2">正在生成 4 张风格图...</p>
              <p className="text-gray-400 text-sm mb-2">这可能需要 10-30 秒</p>
              <p className="text-blue-400 text-xs">🎨 使用 7verse Seedream 图生图模型</p>
              
              {/* TTS 正在说话的提示 */}
              {isTtsPlaying && ttsPhrase && (
                <div className="mt-4 p-3 bg-purple-500/20 rounded-xl border border-purple-400/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex gap-1.5 items-end">
                      <span 
                        className="w-1.5 h-3 bg-purple-400 rounded-full"
                        style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0s' }}
                      ></span>
                      <span 
                        className="w-1.5 h-4 bg-purple-400 rounded-full"
                        style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0.2s' }}
                      ></span>
                      <span 
                        className="w-1.5 h-2.5 bg-purple-400 rounded-full"
                        style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0.4s' }}
                      ></span>
                      <span 
                        className="w-1.5 h-4 bg-purple-400 rounded-full"
                        style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0.6s' }}
                      ></span>
                      <span 
                        className="w-1.5 h-3 bg-purple-400 rounded-full"
                        style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0.8s' }}
                      ></span>
                    </div>
                    <span className="text-purple-300 text-xs font-medium ml-2">AI is speaking...</span>
                  </div>
                  <p className="text-white text-sm italic">"{ttsPhrase}"</p>
                </div>
              )}
              
              {!isTtsPlaying && !ttsPhrase && (
                <p className="text-gray-500 text-xs mt-2">AI 正在创作中...</p>
              )}
              
              {generationTime && (
                <p className="text-green-400 text-sm mt-4">✅ 完成！耗时: {generationTime}</p>
              )}
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
          <div className="flex-1 flex flex-col">
            {/* 风格图选择 */}
            <div className="grid grid-cols-2 gap-4 mb-4 flex-shrink-0">
              {styleImages.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => handleImageSelect(index)}
                  disabled={isGenerating}
                  className={`relative aspect-[3/4] rounded-3xl overflow-hidden transition-all ${
                    selectedImageIndex === index
                      ? 'ring-[3px] ring-white'
                      : 'opacity-60'
                  } ${isGenerating ? 'cursor-not-allowed' : ''}`}
                >
                  {image.url ? (
                    // 显示生成的图片
                    <img 
                      src={image.url} 
                      alt={`Style ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // 占位背景（生成中或未生成）
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
                      {isGenerating ? (
                        <div className="text-center w-full px-4">
                          <div className="shimmer-circle w-16 h-16 mx-auto mb-3"></div>
                          <div className="shimmer-line w-3/4 mx-auto mb-2"></div>
                          <div className="shimmer-line w-1/2 mx-auto h-2"></div>
                        </div>
                      ) : (
                        <span className="text-white text-sm opacity-60">风格图 {index + 1}</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* 显示 Step 2 的音色推荐结果 + TTS 说话状态 */}
            {aiRecommendedVoice && (
              <div className={`rounded-xl p-3 mb-3 transition-all ${
                isTtsPlaying 
                  ? 'bg-purple-500/30 border border-purple-400' 
                  : 'bg-green-500/20 border border-green-500/50'
              }`}>
                {/* TTS 正在说话 */}
                {isTtsPlaying && ttsPhrase ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1 items-end">
                        <span 
                          className="w-1 h-2.5 bg-purple-300 rounded-full"
                          style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0s' }}
                        ></span>
                        <span 
                          className="w-1 h-3.5 bg-purple-300 rounded-full"
                          style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0.2s' }}
                        ></span>
                        <span 
                          className="w-1 h-2 bg-purple-300 rounded-full"
                          style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0.4s' }}
                        ></span>
                        <span 
                          className="w-1 h-3.5 bg-purple-300 rounded-full"
                          style={{ animation: 'voiceWave 1.2s ease-in-out infinite', animationDelay: '0.6s' }}
                        ></span>
                      </div>
                      <span className="text-purple-200 text-sm font-medium">
                        {getVoiceName(aiRecommendedVoice)} says:
                      </span>
                    </div>
                    <p className="text-white text-sm italic pl-6">"{ttsPhrase}"</p>
                  </>
                ) : (
                  <>
                    <p className="text-green-300 text-sm">
                      ✨ AI 推荐音色：{getVoiceName(aiRecommendedVoice)}
                    </p>
                    {aiVoiceReasoning && (
                      <p className="text-green-200/70 text-xs mt-1">
                        💭 {aiVoiceReasoning}
                      </p>
                    )}
                  </>
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
              <span className="text-white text-2xl font-light">+</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* 音色库标题 */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setView('image')}
                className="text-white text-2xl"
              >
                ←
              </button>
              <h2 className="text-xl font-bold text-white">Pick a voice</h2>
              <div className="w-8" />
            </div>

            {/* 当前选中的音色 */}
            <div className="bg-gray-800/60 rounded-3xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {getVoiceName(selectedVoice)}
                  </p>
                  <p className="text-gray-400 text-xs">
                    · {selectedVoice === aiRecommendedVoice && selectedVoice ? 'AI Recommend' : selectedVoice ? 'Selected' : 'None selected'}
                  </p>
                </div>
              </div>
              <button className="text-white text-2xl font-light">+</button>
            </div>

            {/* 分类标签 */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {voiceCategories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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

            {/* 音色列表 */}
            {!voiceLibraryLoading && (
              <div className="space-y-3 flex-1 overflow-y-auto pb-4">
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
                        <div className="flex items-center gap-2 pt-2 pb-1">
                          <div className="h-px flex-1 bg-gray-700"></div>
                          <span className="text-gray-500 text-xs">社区音色</span>
                          <div className="h-px flex-1 bg-gray-700"></div>
                        </div>
                      )}
                      {/* 第一个官方音色前的标题 */}
                      {index === 0 && isOfficial && (
                        <div className="flex items-center gap-2 pb-1">
                          <span className="text-amber-400 text-xs font-medium">🏆 官方音色</span>
                        </div>
                      )}
                      <div
                        onClick={() => handleVoiceSelect(voice.id)}
                        className={`w-full bg-gray-800/60 rounded-3xl p-4 flex items-center justify-between transition-all cursor-pointer ${
                          selectedVoice === voice.id ? 'ring-2 ring-white' : ''
                        } ${isAIRecommended ? 'ring-2 ring-purple-400' : ''} ${isOfficial ? 'border-l-2 border-amber-400' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          {/* 播放按钮 */}
                          <button
                            onClick={(e) => handlePlayVoice(e, voice)}
                            disabled={!hasPreview}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
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
                          <div className="text-left">
                            <p className="text-white font-medium text-sm flex items-center gap-1">
                              {voice.name}
                              {isOfficial && <span className="text-amber-400 text-xs">🏆</span>}
                              {isAIRecommended && <span className="text-purple-300 text-xs">✨ AI推荐</span>}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {voice.gender} · {voice.accent || voice.tags?.slice(0, 2).join(', ') || voice.description?.substring(0, 25)}
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
