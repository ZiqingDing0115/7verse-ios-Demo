import React from 'react';
import { useAppContext } from '../context/AppContext';

// 每个步骤页面的通用布局
const StepLayout = ({ children, showBack = true, showNext = true, onNext, nextDisabled = false }) => {
  const { prevStep, nextStep, currentStep } = useAppContext();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* 底部按钮区域 */}
      <div className="p-5 flex gap-3 bg-black">
        {showBack && currentStep > 0 && (
          <button
            onClick={prevStep}
            className="flex-1 py-4 rounded-full bg-gray-800/60 text-white font-bold text-base"
          >
            Back
          </button>
        )}
        {showNext && (
          <button
            onClick={handleNext}
            disabled={nextDisabled}
            className={`flex-1 py-4 rounded-full font-bold text-base transition-all ${
              nextDisabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-white text-black'
            }`}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default StepLayout;
