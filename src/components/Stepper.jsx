import React from 'react';

// 步骤条组件 - 三条进度条设计
const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="w-full px-6 py-4">
      <div className="flex items-center gap-2">
        {steps.slice(0, 3).map((step, index) => (
          <div
            key={index}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'bg-white'
                : index < currentStep
                  ? 'bg-gray-500'
                  : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Stepper;
