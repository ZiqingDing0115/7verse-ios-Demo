import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import StepLayout from '../components/StepLayout';
import { aiService } from '../services/aiService';
import { basicTags, personaTags, relationshipTags, getAllTags, getTagByLabel } from '../data/tagLibrary';

// 每个类别展示的标签数量
const TAGS_PER_CATEGORY = 3;

// 随机打乱数组
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 第二步：添加 Persona 和 Relationship 标签（三层标签体系）
const Step2AddPersona = () => {
  const { formData, updateFormData, voiceLibrary, voiceLibraryLoading } = useAppContext();
  const [selectedTags, setSelectedTags] = useState(formData.selectedTags || []);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiRecommendedTags, setAiRecommendedTags] = useState(formData.aiRecommendedTags || []);
  
  // Shuffle 状态：每个类别显示的标签索引
  const [shuffledTags, setShuffledTags] = useState({
    basic: shuffleArray(basicTags).slice(0, TAGS_PER_CATEGORY),
    persona: shuffleArray(personaTags).slice(0, TAGS_PER_CATEGORY),
    relationship: shuffleArray(relationshipTags).slice(0, TAGS_PER_CATEGORY),
  });
  
  // 是否展示所有标签
  const [showAll, setShowAll] = useState({
    basic: false,
    persona: false,
    relationship: false,
  });
  
  // 音色推荐状态（在 Step 2 后台进行）
  const [isRecommendingVoice, setIsRecommendingVoice] = useState(false);

  // 所有标签合并（用于查找）
  const allTags = getAllTags();

  // Shuffle 单个类别
  const shuffleCategory = useCallback((category) => {
    const tagMap = { basic: basicTags, persona: personaTags, relationship: relationshipTags };
    const tags = tagMap[category];
    
    // 获取已选中的该类别标签（保留已选中的）
    const selectedInCategory = tags.filter(t => selectedTags.includes(t.id));
    const unselected = tags.filter(t => !selectedTags.includes(t.id));
    
    // 打乱未选中的，取 3 个（或更少如果已选中占用了名额）
    const remaining = TAGS_PER_CATEGORY - selectedInCategory.length;
    const shuffledUnselected = shuffleArray(unselected).slice(0, Math.max(0, remaining));
    
    // 合并：已选中的 + 随机的
    const newShuffled = [...selectedInCategory, ...shuffledUnselected].slice(0, TAGS_PER_CATEGORY);
    
    setShuffledTags(prev => ({
      ...prev,
      [category]: newShuffled,
    }));
  }, [selectedTags]);

  // Shuffle 所有类别
  const shuffleAll = useCallback(() => {
    shuffleCategory('basic');
    shuffleCategory('persona');
    shuffleCategory('relationship');
  }, [shuffleCategory]);

  // ===== 独立流程 1: 标签推荐 =====
  useEffect(() => {
    const recommendTags = async () => {
      if (!formData.uploadedImage || formData.aiRecommendedTags) {
        return;
      }

      setIsLoadingAI(true);
      console.log('🤖 开始调用 Gemini 推荐标签...');

      try {
        const result = await aiService.recommendTags(formData.uploadedImage);
        
        if (result.success && result.tags) {
          console.log('✅ Gemini 推荐的标签:', result.tags);
          console.log('⏱️ 推荐耗时:', result.duration);
          
          setAiRecommendedTags(result.tags);
          updateFormData('aiRecommendedTags', result.tags);
          
          // 自动选中 AI 推荐的标签
          const matchedTagIds = result.tags.map(tagLabel => {
            const found = getTagByLabel(tagLabel);
            return found?.id;
          }).filter(Boolean);
          
          if (matchedTagIds.length > 0) {
            setSelectedTags(matchedTagIds);
            updateFormData('selectedTags', matchedTagIds);
            
            const selectedLabels = matchedTagIds.map(id => 
              allTags.find(t => t.id === id)?.label
            ).filter(Boolean);
            updateFormData('selectedTagLabels', selectedLabels);
            
            console.log('🏷️ 自动选中的标签:', selectedLabels);
            
            // 更新 shuffled 显示 AI 推荐的标签
            const matchedBasic = basicTags.filter(t => matchedTagIds.includes(t.id));
            const matchedPersona = personaTags.filter(t => matchedTagIds.includes(t.id));
            const matchedRelationship = relationshipTags.filter(t => matchedTagIds.includes(t.id));
            
            setShuffledTags({
              basic: matchedBasic.length > 0 ? matchedBasic.slice(0, TAGS_PER_CATEGORY) : shuffleArray(basicTags).slice(0, TAGS_PER_CATEGORY),
              persona: matchedPersona.length > 0 ? matchedPersona.slice(0, TAGS_PER_CATEGORY) : shuffleArray(personaTags).slice(0, TAGS_PER_CATEGORY),
              relationship: matchedRelationship.length > 0 ? matchedRelationship.slice(0, TAGS_PER_CATEGORY) : shuffleArray(relationshipTags).slice(0, TAGS_PER_CATEGORY),
            });
          }
        }
      } catch (error) {
        console.error('❌ AI 推荐标签出错:', error);
      } finally {
        setIsLoadingAI(false);
      }
    };

    recommendTags();
  }, [formData.uploadedImage]);

  // ===== 独立流程 2: 音色推荐（后台进行）=====
  useEffect(() => {
    const recommendVoice = async () => {
      if (!formData.uploadedImage) return;
      if (!formData.selectedTagLabels || formData.selectedTagLabels.length === 0) return;
      if (formData.aiRecommendedVoice) return;
      if (voiceLibraryLoading) return;
      if (voiceLibrary.length === 0) return;
      if (isRecommendingVoice) return;

      setIsRecommendingVoice(true);
      console.log('🎙️ 开始调用 Gemini 推荐音色（后台）...');

      try {
        const result = await aiService.recommendVoice(
          formData.uploadedImage,
          formData.selectedTagLabels,
          voiceLibrary
        );

        if (result.success && result.recommendation) {
          const { recommended_voice_id, reasoning, voice_profile, alternative } = result.recommendation;
          const voiceInfo = voiceLibrary.find(v => v.id === recommended_voice_id);
          
          console.log('✅ Gemini 推荐的音色:', recommended_voice_id);
          
          updateFormData('aiRecommendedVoice', recommended_voice_id);
          updateFormData('aiVoiceReasoning', reasoning);
          updateFormData('aiVoiceProfile', voice_profile);
          updateFormData('aiAlternativeVoice', alternative);
          updateFormData('selectedVoice', recommended_voice_id);
          updateFormData('selectedVoiceInfo', voiceInfo);
        }
      } catch (error) {
        console.error('❌ AI 音色推荐失败:', error);
      } finally {
        setIsRecommendingVoice(false);
      }
    };

    recommendVoice();
  }, [formData.selectedTagLabels, voiceLibrary, voiceLibraryLoading]);

  // 切换标签选中状态
  const toggleTag = (tagId) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    setSelectedTags(newTags);
    updateFormData('selectedTags', newTags);
    
    const selectedLabels = newTags.map(id => 
      allTags.find(t => t.id === id)?.label
    ).filter(Boolean);
    updateFormData('selectedTagLabels', selectedLabels);
  };

  // 切换显示全部/部分
  const toggleShowAll = (category) => {
    setShowAll(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 检查标签是否被 AI 推荐
  const isAIRecommended = (tagLabel) => {
    return aiRecommendedTags.some(t => t.toLowerCase() === tagLabel.toLowerCase());
  };

  // 渲染单个标签
  const renderTag = (tag) => {
    const isSelected = selectedTags.includes(tag.id);
    const isRecommended = isAIRecommended(tag.label);
    
    return (
      <button
        key={tag.id}
        onClick={() => toggleTag(tag.id)}
        className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
          isSelected
            ? 'bg-white text-black shadow-lg scale-105'
            : 'bg-gray-700 text-white/80 hover:text-white hover:bg-gray-600'
        } ${isRecommended && !isSelected ? 'ring-2 ring-emerald-400/60' : ''}`}
      >
        <span className="text-base">{tag.emoji}</span>
        <span>{tag.label}</span>
        {isRecommended && <span className="text-emerald-400 text-xs">✨</span>}
      </button>
    );
  };

  // 渲染标签分类区块
  const renderTagSection = (title, subtitle, allCategoryTags, sectionKey, emoji) => {
    const isShowingAll = showAll[sectionKey];
    const displayTags = isShowingAll ? allCategoryTags : shuffledTags[sectionKey];
    const selectedCount = allCategoryTags.filter(t => selectedTags.includes(t.id)).length;
    
    return (
      <div className="mb-5">
        {/* Section Header */}
        <div className="flex items-center justify-between py-2 gap-3">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-2xl flex-shrink-0">{emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-base">{title}</h3>
                {selectedCount > 0 && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                    {selectedCount}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs">{subtitle}</p>
            </div>
          </div>
          
          {/* Right: Show All / Show Less */}
          <button
            onClick={() => toggleShowAll(sectionKey)}
            className="text-xs text-gray-400 hover:text-white flex-shrink-0 whitespace-nowrap"
          >
            {isShowingAll ? '收起' : `全部 ${allCategoryTags.length}`}
          </button>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {displayTags.map(tag => renderTag(tag))}
        </div>
      </div>
    );
  };

  return (
    <StepLayout nextDisabled={selectedTags.length === 0}>
      <div className="h-full flex flex-col px-5 pt-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
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

        <h1 className="text-2xl font-bold text-white italic text-center mb-2">
          Define your<br />character
        </h1>

        {/* Shuffle Button */}
        <div className="flex justify-center mb-3">
          <button
            onClick={shuffleAll}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
          >
            <span className="text-lg">🎲</span>
            Shuffle Tags
          </button>
        </div>

        {/* AI Loading - Shimmer Effect */}
        {isLoadingAI && (
          <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="shimmer-circle w-8 h-8"></div>
              <div className="flex-1">
                <div className="shimmer-line w-3/4 mb-2"></div>
                <div className="shimmer-line w-1/2 h-2"></div>
              </div>
            </div>
            <span className="text-blue-300 text-sm">✨ AI 正在分析图片推荐标签...</span>
          </div>
        )}

        {/* AI Recommendation Success */}
        {aiRecommendedTags.length > 0 && !isLoadingAI && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-2 mb-3">
            <p className="text-emerald-300 text-xs text-center">
              ✨ AI 已推荐 {aiRecommendedTags.length} 个标签 • 点击可修改 • 试试 Shuffle
            </p>
          </div>
        )}

        {/* Tag Sections */}
        <div className="flex-1 overflow-y-auto pb-4">
          {renderTagSection('Visual Vibe', 'AI 从图片分析', basicTags, 'basic', '👁️')}
          {renderTagSection('Persona', '定义 TA 的性格', personaTags, 'persona', '🎭')}
          {renderTagSection('Relationship', '你在关系中的角色', relationshipTags, 'relationship', '💕')}
        </div>

        {/* Bottom Stats */}
        <div className="py-3 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">
              已选择 <span className="text-white font-medium">{selectedTags.length}</span> 个标签
            </span>
            <div className="flex gap-3">
              {selectedTags.length > 0 && (
                <button 
                  onClick={() => {
                    setSelectedTags([]);
                    updateFormData('selectedTags', []);
                    updateFormData('selectedTagLabels', []);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  清空
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step2AddPersona;
