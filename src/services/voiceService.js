// Voice Service - ElevenLabs 音色库管理
// 负责获取、缓存和转换 ElevenLabs 音色数据
// 支持官方预设音色 + 社区共享音色

import { callElevenLabsOfficialAPI, callElevenLabsSharedAPI } from '../config/api';
import { VOICE_LIBRARY } from '../data/voiceLibrary';

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
 * 预获取并缓存 ElevenLabs 音色库（官方 + 社区）
 * @returns {Promise<Object>} - 包含音色列表的结果对象
 */
export async function prefetchVoices() {
  console.log(LOG_DIVIDER);
  console.log('🎙️ 预加载 ElevenLabs 音色库（官方 + 社区）...');
  console.log(LOG_DIVIDER);
  
  try {
    // 并行获取官方和社区音色
    const [officialResult, sharedResult] = await Promise.all([
      callElevenLabsOfficialAPI(),
      callElevenLabsSharedAPI(),
    ]);
    
    const officialVoices = [];
    const sharedVoices = [];
    
    // 处理官方音色
    if (officialResult.success && officialResult.voices.length > 0) {
      officialResult.voices.forEach(v => {
        // 只保留 premade 类型的官方音色
        if (v.category === 'premade') {
          officialVoices.push(transformOfficialVoice(v));
        }
      });
      console.log(`✅ 官方音色: ${officialVoices.length} 个`);
    } else {
      console.warn('⚠️ 获取官方音色失败或为空');
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
    
    // 合并：官方音色在前，社区音色在后
    cachedVoices = [...officialVoices, ...sharedVoices];
    cacheTimestamp = Date.now();
    
    if (cachedVoices.length === 0) {
      console.warn('⚠️ 没有获取到任何音色，使用本地备用');
      return useFallbackVoices();
    }
    
    console.log(`✅ 音色库加载成功！`);
    console.log(`   📊 总共 ${cachedVoices.length} 个音色（官方 ${officialVoices.length} + 社区 ${sharedVoices.length}）`);
    
    // 显示部分音色预览
    console.log('   🎤 官方音色预览:');
    officialVoices.slice(0, 3).forEach((voice, i) => {
      console.log(`      ${i + 1}. 🏆 ${voice.name} (${voice.gender}) - ${voice.accent}`);
    });
    
    console.log('   🎤 社区音色预览:');
    sharedVoices.slice(0, 3).forEach((voice, i) => {
      console.log(`      ${i + 1}. 👥 ${voice.name} (${voice.gender}) - ${voice.accent}`);
    });
    
    console.log(LOG_DIVIDER);
    
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
  };
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
};
