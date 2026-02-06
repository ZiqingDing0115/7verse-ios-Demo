import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { getAIProvider } from './config/api';
import Stepper from './components/Stepper';
import Step1TakePicture from './steps/Step1TakePicture';
import Step2AddPersona from './steps/Step2AddPersona';
import Step3PickImageVoice from './steps/Step3PickImageVoice';
import Step4Preview from './steps/Step4Preview';

// 步骤配置
const steps = ['Take Picture', 'Add Persona', 'Pick Style', 'Preview'];

// 主应用内容
const AppContent = () => {
  const { currentStep } = useAppContext();
  const aiProvider = getAIProvider();

  // 根据当前步骤渲染对应页面
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1TakePicture />;
      case 1:
        return <Step2AddPersona />;
      case 2:
        return <Step3PickImageVoice />;
      case 3:
        return <Step4Preview />;
      default:
        return <Step1TakePicture />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* iOS 设备容器 */}
      <div className="w-full max-w-[390px] h-[844px] bg-black rounded-[3rem] shadow-2xl overflow-hidden relative border-8 border-gray-800">
        {/* iOS 刘海 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50"></div>
        {/* 当前 AI 测试地址标识：Qwen 默认 / ?ai=gemini 为 Gemini，点击可切换 */}
        <a
          href={aiProvider === 'gemini' ? (typeof window !== 'undefined' ? window.location.pathname || '/' : '/') : '?ai=gemini'}
          className="absolute top-2 right-4 z-50 text-[10px] font-medium px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
          title={aiProvider === 'gemini' ? '当前：Gemini，点击切回 Qwen' : '当前：Qwen，点击切到 Gemini'}
        >
          AI: {aiProvider === 'gemini' ? 'Gemini' : 'Qwen'}
        </a>
        
        {/* 应用内容区域 - 添加顶部安全区域 */}
        <div className="w-full h-full flex flex-col bg-black pt-8">
          {/* 步骤条 */}
          <Stepper currentStep={currentStep} steps={steps} />
          
          {/* 当前步骤内容 */}
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

// 根组件
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
