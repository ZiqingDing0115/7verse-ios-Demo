import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // 如果 5173 被占用，自动尝试下一个端口
    proxy: {
      // Qwen 大模型 API 代理（支持流式输出）
      '/api/qwen': {
        target: 'https://qwen-thinking.vivix.work',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/qwen/, '/v1'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🤖 Qwen 代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📨 Qwen 代理响应:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ Qwen 代理错误:', err.message);
          });
        },
      },
      // Flux 图生图 API 代理
      '/api/flux': {
        target: 'https://flux2.vivix.work',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/flux/, '/api'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🎨 Flux 代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📨 Flux 代理响应:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ Flux 代理错误:', err.message);
          });
        },
      },
      // 7verse 存储 API 代理（上传图片）
      '/api/7verse-storage': {
        target: 'https://uat.7verse.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/7verse-storage/, '/api/v2/storage'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Host', 'uat.7verse.ai');
            console.log('📤 7verse 存储代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📨 7verse 存储代理响应:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ 7verse 存储代理错误:', err.message);
          });
        },
      },
      // 7verse 图生图 API 代理
      '/api/7verse': {
        target: 'https://uat.7verse.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/7verse/, '/api/v1'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Host', 'uat.7verse.ai');
            console.log('🔀 7verse 代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📨 7verse 代理响应:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ 7verse 代理错误:', err.message);
          });
        },
      },
    },
  },
})
