import React, { useRef, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import StepLayout from '../components/StepLayout';

// 第一步：拍照/上传图片
const Step1TakePicture = () => {
  const { formData, updateFormData } = useAppContext();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [preview, setPreview] = useState(formData.uploadedImage);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' 前置, 'environment' 后置

  // 清理摄像头流
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // 处理文件选择 - 保持高质量
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件大小，如果超过 5MB 则进行适当压缩
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (file.size > maxSize) {
        // 大图需要压缩
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (event) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDimension = 2048; // 最大边长
            
            let width = img.width;
            let height = img.height;
            
            // 按比例缩放
            if (width > height && width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 高质量 JPEG
            const imageData = canvas.toDataURL('image/jpeg', 0.92);
            setPreview(imageData);
            updateFormData('uploadedImage', imageData);
            closeCameraMode();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // 小图直接使用原始数据
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = reader.result;
          setPreview(imageData);
          updateFormData('uploadedImage', imageData);
          closeCameraMode();
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // 打开文件选择器
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 打开摄像头
  const handleCameraClick = async () => {
    try {
      const cameraStream = await startCamera(facingMode);
      setStream(cameraStream);
      setIsCameraMode(true);
    } catch (error) {
      alert(error.message);
    }
  };

  // 启动摄像头
  const startCamera = async (mode) => {
    try {
      // 先停止现有的流
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false
      });
      
      // 等待 video 元素加载
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      }, 100);
      
      return cameraStream;
    } catch (error) {
      console.error('无法访问摄像头:', error);
      throw new Error('无法访问摄像头，请检查权限设置');
    }
  };

  // 切换前后摄像头
  const handleSwitchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    try {
      const cameraStream = await startCamera(newMode);
      setStream(cameraStream);
    } catch (error) {
      console.error('切换摄像头失败:', error);
    }
  };

  // 拍照
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      // 前置摄像头需要水平翻转
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0);
      
      // 重置变换
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      setPreview(imageData);
      updateFormData('uploadedImage', imageData);
      closeCameraMode();
    }
  };

  // 关闭摄像头模式
  const closeCameraMode = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraMode(false);
  };

  // 清除图片
  const handleClear = () => {
    setPreview(null);
    updateFormData('uploadedImage', null);
  };

  // 关闭/退出
  const handleClose = () => {
    if (confirm('确定要退出吗？当前进度将会丢失。')) {
      // 刷新页面，重置所有状态
      window.location.reload();
    }
  };

  return (
    <StepLayout nextDisabled={!preview}>
      <div className="relative flex flex-col h-full bg-black">
        {/* 右上角关闭按钮 */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={handleClose}
            className="text-white text-3xl font-light hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>

        {/* 图片预览/摄像头区域 - 全屏 */}
        <div className="relative flex-1 bg-gray-900 overflow-hidden">
          {/* 顶部标题遮罩 */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent pt-6 pb-24">
            <h1 className="text-4xl font-bold text-white italic text-center" style={{ fontStyle: 'italic' }}>
              Take a picture
            </h1>
          </div>

          {isCameraMode ? (
            <>
              {/* 摄像头视频流 */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              {/* 拍照按钮 */}
              <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-6 items-center">
                {/* 取消按钮 */}
                <button
                  onClick={closeCameraMode}
                  className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-2xl">×</span>
                </button>
                {/* 拍照按钮 */}
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 hover:scale-105 transition-transform shadow-xl"
                />
                {/* 切换摄像头按钮 */}
                <button
                  onClick={handleSwitchCamera}
                  className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </>
          ) : preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white/60 text-base font-medium">点击下方按钮</p>
                <p className="text-white/40 text-sm mt-1">上传或拍摄照片</p>
              </div>
            </div>
          )}

          {/* 底部渐变遮罩 */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
        </div>

        {/* 底部操作区域 */}
        <div className="relative z-10 bg-black pt-4 pb-8 px-6">
          {/* 操作按钮 */}
          {!isCameraMode && (
            <div className="flex justify-center items-center gap-8 mb-6">
              {/* 图库按钮 */}
              <button 
                onClick={handleUploadClick}
                className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* 中间按钮：有图时显示 Retake，无图时显示拍照 */}
              {preview ? (
                <button 
                  onClick={handleClear}
                  className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/30 hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={handleCameraClick}
                  className="w-20 h-20 bg-white rounded-full border-4 border-white/30 hover:scale-105 transition-transform shadow-lg"
                />
              )}

              {/* 切换镜头按钮 */}
              <button 
                onClick={handleCameraClick}
                className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}

          {/* 底部标签 */}
          <div className="flex justify-center gap-3">
            <button className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
              Character
            </button>
            <button className="px-6 py-2.5 bg-transparent text-gray-400 rounded-full text-sm font-semibold hover:text-gray-300 transition-colors border border-gray-700 hover:border-gray-600">
              Chat to build
            </button>
          </div>
        </div>

        {/* 隐藏的文件输入和 canvas */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </StepLayout>
  );
};

export default Step1TakePicture;
