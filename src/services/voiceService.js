// Voice Service - ElevenLabs 音色库管理
// 负责获取、缓存和转换 ElevenLabs 音色数据
// 📅 最后更新：2026-02-05
// 🔄 实时同步：在 ElevenLabs 维护音色 → 前端 10 分钟内自动同步

import { callElevenLabsOfficialAPI, callElevenLabsSharedAPI, callElevenLabsV2VoicesAPI } from '../config/api';
import { VOICE_LIBRARY } from '../data/voiceLibrary';

// ============================================================================
// 音色库配置（运营可在此调整音色来源）
// ============================================================================
const VOICE_CONFIG = {
  // 使用的音色类别（premade=官方预设，cloned=自定义克隆，generated=AI生成，professional=专业音色）
  allowedCategories: ['premade', 'cloned', 'generated', 'professional'],
  
  // 是否包含社区共享音色（false = 只用自己账号的音色）
  includeCommunityVoices: false,
  
  // 🆕 按 Collection ID 拉取（从 ElevenLabs 网页的 URL 获取，如 collectionId=O61D3sjuAajNAZz5xVCo）
  // 若非空，则通过 v2 API 只拉取该 Collection 内的音色，忽略其他配置项
  // 若为 null，则使用原有 v1 全库拉取逻辑
  collectionId: 'O61D3sjuAajNAZz5xVCo', // [iOS] 7verse投稿音色库 by Katherine
  
  // 可选：只要名字包含特定关键词的音色（null = 全部，否则填数组）
  nameKeywords: null, // 例如：['7verse', 'ios']
};

// 缓存的音色库数据
let cachedVoices = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 分钟缓存

// 控制台输出样式
const LOG_DIVIDER = '═══════════════════════════════════════════════════════════════';

/**
 * 将 ElevenLabs 官方音色数据转换为应用格式
 * 官方音色使用 labels 对象存储属性
 * @param {Object} v - ElevenLabs 官方音色对象
 * @returns {Object} - 转换后的音色对象
 */
function transformOfficialVoice(v) {
  const labels = v.labels || {};
  
  // 提取标签
  const tags = [
    labels.accent,
    labels.age,
    labels.descriptive,
    labels.use_case,
    v.category,
  ].filter(Boolean);
  
  // 确定性别（首字母大写）
  let gender = labels.gender || 'unknown';
  gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  
  return {
    id: v.voice_id,
    name: v.name,
    gender: gender,
    accent: labels.accent || '',
    age: labels.age || '',
    tags: tags,
    description: v.description || `${v.name} voice`,
    previewUrl: v.preview_url || null,
    category: v.category || 'premade',
    useCase: labels.use_case || '',
    source: 'official', // 标记为官方音色
    isOfficial: true,
    _original: v,
  };
}

/**
 * 将 ElevenLabs 社区音色数据转换为应用格式
 * 社区音色使用扁平字段
 * @param {Object} v - ElevenLabs 社区音色对象
 * @returns {Object} - 转换后的音色对象
 */
function transformSharedVoice(v) {
  // 提取标签（accent, age, descriptive, use_case 等）
  const tags = [
    v.accent,
    v.age,
    v.descriptive,
    v.use_case,
    v.category,
  ].filter(Boolean);
  
  // 确定性别（首字母大写）
  let gender = v.gender || 'unknown';
  gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  
  return {
    id: v.voice_id,
    name: v.name,
    gender: gender,
    accent: v.accent || '',
    age: v.age || '',
    tags: tags,
    description: v.description || `${v.name} voice`,
    previewUrl: v.preview_url || null,
    category: v.category || 'shared',
    useCase: v.use_case || '',
    source: 'community', // 标记为社区音色
    isOfficial: false,
    _original: v,
  };
}

/**
 * 将当前缓存的音色同步到 voiceLibrary.js + voiceLibrary.json（供后台读取）
 * 仅在前端开发环境生效（POST 到 Vite 提供的 /api/voice-library/sync）
 * @param {Array} voices - 音色列表（含 id/name/gender/tags/description/previewUrl）
 */
async function syncVoicesToFiles(voices) {
  if (!voices || voices.length === 0) return;
  const payload = voices.map((v) => ({
    id: v.id,
    name: v.name,
    gender: v.gender,
    tags: v.tags || [],
    description: v.description || '',
    previewUrl: v.previewUrl || null,
    matchingPersona: v.matchingPersona || v.tags || [],
  }));
  try {
    const res = await fetch('/api/voice-library/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voices: payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      console.log(`📂 音色已同步到 voiceLibrary.js / voiceLibrary.json，共 ${data.count} 个（后台可直接读取）`);
    } else {
      console.warn('⚠️ 音色同步到文件失败（可能非 dev 环境）:', data.error || res.status);
    }
  } catch (e) {
    console.warn('⚠️ 音色同步请求失败:', e.message);
  }
}

/**
 * 预获取并缓存 ElevenLabs 音色库
 * 若配置了 collectionId，使用 v2 API 按 Collection 拉取；否则使用 v1 拉取全库
 * @returns {Promise<Object>} - 包含音色列表的结果对象
 */
export async function prefetchVoices() {
  console.log(LOG_DIVIDER);
  console.log('🎙️ 预加载 ElevenLabs 音色库（实时同步）...');
  console.log('📋 配置:');
  console.log('   类别:', VOICE_CONFIG.allowedCategories.join(', '));
  console.log('   社区音色:', VOICE_CONFIG.includeCommunityVoices ? '✅ 开启' : '❌ 关闭');
  if (VOICE_CONFIG.collectionId) {
    console.log('   🆕 Collection ID:', VOICE_CONFIG.collectionId, '(使用 v2 API)');
  }
  if (VOICE_CONFIG.nameKeywords) {
    console.log('   关键词筛选:', VOICE_CONFIG.nameKeywords.join(', '));
  }
  console.log(LOG_DIVIDER);
  
  try {
    // ========== 分支：按 Collection ID 拉取（v2 API）==========
    if (VOICE_CONFIG.collectionId) {
      const result = await callElevenLabsV2VoicesAPI({
        collectionId: VOICE_CONFIG.collectionId,
      });

      if (!result.success || result.voices.length === 0) {
        console.warn('⚠️ Collection 拉取失败或为空，使用本地备用');
        return useFallbackVoices();
      }

      // 转换并可选按 category 过滤
      const collectionVoices = [];
      result.voices.forEach(v => {
        if (VOICE_CONFIG.allowedCategories.length > 0 &&
            !VOICE_CONFIG.allowedCategories.includes(v.category)) {
          return;
        }
        collectionVoices.push(transformOfficialVoice(v));
      });

      cachedVoices = collectionVoices;
      cacheTimestamp = Date.now();

      console.log(`✅ Collection 音色加载成功！共 ${cachedVoices.length} 个`);
      cachedVoices.slice(0, Math.min(10, cachedVoices.length)).forEach((voice, i) => {
        console.log(`   ${i + 1}. ${voice.name} (${voice.gender}) - ${voice.category}`);
      });
      console.log(LOG_DIVIDER);

      // 实时同步到 voiceLibrary.js / voiceLibrary.json，供后台读取
      await syncVoicesToFiles(cachedVoices);

      return {
        success: true,
        voices: cachedVoices,
        count: cachedVoices.length,
        officialCount: cachedVoices.length,
        sharedCount: 0,
        source: 'elevenlabs_collection',
      };
    }

    // ========== 原有逻辑：v1 全库拉取 ==========
    const [officialResult, sharedResult] = await Promise.all([
      callElevenLabsOfficialAPI(),
      VOICE_CONFIG.includeCommunityVoices 
        ? callElevenLabsSharedAPI() 
        : Promise.resolve({ success: false, voices: [] }),
    ]);
    
    const officialVoices = [];
    const sharedVoices = [];
    
    // 处理我的音色
    if (officialResult.success && officialResult.voices.length > 0) {
      officialResult.voices.forEach(v => {
        if (!VOICE_CONFIG.allowedCategories.includes(v.category)) {
          return;
        }
        
        // 可选：按名字关键词筛选
        if (VOICE_CONFIG.nameKeywords && VOICE_CONFIG.nameKeywords.length > 0) {
          const nameMatch = VOICE_CONFIG.nameKeywords.some(keyword => 
            v.name.toLowerCase().includes(keyword.toLowerCase())
          );
          if (!nameMatch) return;
        }
        
        officialVoices.push(transformOfficialVoice(v));
      });
      console.log(`✅ 我的音色: ${officialVoices.length} 个`);
    } else {
      console.warn('⚠️ 获取音色失败或为空');
    }
    
    // 处理社区音色
    if (sharedResult.success && sharedResult.voices.length > 0) {
      sharedResult.voices.forEach(v => {
        sharedVoices.push(transformSharedVoice(v));
      });
      console.log(`✅ 社区音色: ${sharedVoices.length} 个`);
    } else {
      console.warn('⚠️ 获取社区音色失败或为空');
    }
    
    cachedVoices = [...officialVoices, ...sharedVoices];
    cacheTimestamp = Date.now();
    
    if (cachedVoices.length === 0) {
      console.warn('⚠️ 没有获取到任何音色，使用本地备用');
      return useFallbackVoices();
    }
    
    console.log(`✅ 音色库加载成功！`);
    console.log(`   📊 总共 ${cachedVoices.length} 个音色（我的 ${officialVoices.length} + 社区 ${sharedVoices.length}）`);
    
    // 显示部分音色预览
    console.log('   🎤 我的音色预览:');
    officialVoices.slice(0, 5).forEach((voice, i) => {
      console.log(`      ${i + 1}. ${voice.category === 'premade' ? '🏆' : '✨'} ${voice.name} (${voice.gender}) - ${voice.category}`);
    });
    
    if (sharedVoices.length > 0) {
      console.log('   🎤 社区音色预览:');
      sharedVoices.slice(0, 3).forEach((voice, i) => {
        console.log(`      ${i + 1}. 👥 ${voice.name} (${voice.gender}) - ${voice.accent}`);
      });
    }
    
    console.log(LOG_DIVIDER);

    // 实时同步到 voiceLibrary.js / voiceLibrary.json，供后台读取
    await syncVoicesToFiles(cachedVoices);

    return {
      success: true,
      voices: cachedVoices,
      count: cachedVoices.length,
      officialCount: officialVoices.length,
      sharedCount: sharedVoices.length,
      source: 'elevenlabs_merged',
    };
  } catch (error) {
    console.error('❌ 预加载音色库失败:', error);
    return useFallbackVoices();
  }
}

/**
 * 使用本地音色库作为备用
 */
function useFallbackVoices() {
  console.log('📦 使用本地音色库作为备用...');
  cachedVoices = VOICE_LIBRARY.map(v => ({
    ...v,
    source: 'local',
    isOfficial: false,
  }));
  cacheTimestamp = Date.now();
  
  console.log(`   📊 本地音色库共 ${cachedVoices.length} 个音色`);
  console.log(LOG_DIVIDER);
  
  return {
    success: true,
    voices: cachedVoices,
    count: cachedVoices.length,
    officialCount: 0,
    sharedCount: 0,
    source: 'local_fallback',
  };
}

/**
 * 获取缓存的音色库
 * @param {boolean} forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Array>} - 音色列表
 */
export async function getCachedVoices(forceRefresh = false) {
  // 检查缓存是否有效
  const cacheValid = cachedVoices && cacheTimestamp && 
    (Date.now() - cacheTimestamp < CACHE_DURATION);
  
  if (cacheValid && !forceRefresh) {
    console.log('📦 使用缓存的音色库');
    return cachedVoices;
  }
  
  // 缓存无效或强制刷新，重新获取
  const result = await prefetchVoices();
  return result.voices;
}

/**
 * 根据 ID 获取音色
 * @param {string} voiceId - 音色 ID
 * @returns {Object|null} - 音色对象或 null
 */
export function getVoiceById(voiceId) {
  if (!cachedVoices) {
    console.warn('⚠️ 音色库未加载，返回 null');
    return null;
  }
  return cachedVoices.find(v => v.id === voiceId) || null;
}

/**
 * 根据标签筛选音色
 * @param {Array<string>} tags - 标签数组
 * @returns {Array} - 匹配的音色列表
 */
export function filterVoicesByTags(tags) {
  if (!cachedVoices || !tags || tags.length === 0) {
    return cachedVoices || [];
  }
  
  const lowerTags = tags.map(t => t.toLowerCase());
  
  return cachedVoices.filter(voice => 
    voice.tags.some(tag => lowerTags.includes(tag.toLowerCase()))
  );
}

/**
 * 只获取官方音色
 */
export function getOfficialVoices() {
  if (!cachedVoices) return [];
  return cachedVoices.filter(v => v.isOfficial);
}

/**
 * 只获取社区音色
 */
export function getCommunityVoices() {
  if (!cachedVoices) return [];
  return cachedVoices.filter(v => !v.isOfficial);
}

/**
 * 获取音色库加载状态
 */
export function getVoiceLibraryStatus() {
  return {
    loaded: !!cachedVoices,
    count: cachedVoices?.length || 0,
    officialCount: cachedVoices?.filter(v => v.isOfficial).length || 0,
    communityCount: cachedVoices?.filter(v => !v.isOfficial).length || 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    isStale: cacheTimestamp ? (Date.now() - cacheTimestamp > CACHE_DURATION) : true,
    config: VOICE_CONFIG, // 当前配置
  };
}

/**
 * 更新音色库配置（运营用）
 * @param {Object} newConfig - 新配置（只需提供要更新的字段）
 * @returns {Promise<void>}
 * 
 * 示例：
 *   updateVoiceConfig({ collectionId: 'O61D3sjuAajNAZz5xVCo' })
 *   updateVoiceConfig({ includeCommunityVoices: true })
 */
export async function updateVoiceConfig(newConfig) {
  console.log('🔧 更新音色库配置...', newConfig);
  Object.assign(VOICE_CONFIG, newConfig);
  // 强制刷新缓存
  const result = await prefetchVoices();
  console.log('✅ 配置已更新并重新加载音色库');
  return result;
}

// 导出服务对象
export const voiceService = {
  prefetchVoices,
  getCachedVoices,
  getVoiceById,
  filterVoicesByTags,
  getOfficialVoices,
  getCommunityVoices,
  getVoiceLibraryStatus,
  updateVoiceConfig, // 🆕 运营可用此动态更新配置
};
