import React, { createContext, useContext, useState, useEffect } from 'react';
import { voiceService } from '../services/voiceService';

// 创建全局数据中心
const AppContext = createContext();

// 这个是给其他组件用的，方便获取数据
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// 数据中心的管理器
export const AppProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0); // 当前在第几步（0-3）
  
  // 存储用户的所有选择
  const [formData, setFormData] = useState({
    uploadedImage: null,        // 用户上传的图片
    selectedTags: [],           // 选中的标签（persona 和 relationship）
    selectedStyleIndex: null,   // 选中的风格图索引
    selectedVoice: null,        // 选中的音色
  });

  // 音色库状态（从 ElevenLabs 预加载）
  const [voiceLibrary, setVoiceLibrary] = useState([]);
  const [voiceLibraryLoading, setVoiceLibraryLoading] = useState(true);
  const [voiceLibraryError, setVoiceLibraryError] = useState(null);

  // 应用启动时预加载音色库
  useEffect(() => {
    const loadVoiceLibrary = async () => {
      console.log('🚀 应用启动，预加载音色库...');
      setVoiceLibraryLoading(true);
      setVoiceLibraryError(null);
      
      try {
        const result = await voiceService.prefetchVoices();
        
        if (result.success) {
          setVoiceLibrary(result.voices);
          console.log(`✅ 音色库已缓存到 Context，来源: ${result.source}`);
        } else {
          setVoiceLibraryError('Failed to load voice library');
        }
      } catch (error) {
        console.error('❌ 加载音色库失败:', error);
        setVoiceLibraryError(error.message);
      } finally {
        setVoiceLibraryLoading(false);
      }
    };

    loadVoiceLibrary();
  }, []);

  // 更新某个字段的值
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 下一步
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 跳转到指定步骤
  const goToStep = (step) => {
    if (step >= 0 && step <= 3) {
      setCurrentStep(step);
    }
  };

  const value = {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    // 音色库相关
    voiceLibrary,
    voiceLibraryLoading,
    voiceLibraryError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
