import React from 'react';

/**
 * Shimmer Effect Reference Component
 * 展示项目中所有 Shimmer 加载动效的样式参考
 */
const ShimmerReference = () => {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">Shimmer Effect Reference</h1>
      
      {/* 1. Shimmer Circle - 圆形加载器 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">1. Shimmer Circle</h2>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="shimmer-circle w-8 h-8"></div>
            <div className="shimmer-circle w-12 h-12"></div>
            <div className="shimmer-circle w-16 h-16"></div>
          </div>
          <pre className="mt-4 text-gray-400 text-sm">
{`<div className="shimmer-circle w-12 h-12"></div>`}
          </pre>
        </div>
      </section>

      {/* 2. Shimmer Line - 线条加载器 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">2. Shimmer Line</h2>
        <div className="bg-gray-800 rounded-xl p-6 space-y-3">
          <div className="shimmer-line w-full"></div>
          <div className="shimmer-line w-3/4"></div>
          <div className="shimmer-line w-1/2"></div>
          <pre className="mt-4 text-gray-400 text-sm">
{`<div className="shimmer-line w-full"></div>
<div className="shimmer-line w-3/4"></div>
<div className="shimmer-line w-1/2"></div>`}
          </pre>
        </div>
      </section>

      {/* 3. Card Loading - 卡片加载 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">3. Card Loading (Step 2 Style)</h2>
        <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="shimmer-circle w-8 h-8"></div>
            <div className="flex-1">
              <div className="shimmer-line w-3/4 mb-2"></div>
              <div className="shimmer-line w-1/2 h-2"></div>
            </div>
          </div>
          <span className="text-blue-300 text-sm">✨ AI 正在分析图片推荐标签...</span>
        </div>
        <pre className="mt-4 text-gray-400 text-sm bg-gray-800 rounded p-4">
{`<div className="bg-blue-500/20 border border-blue-500/40 rounded-xl p-3">
  <div className="flex items-center gap-3 mb-3">
    <div className="shimmer-circle w-8 h-8"></div>
    <div className="flex-1">
      <div className="shimmer-line w-3/4 mb-2"></div>
      <div className="shimmer-line w-1/2 h-2"></div>
    </div>
  </div>
  <span className="text-blue-300 text-sm">✨ AI 正在分析...</span>
</div>`}
        </pre>
      </section>

      {/* 4. Multiple Circles - 多圆形加载 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">4. Multiple Circles (Step 3 Modal)</h2>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-center gap-3 mb-4">
            <div className="shimmer-circle w-12 h-12"></div>
            <div className="shimmer-circle w-12 h-12" style={{ animationDelay: '0.2s' }}></div>
            <div className="shimmer-circle w-12 h-12" style={{ animationDelay: '0.4s' }}></div>
            <div className="shimmer-circle w-12 h-12" style={{ animationDelay: '0.6s' }}></div>
          </div>
          <p className="text-white text-center">正在生成 4 张风格图...</p>
          <pre className="mt-4 text-gray-400 text-sm">
{`<div className="flex justify-center gap-3">
  <div className="shimmer-circle w-12 h-12"></div>
  <div className="shimmer-circle w-12 h-12" style={{ animationDelay: '0.2s' }}></div>
  <div className="shimmer-circle w-12 h-12" style={{ animationDelay: '0.4s' }}></div>
  <div className="shimmer-circle w-12 h-12" style={{ animationDelay: '0.6s' }}></div>
</div>`}
          </pre>
        </div>
      </section>

      {/* 5. Voice Library Loading - 音色库加载 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">5. Voice Library Loading</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800/60 rounded-3xl p-4 flex items-center gap-3">
              <div className="shimmer-circle w-10 h-10"></div>
              <div className="flex-1">
                <div className="shimmer-line w-3/4 mb-2"></div>
                <div className="shimmer-line w-1/2 h-2"></div>
              </div>
            </div>
          ))}
        </div>
        <pre className="mt-4 text-gray-400 text-sm bg-gray-800 rounded p-4">
{`{[1, 2, 3, 4, 5].map((i) => (
  <div key={i} className="bg-gray-800/60 rounded-3xl p-4 flex items-center gap-3">
    <div className="shimmer-circle w-10 h-10"></div>
    <div className="flex-1">
      <div className="shimmer-line w-3/4 mb-2"></div>
      <div className="shimmer-line w-1/2 h-2"></div>
    </div>
  </div>
))}`}
        </pre>
      </section>

      {/* 6. Text Loading - 文本加载 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">6. Text Loading (Step 4)</h2>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-300 mb-2">
              <div className="shimmer-circle w-4 h-4"></div>
              <span className="text-sm">✨ AI 正在生成...</span>
            </div>
            <div className="shimmer-line h-4 w-full"></div>
            <div className="shimmer-line h-4 w-5/6"></div>
            <div className="shimmer-line h-4 w-3/4"></div>
          </div>
        </div>
        <pre className="mt-4 text-gray-400 text-sm bg-gray-800 rounded p-4">
{`<div className="space-y-3">
  <div className="flex items-center gap-2 text-purple-300">
    <div className="shimmer-circle w-4 h-4"></div>
    <span className="text-sm">✨ AI 正在生成...</span>
  </div>
  <div className="shimmer-line h-4 w-full"></div>
  <div className="shimmer-line h-4 w-5/6"></div>
  <div className="shimmer-line h-4 w-3/4"></div>
</div>`}
        </pre>
      </section>

      {/* 7. Image Placeholder Loading - 图片占位加载 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">7. Image Placeholder Loading</h2>
        <div className="w-full h-64 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-3xl flex items-center justify-center">
          <div className="text-center w-full px-4">
            <div className="shimmer-circle w-16 h-16 mx-auto mb-3"></div>
            <div className="shimmer-line w-3/4 mx-auto mb-2"></div>
            <div className="shimmer-line w-1/2 mx-auto h-2"></div>
          </div>
        </div>
        <pre className="mt-4 text-gray-400 text-sm bg-gray-800 rounded p-4">
{`<div className="text-center w-full px-4">
  <div className="shimmer-circle w-16 h-16 mx-auto mb-3"></div>
  <div className="shimmer-line w-3/4 mx-auto mb-2"></div>
  <div className="shimmer-line w-1/2 mx-auto h-2"></div>
</div>`}
        </pre>
      </section>

      {/* CSS Reference */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">CSS Classes (in index.css)</h2>
        <div className="bg-gray-800 rounded-xl p-6 text-gray-300 text-sm font-mono space-y-2">
          <p>✅ <span className="text-green-400">.shimmer-wrapper</span> - 容器闪光效果</p>
          <p>✅ <span className="text-green-400">.shimmer-line</span> - 线条加载器</p>
          <p>✅ <span className="text-green-400">.shimmer-circle</span> - 圆形加载器</p>
        </div>
      </section>
    </div>
  );
};

export default ShimmerReference;
