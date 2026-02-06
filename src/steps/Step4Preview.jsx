import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { useAppContext } from '../context/AppContext';
import StepLayout from '../components/StepLayout';
import { aiService } from '../services/aiService';
import { callI2VAPI, uploadImageToImgbb } from '../config/api';
import { getRecommendedContentTags, searchContentTags } from '../data/contentTagLibrary';

// 第四步：预览和发布
const Step4Preview = () => {
  const { formData, updateFormData, prevStep } = useAppContext();
  
  // 从 formData 恢复已保存的数据，否则等待 AI 生成
  const [characterName, setCharacterName] = useState(
    formData.characterName || formData.videoData?.suggested_name || ''
  );
  const [description, setDescription] = useState(
    formData.characterDescription || formData.videoData?.script_text || ''
  );
  const [persona, setPersona] = useState(formData.characterPersona || '');
  const [visibility, setVisibility] = useState('Everyone');
  
  // AI 视频 Prompt 状态
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoData, setVideoData] = useState(formData.videoData || null);
  
  // 视频生成状态
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  // 初始化 HLS 播放器
  useEffect(() => {
    if (generatedVideoUrl && videoRef.current) {
      const video = videoRef.current;
      
      // 检查是否是 m3u8 格式
      if (generatedVideoUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
          // 使用 HLS.js
          console.log('🎬 使用 HLS.js 播放视频...');
          
          // 清理之前的 HLS 实例
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }
          
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          
          hls.loadSource(generatedVideoUrl);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('✅ HLS 流加载成功');
            video.play().catch(e => console.log('自动播放被阻止:', e));
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('❌ HLS 错误:', data);
            if (data.fatal) {
              setVideoError('视频播放失败: ' + data.type);
            }
          });
          
          hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari 原生支持 HLS
          console.log('🎬 使用 Safari 原生 HLS 播放...');
          video.src = generatedVideoUrl;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(e => console.log('自动播放被阻止:', e));
          });
        } else {
          setVideoError('您的浏览器不支持 HLS 视频播放');
        }
      } else {
        // 普通视频格式
        video.src = generatedVideoUrl;
        video.play().catch(e => console.log('自动播放被阻止:', e));
      }
    }
    
    // 清理函数
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [generatedVideoUrl]);

  // 内容标签（基于 Persona 标签推荐的社交媒体标签）
  // 优先从 formData 恢复，否则根据 Persona 标签生成
  const [hashtags, setHashtags] = useState(() => {
    if (formData.contentHashtags && formData.contentHashtags.length > 0) {
      return formData.contentHashtags;
    }
    const personaTags = formData.selectedTagLabels || [];
    return getRecommendedContentTags(personaTags);
  });
  
  // 新标签输入
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  
  // 删除标签
  const removeHashtag = (indexToRemove) => {
    setHashtags(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  // 添加标签
  const addHashtag = (tag) => {
    const cleanTag = tag.replace(/^#/, '').trim();
    if (cleanTag && !hashtags.includes(cleanTag)) {
      setHashtags(prev => [...prev, cleanTag]);
    }
    setNewTagInput('');
    setShowTagSuggestions(false);
  };
  
  // 处理输入变化
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setNewTagInput(value);
    
    if (value.length > 0) {
      const suggestions = searchContentTags(value).slice(0, 5);
      setTagSuggestions(suggestions);
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };
  
  // 处理回车添加标签
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      addHashtag(newTagInput);
    }
  };

  // 当角色名称改变时，更新 Persona 描述
  useEffect(() => {
    if (formData.selectedTagLabels && formData.selectedTagLabels.length > 0) {
      const tags = formData.selectedTagLabels.slice(0, 3).join(' and ');
      setPersona(`${characterName} is ${tags.toLowerCase()}.`);
    }
  }, [characterName, formData.selectedTagLabels]);

  // 保存用户编辑的数据到 formData（这样返回再回来时能恢复）
  useEffect(() => {
    if (characterName) {
      updateFormData('characterName', characterName);
    }
  }, [characterName]);

  useEffect(() => {
    if (description) {
      updateFormData('characterDescription', description);
    }
  }, [description]);

  useEffect(() => {
    if (persona) {
      updateFormData('characterPersona', persona);
    }
  }, [persona]);

  // 保存 hashtags
  useEffect(() => {
    if (hashtags && hashtags.length > 0) {
      updateFormData('contentHashtags', hashtags);
    }
  }, [hashtags]);

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
      console.log('🎬 开始调用 Qwen 生成视频 Prompt...');

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
          console.log('✅ Qwen 生成的视频数据:');
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

  // 生成视频（调用 7verse I2V API - 图生视频）
  const handleGenerateVideo = async () => {
    setIsCreatingVideo(true);
    setVideoError(null);
    
    console.log('🎬 开始生成视频（I2V）...');
    
    try {
      // 1. 获取首帧图片 URL（如果是 base64，需要先上传）
      let firstFrameUrl = formData.generatedImage || formData.uploadedImage;
      
      if (firstFrameUrl && firstFrameUrl.startsWith('data:image')) {
        console.log('📤 上传首帧图片到图床...');
        const uploadedUrl = await uploadImageToImgbb(firstFrameUrl);
        if (!uploadedUrl) {
          throw new Error('图片上传失败');
        }
        firstFrameUrl = uploadedUrl;
        console.log('✅ 首帧图片上传成功:', firstFrameUrl);
      }
      
      if (!firstFrameUrl) {
        throw new Error('没有可用的图片');
      }
      
      // 2. 生成视频 Prompt
      // 使用之前 AI 生成的 videoPrompt，或者使用默认的
      const videoPrompt = formData.videoPrompt || '让图中人物微笑并挥手，自然流畅的动作';
      
      console.log('📝 I2V 视频生成参数:');
      console.log('   First Frame URL:', firstFrameUrl.substring(0, 80) + '...');
      console.log('   Prompt:', videoPrompt);
      
      // 3. 调用 I2V API
      const result = await callI2VAPI(firstFrameUrl, videoPrompt, {
        duration: 5,
        ratio: '9:16',
        async: true,  // 异步模式
        generateAudio: false,
        vendor: 'VIDEO_VENDOR_SEEDANCE',
      });
      
      if (result.success) {
        console.log('✅ I2V 视频请求成功!');
        
        if (result.videoUrl) {
          // 同步模式直接返回视频 URL
          console.log('🎥 视频 URL:', result.videoUrl);
          setGeneratedVideoUrl(result.videoUrl);
          updateFormData('generatedVideoUrl', result.videoUrl);
        } else if (result.taskId) {
          // 异步模式返回 task_id，需要轮询查询状态
          console.log('📋 异步任务 ID:', result.taskId);
          console.log('⏳ 视频正在后台生成中...');
          setVideoError('视频正在生成中，请稍后刷新查看（任务ID: ' + result.taskId + '）');
        }
      } else {
        throw new Error(result.error || '视频生成失败');
      }
    } catch (error) {
      console.error('❌ I2V 视频生成失败:', error);
      setVideoError(error.message);
    } finally {
      setIsCreatingVideo(false);
    }
  };

  return (
    <StepLayout showNext={false}>
      <div className="h-full flex flex-col overflow-y-auto px-8 pt-2">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevStep} className="text-white text-2xl hover:opacity-70 transition-opacity">←</button>
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

        {/* 内容标签 - 可编辑、可添加 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">Content Tags</h3>
            <span className="text-gray-500 text-xs">{hashtags.length} tags</span>
          </div>
          
          {/* 标签显示 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gray-800/60 text-gray-300 rounded-full text-sm font-medium flex items-center gap-1.5 group hover:bg-gray-700/60 transition-colors"
              >
                # {tag}
                <button
                  onClick={() => removeHashtag(index)}
                  className="w-4 h-4 rounded-full bg-gray-600 hover:bg-red-500 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-all"
                >
                  <span className="text-xs leading-none">×</span>
                </button>
              </span>
            ))}
          </div>
          
          {/* 添加标签输入框 */}
          <div className="relative">
            <input
              type="text"
              value={newTagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              onFocus={() => newTagInput && setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              placeholder="Add a tag... (press Enter)"
              className="w-full bg-gray-800/40 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300 placeholder:text-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
            
            {/* 标签建议下拉 */}
            {showTagSuggestions && tagSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-10 shadow-lg">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => addHashtag(tag.label)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                  >
                    <span className="text-purple-400">#</span>
                    {tag.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Persona 区域 - 可编辑 */}
        <div className="mb-6">
          <h3 className="text-white font-bold text-lg mb-3">Persona</h3>
          <div className="bg-gray-800/60 rounded-3xl p-4">
            {isGeneratingVideo ? (
              <div className="space-y-2">
                <div className="shimmer-line h-3 w-3/4"></div>
                <div className="shimmer-line h-3 w-1/2"></div>
              </div>
            ) : (
              <textarea
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="Describe the persona..."
                className="w-full bg-transparent text-gray-300 text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 rounded-lg p-1 min-h-[60px]"
                rows={2}
              />
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

        {/* 视频播放区域 */}
        {generatedVideoUrl && (
          <div className="mb-6">
            <h3 className="text-white font-bold text-lg mb-3">Generated Video</h3>
            <div className="bg-gray-800/60 rounded-3xl p-4">
              <video
                ref={videoRef}
                controls
                playsInline
                className="w-full rounded-2xl"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-gray-500 text-xs mt-2 text-center">
                🎬 Video generated successfully
              </p>
            </div>
          </div>
        )}

        {/* 视频生成错误提示 */}
        {videoError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-2xl">
            <p className="text-red-400 text-sm">❌ {videoError}</p>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex gap-4 mb-6">
          <button className="flex-1 py-4 bg-gray-800/60 text-white rounded-full font-bold text-base">
            Save draft
          </button>
          {!generatedVideoUrl ? (
            <button 
              onClick={handleGenerateVideo}
              disabled={isCreatingVideo || isGeneratingVideo}
              className={`flex-1 py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all ${
                isCreatingVideo || isGeneratingVideo
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
              }`}
            >
              {isCreatingVideo ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>🎬</span>
                  <span>Generate Video</span>
                </>
              )}
            </button>
          ) : (
            <button className="flex-1 py-4 bg-white text-black rounded-full font-bold text-base">
              Publish
            </button>
          )}
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
