import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
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
