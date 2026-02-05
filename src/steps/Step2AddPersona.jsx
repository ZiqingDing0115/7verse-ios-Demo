import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import StepLayout from '../components/StepLayout';
import { aiService } from '../services/aiService';
import { personaTags, relationshipTags, getAllTags, getTagByLabel } from '../data/tagLibrary';

// 每个类别展示的标签数量（更精简）
const PERSONA_DISPLAY_COUNT = 5;
const RELATIONSHIP_DISPLAY_COUNT = 3;

// 随机打乱数组
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 第二步：添加 Persona 和 Relationship 标签
const Step2AddPersona = () => {
  const { formData, updateFormData, voiceLibrary, voiceLibraryLoading, prevStep } = useAppContext();
  
  // Persona 标签（多选）
  const [selectedPersonaTags, setSelectedPersonaTags] = useState(formData.selectedPersonaTags || []);
  // Relationship 标签（单选）
  const [selectedRelationship, setSelectedRelationship] = useState(formData.selectedRelationship || null);
  
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiRecommendedTags, setAiRecommendedTags] = useState(formData.aiRecommendedTags || []);
  
  // Shuffle 状态：Persona 类别显示的标签
  const [shuffledPersonaTags, setShuffledPersonaTags] = useState(() => {
    // 初始化时确保已选中的标签在显示列表中
    const selected = personaTags.filter(t => (formData.selectedPersonaTags || []).includes(t.id));
    const unselected = personaTags.filter(t => !(formData.selectedPersonaTags || []).includes(t.id));
    const shuffled = shuffleArray(unselected);
    const needed = PERSONA_DISPLAY_COUNT - selected.length;
    return [...selected, ...shuffled.slice(0, Math.max(0, needed))].slice(0, Math.max(PERSONA_DISPLAY_COUNT, selected.length));
  });
  
  // Shuffle 状态：Relationship 类别显示的标签（15 个中显示 5 个）
  const [shuffledRelationshipTags, setShuffledRelationshipTags] = useState(
    shuffleArray(relationshipTags).slice(0, RELATIONSHIP_DISPLAY_COUNT)
  );
  
  // 音色推荐状态（在 Step 2 后台进行）
  const [isRecommendingVoice, setIsRecommendingVoice] = useState(false);
  
  // 自定义标签输入
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState(formData.customPersonaTags || []);

  // 所有标签合并（用于查找）
  const allTags = getAllTags();

  // 确保已选中的标签始终显示
  useEffect(() => {
    const selectedInCategory = personaTags.filter(t => selectedPersonaTags.includes(t.id));
    const currentlyShownIds = shuffledPersonaTags.map(t => t.id);
    
    // 检查是否有选中的标签不在当前显示列表中
    const missingSelected = selectedInCategory.filter(t => !currentlyShownIds.includes(t.id));
    
    if (missingSelected.length > 0) {
      // 添加缺失的选中标签，移除未选中的标签
      const unselectedShown = shuffledPersonaTags.filter(t => !selectedPersonaTags.includes(t.id));
      const keepCount = Math.max(0, PERSONA_DISPLAY_COUNT - selectedInCategory.length);
      const newShuffled = [...selectedInCategory, ...unselectedShown.slice(0, keepCount)];
      setShuffledPersonaTags(newShuffled.slice(0, Math.max(PERSONA_DISPLAY_COUNT, selectedInCategory.length)));
    }
  }, [selectedPersonaTags]);

  // 统一 Shuffle 两个类别（保留已选中的标签）
  const shuffleAll = useCallback(() => {
    // Shuffle Persona
    const selectedPersonaInCategory = personaTags.filter(t => selectedPersonaTags.includes(t.id));
    const unselectedPersona = personaTags.filter(t => !selectedPersonaTags.includes(t.id));
    const shuffledUnselectedPersona = shuffleArray(unselectedPersona);
    const remainingPersona = PERSONA_DISPLAY_COUNT - selectedPersonaInCategory.length;
    const newShuffledPersona = [...selectedPersonaInCategory, ...shuffledUnselectedPersona.slice(0, Math.max(0, remainingPersona))];
    setShuffledPersonaTags(newShuffledPersona.slice(0, Math.max(PERSONA_DISPLAY_COUNT, selectedPersonaInCategory.length)));

    // Shuffle Relationship
    const selectedRelTag = relationshipTags.find(t => t.id === selectedRelationship);
    const unselectedRel = relationshipTags.filter(t => t.id !== selectedRelationship);
    const shuffledUnselectedRel = shuffleArray(unselectedRel);
    
    if (selectedRelTag) {
      const remainingRel = RELATIONSHIP_DISPLAY_COUNT - 1;
      setShuffledRelationshipTags([selectedRelTag, ...shuffledUnselectedRel.slice(0, remainingRel)]);
    } else {
      setShuffledRelationshipTags(shuffledUnselectedRel.slice(0, RELATIONSHIP_DISPLAY_COUNT));
    }
  }, [selectedPersonaTags, selectedRelationship]);

  // 更新 formData（包含自定义标签）
  const updateAllFormData = useCallback((personaTags, relationship) => {
    updateFormData('selectedPersonaTags', personaTags);
    updateFormData('selectedRelationship', relationship);
    
    const allSelectedIds = [...personaTags];
    if (relationship) allSelectedIds.push(relationship);
    
    updateFormData('selectedTags', allSelectedIds);
    
    // 合并标签库标签 + 自定义标签
    const selectedLabels = [
      ...allSelectedIds.map(id => allTags.find(t => t.id === id)?.label).filter(Boolean),
      ...customTags,
    ];
    updateFormData('selectedTagLabels', selectedLabels);
  }, [allTags, updateFormData, customTags]);

  // AI 推荐的 Relationship 标签（单独存储）
  const [aiRecommendedRelationship, setAiRecommendedRelationship] = useState(formData.aiRecommendedRelationship || null);

  // ===== 独立流程 1: 标签推荐（AI 推荐但不自动选中）=====
  useEffect(() => {
    const recommendTags = async () => {
      if (!formData.uploadedImage || formData.aiRecommendedTags) {
        return;
      }

      setIsLoadingAI(true);
      console.log('🤖 开始调用 Gemini 推荐标签...');

      try {
        const result = await aiService.recommendTags(formData.uploadedImage);
        
        if (result.success) {
          // 存储推荐结果（但不自动选中！）
          const allTags = result.tags || [];
          const relationshipTag = result.relationshipTag || null;
          
          console.log('✅ AI 推荐的 Persona 标签:', result.personaTags || allTags);
          console.log('✅ AI 推荐的 Relationship:', relationshipTag);
          console.log('📌 注意：推荐但不自动选中，等待用户点击');
          
          setAiRecommendedTags(allTags);
          updateFormData('aiRecommendedTags', allTags);
          
          if (relationshipTag) {
            setAiRecommendedRelationship(relationshipTag);
            updateFormData('aiRecommendedRelationship', relationshipTag);
          }
          
          // 只更新显示列表，确保推荐的标签优先显示（但不选中！）
          const matchedPersonaIds = allTags.map(tagLabel => {
            const found = getTagByLabel(tagLabel);
            return found?.id;
          }).filter(id => id && personaTags.some(t => t.id === id));
          
          // 更新 Persona 显示：推荐的标签放前面
          const recommendedPersonaTagsArr = personaTags.filter(t => matchedPersonaIds.includes(t.id));
          const remainingPersona = personaTags.filter(t => !matchedPersonaIds.includes(t.id));
          const shuffledRemainingPersona = shuffleArray(remainingPersona);
          const neededPersona = PERSONA_DISPLAY_COUNT - recommendedPersonaTagsArr.length;
          setShuffledPersonaTags([
            ...recommendedPersonaTagsArr,
            ...shuffledRemainingPersona.slice(0, Math.max(0, neededPersona))
          ].slice(0, Math.max(PERSONA_DISPLAY_COUNT, recommendedPersonaTagsArr.length)));
          
          // 更新 Relationship 显示：推荐的放第一个
          const recommendedRelTag = relationshipTag ? relationshipTags.find(t => 
            t.label.toLowerCase() === relationshipTag.toLowerCase()
          ) : null;
          const remainingRel = relationshipTags.filter(t => t.id !== recommendedRelTag?.id);
          const shuffledRemainingRel = shuffleArray(remainingRel);
          if (recommendedRelTag) {
            setShuffledRelationshipTags([
              recommendedRelTag,
              ...shuffledRemainingRel.slice(0, RELATIONSHIP_DISPLAY_COUNT - 1)
            ]);
          } else {
            setShuffledRelationshipTags(shuffledRemainingRel.slice(0, RELATIONSHIP_DISPLAY_COUNT));
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

  // 切换 Persona 标签选中状态（多选）
  const togglePersonaTag = (tagId) => {
    const newTags = selectedPersonaTags.includes(tagId)
      ? selectedPersonaTags.filter(id => id !== tagId)
      : [...selectedPersonaTags, tagId];
    
    setSelectedPersonaTags(newTags);
    updateAllFormData(newTags, selectedRelationship);
  };

  // 选择 Relationship 标签（单选）
  const selectRelationship = (tagId) => {
    const newRelationship = selectedRelationship === tagId ? null : tagId;
    setSelectedRelationship(newRelationship);
    updateAllFormData(selectedPersonaTags, newRelationship);
  };

  // 添加自定义标签
  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (tag && !customTags.includes(tag)) {
      const newCustomTags = [...customTags, tag];
      setCustomTags(newCustomTags);
      updateFormData('customPersonaTags', newCustomTags);
      
      // 同时更新 selectedTagLabels
      const allLabels = [
        ...selectedPersonaTags.map(id => allTags.find(t => t.id === id)?.label).filter(Boolean),
        ...newCustomTags,
        selectedRelationship ? allTags.find(t => t.id === selectedRelationship)?.label : null,
      ].filter(Boolean);
      updateFormData('selectedTagLabels', allLabels);
    }
    setCustomTagInput('');
  };

  // 删除自定义标签
  const removeCustomTag = (tagToRemove) => {
    const newCustomTags = customTags.filter(t => t !== tagToRemove);
    setCustomTags(newCustomTags);
    updateFormData('customPersonaTags', newCustomTags);
    
    // 同时更新 selectedTagLabels
    const allLabels = [
      ...selectedPersonaTags.map(id => allTags.find(t => t.id === id)?.label).filter(Boolean),
      ...newCustomTags,
      selectedRelationship ? allTags.find(t => t.id === selectedRelationship)?.label : null,
    ].filter(Boolean);
    updateFormData('selectedTagLabels', allLabels);
  };

  // 检查标签是否被 AI 推荐
  const isAIRecommended = (tagLabel) => {
    return aiRecommendedTags.some(t => t.toLowerCase() === tagLabel.toLowerCase());
  };

  // 渲染 Persona 标签（多选）
  const renderPersonaTag = (tag) => {
    const isSelected = selectedPersonaTags.includes(tag.id);
    const isRecommended = isAIRecommended(tag.label);
    
    return (
      <button
        key={tag.id}
        onClick={() => togglePersonaTag(tag.id)}
        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
          isSelected
            ? 'bg-white text-gray-900 shadow-md ring-2 ring-white/50'
            : isRecommended
              ? 'bg-gray-700 text-white/90 hover:bg-gray-600 ring-2 ring-emerald-400/60'
              : 'bg-gray-800 text-white/80 hover:bg-gray-700 border border-gray-700'
        }`}
      >
        <span className="text-lg">{tag.emoji}</span>
        <span>{tag.label}</span>
        {isRecommended && !isSelected && <span className="text-emerald-400">✨</span>}
      </button>
    );
  };

  // 检查 Relationship 是否被 AI 推荐
  const isRelationshipAIRecommended = (tagLabel) => {
    if (!aiRecommendedRelationship) return false;
    return tagLabel.toLowerCase() === aiRecommendedRelationship.toLowerCase();
  };

  // 渲染 Relationship 标签（单选，胶囊样式 - 和 Persona 统一）
  const renderRelationshipTag = (tag) => {
    const isSelected = selectedRelationship === tag.id;
    const isRecommended = isRelationshipAIRecommended(tag.label);
    
    return (
      <button
        key={tag.id}
        onClick={() => selectRelationship(tag.id)}
        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
          isSelected
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md ring-2 ring-pink-300/50'
            : isRecommended
              ? 'bg-gray-700 text-white/90 hover:bg-gray-600 ring-2 ring-emerald-400/60'
              : 'bg-gray-800 text-white/80 hover:bg-gray-700 border border-gray-700'
        }`}
      >
        <span className="text-lg">{tag.emoji}</span>
        <span>{tag.label}</span>
        {isRecommended && !isSelected && <span className="text-emerald-400 text-xs">✨</span>}
        {isSelected && <span className="text-white/80">✓</span>}
      </button>
    );
  };

  // 计算总选中数（包含自定义标签）
  const totalSelected = selectedPersonaTags.length + customTags.length + (selectedRelationship ? 1 : 0);

  return (
    <StepLayout nextDisabled={selectedPersonaTags.length === 0}>
      <div className="h-full flex flex-col px-5 pt-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
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

        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white italic text-center">
            Define your<br />character
          </h1>
          {/* 统一 Shuffle 按钮 */}
          <button
            onClick={shuffleAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium hover:opacity-90 hover:scale-105 transition-all shadow-lg"
          >
            <span>🎲</span>
            Shuffle
          </button>
        </div>

        {/* AI Loading - Shimmer Effect */}
        {isLoadingAI && (
          <div className="bg-indigo-500/15 border border-indigo-500/30 rounded-2xl px-4 py-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
              <span className="text-indigo-300 text-sm">AI 正在分析图片...</span>
            </div>
          </div>
        )}

        {/* AI Recommendation Success */}
        {aiRecommendedTags.length > 0 && !isLoadingAI && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-4 py-2 mb-4">
            <p className="text-emerald-300 text-xs text-center">
              ✨ AI 已推荐 {aiRecommendedTags.length} 个标签 · 点击修改 · 试试 Shuffle 🎲
            </p>
          </div>
        )}

        {/* Tag Sections */}
        <div className="flex-1 overflow-y-auto pb-4 space-y-5">
          
          {/* Persona Section (Multi-select) */}
          <div>
            <div className="flex items-center gap-3 py-2">
              <span className="text-2xl">🎭</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-base">Persona</h3>
                  {selectedPersonaTags.length > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                      {selectedPersonaTags.length}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">TA 的身份、风格、人设（可多选）</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2.5 mt-3">
              {shuffledPersonaTags.map(tag => renderPersonaTag(tag))}
              
              {/* 自定义标签显示 */}
              {customTags.map((tag, index) => (
                <div
                  key={`custom-${index}`}
                  className="px-4 py-2.5 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-300 flex items-center gap-2 border border-indigo-500/40"
                >
                  <span>✏️</span>
                  <span>{tag}</span>
                  <button
                    onClick={() => removeCustomTag(tag)}
                    className="text-indigo-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* 添加自定义标签输入框 */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="自定义..."
                  className="w-24 px-4 py-2 rounded-full text-sm bg-gray-800/50 text-white/70 placeholder-gray-500 border border-dashed border-gray-600 focus:border-indigo-400 focus:outline-none"
                />
                <button
                  onClick={addCustomTag}
                  disabled={!customTagInput.trim()}
                  className="w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:bg-indigo-500 hover:text-white flex items-center justify-center text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Relationship Section (Single-select) */}
          <div>
            <div className="flex items-center gap-3 py-2">
              <span className="text-2xl">💕</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-base">Relationship</h3>
                  {selectedRelationship && (
                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">TA 和你是什么关系？</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2.5 mt-2">
              {shuffledRelationshipTags.map(tag => renderRelationshipTag(tag))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="py-3 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">
              已选择 <span className="text-white font-medium">{totalSelected}</span> 个标签
            </span>
            <div className="flex gap-3">
              {totalSelected > 0 && (
                <button 
                  onClick={() => {
                    setSelectedPersonaTags([]);
                    setSelectedRelationship(null);
                    setCustomTags([]);
                    updateFormData('customPersonaTags', []);
                    updateAllFormData([], null);
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
