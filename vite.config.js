import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const TAG_LIBRARY_CUSTOM_PATH = path.resolve(__dirname, 'src/data/tagLibrary-custom.json')
const VOICE_LIBRARY_JSON_PATH = path.resolve(__dirname, 'src/data/voiceLibrary.json')
const VOICE_LIBRARY_JS_PATH = path.resolve(__dirname, 'src/data/voiceLibrary.js')

// 标签库同步 API：供 tag-collector 工具读写 custom 标签，主工具通过 tagLibrary.js 合并后使用
// ⬇️ 终端日志：每次操作都会在 vite dev 的终端打印，方便确认同步是否成功
function tagLibraryApiPlugin() {
  const log = (emoji, msg) => console.log(`\x1b[36m[TagSync]\x1b[0m ${emoji} ${msg}`)
  const logErr = (emoji, msg) => console.error(`\x1b[31m[TagSync]\x1b[0m ${emoji} ${msg}`)

  return {
    name: 'tag-library-api',
    configureServer(server) {
      log('🚀', `插件已加载，JSON 路径: ${TAG_LIBRARY_CUSTOM_PATH}`)

      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/tag-library')) return next()
        const url = new URL(req.url, `http://${req.headers.host}`)
        const method = req.method

        const readCustom = () => {
          try {
            const raw = fs.readFileSync(TAG_LIBRARY_CUSTOM_PATH, 'utf-8')
            return JSON.parse(raw)
          } catch {
            return []
          }
        }
        const writeCustom = (data) => {
          fs.writeFileSync(TAG_LIBRARY_CUSTOM_PATH, JSON.stringify(data, null, 2), 'utf-8')
          log('💾', `已写入 ${data.length} 条标签到 tagLibrary-custom.json`)
        }

        // GET /api/tag-library/custom → 返回当前 custom 列表
        if (method === 'GET' && url.pathname === '/api/tag-library/custom') {
          const data = readCustom()
          log('📖', `GET /custom → 返回 ${data.length} 条标签`)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
          return
        }

        // POST 需要读 body
        if (method === 'POST') {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            try {
              const payload = body ? JSON.parse(body) : {}
              const list = readCustom()

              // POST /api/tag-library/add { label }
              if (url.pathname === '/api/tag-library/add') {
                const label = (payload.label || '').trim()
                if (!label) {
                  logErr('⛔', 'POST /add → label 为空，已拒绝')
                  res.statusCode = 400
                  res.end(JSON.stringify({ ok: false, error: 'missing label' }))
                  return
                }
                const exists = list.some((t) => t.label.toLowerCase() === label.toLowerCase())
                if (exists) {
                  log('⏭️', `POST /add → "${label}" 已存在，跳过`)
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(list))
                  return
                }
                const nextId = `c${list.length + 1}`
                list.push({ id: nextId, label, dimension: 'custom' })
                writeCustom(list)
                log('➕', `POST /add → 新增 "${label}" (${nextId})，当前共 ${list.length} 条`)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(list))
                return
              }

              // POST /api/tag-library/delete { label }
              if (url.pathname === '/api/tag-library/delete') {
                const label = (payload.label || '').trim()
                const nextList = list.filter((t) => t.label !== label)
                writeCustom(nextList)
                log('🗑️', `POST /delete → 删除 "${label}"，剩余 ${nextList.length} 条`)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(nextList))
                return
              }

              // POST /api/tag-library/replace { tags: [...] }
              if (url.pathname === '/api/tag-library/replace') {
                const tags = Array.isArray(payload.tags) ? payload.tags : []
                const nextList = tags.map((t, i) => ({
                  id: t.id || `c${i + 1}`,
                  label: (t.label || '').trim(),
                  dimension: 'custom',
                })).filter((t) => t.label)
                writeCustom(nextList)
                const labels = nextList.map(t => t.label).join(', ')
                log('🔄', `POST /replace → 整表替换为 ${nextList.length} 条: [${labels}]`)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(nextList))
                return
              }
            } catch (e) {
              logErr('💥', `POST 处理异常: ${e.message}`)
              res.statusCode = 400
              res.end(JSON.stringify({ ok: false, error: String(e.message) }))
              return
            }
            next()
          })
          return
        }

        next()
      })
    },
  }
}

// 音色库同步 API：ElevenLabs API 拉取成功后，将音色列表写入 voiceLibrary.js + voiceLibrary.json，供后台读取
function voiceLibrarySyncPlugin() {
  const log = (emoji, msg) => console.log(`\x1b[35m[VoiceSync]\x1b[0m ${emoji} ${msg}`)
  const logErr = (emoji, msg) => console.error(`\x1b[31m[VoiceSync]\x1b[0m ${emoji} ${msg}`)

  function escapeJsStr(s) {
    if (s == null) return 'null'
    const str = String(s)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
    return `'${str}'`
  }

  function voiceToJsEntry(voice, index) {
    const rec = index === 0
    const tags = Array.isArray(voice.tags) ? voice.tags : []
    const matchingPersona = Array.isArray(voice.matchingPersona) ? voice.matchingPersona : tags
    const lines = [
      `    id: ${escapeJsStr(voice.id)}`,
      `    name: ${escapeJsStr(voice.name)}`,
      `    gender: ${escapeJsStr(voice.gender)}`,
      `    tags: [${tags.map(t => escapeJsStr(t)).join(', ')}]`,
      `    description: ${escapeJsStr(voice.description || '')}`,
      `    previewUrl: ${voice.previewUrl != null ? escapeJsStr(voice.previewUrl) : 'null'}`,
      `    recommended: ${rec}`,
      `    matchingPersona: [${matchingPersona.map(t => escapeJsStr(t)).join(', ')}]`,
    ]
    return `  {\n${lines.join(',\n')},\n  }`
  }

  return {
    name: 'voice-library-sync',
    configureServer(server) {
      log('🚀', `插件已加载，音色库路径: ${VOICE_LIBRARY_JS_PATH}`)
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST' || !req.url?.startsWith('/api/voice-library/sync')) return next()
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const payload = body ? JSON.parse(body) : {}
            const voices = Array.isArray(payload.voices) ? payload.voices : []
            if (voices.length === 0) {
              logErr('⛔', 'POST /sync → voices 为空，已拒绝')
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: 'voices array required' }))
              return
            }
            const now = new Date().toISOString().slice(0, 10)
            const forFile = voices.map((v, i) => ({
              id: v.id,
              name: v.name,
              gender: v.gender || 'Unknown',
              tags: Array.isArray(v.tags) ? v.tags : [],
              description: v.description || '',
              previewUrl: v.previewUrl || null,
              recommended: i === 0,
              matchingPersona: Array.isArray(v.matchingPersona) ? v.matchingPersona : (v.tags || []),
            }))

            // 写入 JSON
            const jsonContent = JSON.stringify({
              version: '2.0',
              lastUpdated: now,
              source: 'ElevenLabs API 同步',
              voices: forFile.map(({ recommended, ...rest }) => rest),
            }, null, 2)
            fs.writeFileSync(VOICE_LIBRARY_JSON_PATH, jsonContent + '\n', 'utf-8')
            log('💾', `已写入 voiceLibrary.json，共 ${forFile.length} 个音色`)

            // 写入 JS
            const jsEntries = forFile.map((v, i) => voiceToJsEntry(v, i))
            const jsContent = `// 音色库数据 - 由 ElevenLabs API 同步写入，请勿手改
// 📅 最后同步：${now}

const PREVIEW_PLACEHOLDER = null;

export const VOICE_LIBRARY = [
${jsEntries.join(',\n')}
];

// 获取推荐音色
export function getRecommendedVoice() {
  return VOICE_LIBRARY.find(voice => voice.recommended) || VOICE_LIBRARY[0];
}

// 根据 ID 获取音色
export function getVoiceById(id) {
  return VOICE_LIBRARY.find(voice => voice.id === id);
}

// 根据名称获取音色
export function getVoiceByName(name) {
  return VOICE_LIBRARY.find(voice =>
    voice.name.toLowerCase() === name.toLowerCase()
  );
}

// 获取所有音色
export function getAllVoices() {
  return VOICE_LIBRARY;
}

// 根据标签筛选音色
export function filterVoicesByTags(tags) {
  return VOICE_LIBRARY.filter(voice =>
    tags.some(tag => voice.tags.includes(tag))
  );
}

// 根据人设匹配音色
export function matchVoiceByPersona(personaTags) {
  const matched = VOICE_LIBRARY.filter(voice =>
    voice.matchingPersona?.some(p =>
      personaTags.some(tag => tag.toLowerCase().includes(p.toLowerCase()))
    )
  );
  return matched.length > 0 ? matched[0] : getRecommendedVoice();
}
`
            fs.writeFileSync(VOICE_LIBRARY_JS_PATH, jsContent, 'utf-8')
            log('💾', `已写入 voiceLibrary.js，共 ${forFile.length} 个音色`)

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, count: forFile.length }))
          } catch (e) {
            logErr('💥', `POST /sync 异常: ${e.message}`)
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(e.message) }))
          }
        })
      })
    },
  }
}

// ⚠️ 开发端口：固定 5174，所有测试/文档请以此为准（npm run dev 后终端会打印 Local: http://localhost:5174/）
const DEV_PORT = 5174;

export default defineConfig({
  plugins: [react(), tagLibraryApiPlugin(), voiceLibrarySyncPlugin()],
  server: {
    port: DEV_PORT,
    strictPort: true, // 固定端口，避免端口漂移导致测试地址错误
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
