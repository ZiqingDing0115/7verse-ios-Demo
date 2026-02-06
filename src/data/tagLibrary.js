// ============================================================================
// Tag Library - L1 / L2 分层标签体系
// ============================================================================
// L1 = Persona（角色人设）
// L2 = Relationship（关系定位）
// 子类目精简，不再包含：星座(zodiac)、Gender。
// 标签小工具 (tag-collector) 增删的标签写入 tagLibrary-custom.json，此处合并进 personaTags
// ============================================================================

import customPersonaFromTool from './tagLibrary-custom.json';

// ============================================================================
// L1: Persona - 角色人设（多选）
// ============================================================================
// 子类目：identity / style / roleplay / content / vibe（共 5 个，不再细分）
// ============================================================================

const personaTagsBase = [
  // ---------- Identity 社会身份 ----------
  { id: 'p1', label: 'CEO', labelCN: 'CEO / 霸总', emoji: '💼', category: 'persona', dimension: 'identity' },
  { id: 'p2', label: 'Doctor', labelCN: '医生', emoji: '🩺', category: 'persona', dimension: 'identity' },
  { id: 'p3', label: 'Artist', labelCN: '艺术家', emoji: '🎨', category: 'persona', dimension: 'identity' },
  { id: 'p4', label: 'Student', labelCN: '学生', emoji: '📚', category: 'persona', dimension: 'identity' },
  { id: 'p5', label: 'Idol', labelCN: '偶像', emoji: '🎤', category: 'persona', dimension: 'identity' },
  { id: 'p6', label: 'Mafia-Boss', labelCN: '黑帮老大', emoji: '🎰', category: 'persona', dimension: 'identity' },
  { id: 'p7', label: 'Professor', labelCN: '教授', emoji: '🎓', category: 'persona', dimension: 'identity' },
  { id: 'p8', label: 'Athlete', labelCN: '运动员', emoji: '🏆', category: 'persona', dimension: 'identity' },
  { id: 'p9', label: 'Chef', labelCN: '厨师', emoji: '👨‍🍳', category: 'persona', dimension: 'identity' },
  { id: 'p10', label: 'Musician', labelCN: '音乐人', emoji: '🎸', category: 'persona', dimension: 'identity' },
  { id: 'p11', label: 'Writer', labelCN: '作家', emoji: '✍️', category: 'persona', dimension: 'identity' },
  { id: 'p12', label: 'Model', labelCN: '模特', emoji: '📸', category: 'persona', dimension: 'identity' },
  { id: 'p13', label: 'Hacker', labelCN: '黑客', emoji: '💻', category: 'persona', dimension: 'identity' },
  { id: 'p14', label: 'Royalty', labelCN: '王室 / 皇族', emoji: '👑', category: 'persona', dimension: 'identity' },
  { id: 'p15', label: 'Soldier', labelCN: '军人', emoji: '🎖️', category: 'persona', dimension: 'identity' },
  { id: 'p16', label: 'Detective', labelCN: '侦探', emoji: '🔍', category: 'persona', dimension: 'identity' },
  { id: 'p17', label: 'Barista', labelCN: '咖啡师', emoji: '☕', category: 'persona', dimension: 'identity' },
  { id: 'p18', label: 'Pilot', labelCN: '飞行员', emoji: '✈️', category: 'persona', dimension: 'identity' },
  { id: 'p19', label: 'Dancer', labelCN: '舞者', emoji: '💃', category: 'persona', dimension: 'identity' },
  { id: 'p20', label: 'Streamer', labelCN: '主播', emoji: '🎮', category: 'persona', dimension: 'identity' },

  // ---------- Style 风格 ----------
  { id: 'p21', label: 'Dark-Academia', labelCN: '暗黑学院风', emoji: '📖', category: 'persona', dimension: 'style' },
  { id: 'p22', label: 'Streetwear', labelCN: '街头潮流', emoji: '🛹', category: 'persona', dimension: 'style' },
  { id: 'p23', label: 'Cottagecore', labelCN: '田园风', emoji: '🌻', category: 'persona', dimension: 'style' },
  { id: 'p24', label: 'Cyberpunk', labelCN: '赛博朋克', emoji: '🤖', category: 'persona', dimension: 'style' },
  { id: 'p25', label: 'Y2K', labelCN: 'Y2K / 千禧风', emoji: '💿', category: 'persona', dimension: 'style' },
  { id: 'p26', label: 'Gothic', labelCN: '哥特风', emoji: '🦇', category: 'persona', dimension: 'style' },
  { id: 'p27', label: 'Old-Money', labelCN: '老钱风', emoji: '💎', category: 'persona', dimension: 'style' },
  { id: 'p28', label: 'Kawaii', labelCN: '可爱风', emoji: '🎀', category: 'persona', dimension: 'style' },
  { id: 'p29', label: 'Foxy', labelCN: '狐狸系 / 妖媚', emoji: '🦊', category: 'persona', dimension: 'style' },
  { id: 'p30', label: 'Bad-Boy', labelCN: '坏男孩', emoji: '😎', category: 'persona', dimension: 'style' },
  { id: 'p31', label: 'Soft-Boy', labelCN: '奶狗系', emoji: '🐶', category: 'persona', dimension: 'style' },
  { id: 'p32', label: 'Cold-Beauty', labelCN: '高冷美人', emoji: '❄️', category: 'persona', dimension: 'style' },
  { id: 'p33', label: 'Girl-Next-Door', labelCN: '邻家女孩', emoji: '🏠', category: 'persona', dimension: 'style' },
  { id: 'p34', label: 'Mysterious', labelCN: '神秘感', emoji: '🌙', category: 'persona', dimension: 'style' },
  { id: 'p35', label: 'Sunshine', labelCN: '阳光系', emoji: '☀️', category: 'persona', dimension: 'style' },
  { id: 'p36', label: 'E-Girl', labelCN: 'E-Girl / 网感少女', emoji: '🖤', category: 'persona', dimension: 'style' },
  { id: 'p37', label: 'E-Boy', labelCN: 'E-Boy / 网感少年', emoji: '⛓️', category: 'persona', dimension: 'style' },
  { id: 'p38', label: 'Coquette', labelCN: '蝴蝶结公主', emoji: '🎀', category: 'persona', dimension: 'style' },
  { id: 'p39', label: 'Clean-Girl', labelCN: '干净清爽', emoji: '✨', category: 'persona', dimension: 'style' },
  { id: 'p40', label: 'Fairycore', labelCN: '仙女风', emoji: '🧚', category: 'persona', dimension: 'style' },
  { id: 'p41', label: 'Grunge', labelCN: '颓废摇滚', emoji: '🎸', category: 'persona', dimension: 'style' },
  { id: 'p42', label: 'Rockstar', labelCN: '摇滚明星', emoji: '🤘', category: 'persona', dimension: 'style' },
  { id: 'p43', label: 'Anime', labelCN: '动漫风', emoji: '🎌', category: 'persona', dimension: 'style' },
  { id: 'p44', label: 'Fantasy', labelCN: '奇幻风', emoji: '🏰', category: 'persona', dimension: 'style' },
  { id: 'p45', label: 'Sporty', labelCN: '运动风', emoji: '⚽', category: 'persona', dimension: 'style' },

  // ---------- Roleplay 人设/设定 ----------
  { id: 'p46', label: 'Vampire', labelCN: '吸血鬼', emoji: '🧛', category: 'persona', dimension: 'roleplay' },
  { id: 'p47', label: 'Werewolf', labelCN: '狼人', emoji: '🐺', category: 'persona', dimension: 'roleplay' },
  { id: 'p48', label: 'Demon', labelCN: '恶魔', emoji: '😈', category: 'persona', dimension: 'roleplay' },
  { id: 'p49', label: 'Angel', labelCN: '天使', emoji: '👼', category: 'persona', dimension: 'roleplay' },
  { id: 'p50', label: 'Yandere', labelCN: '病娇', emoji: '🔪', category: 'persona', dimension: 'roleplay' },
  { id: 'p51', label: 'Tsundere', labelCN: '傲娇', emoji: '💢', category: 'persona', dimension: 'roleplay' },
  { id: 'p52', label: 'Kuudere', labelCN: '酷娇 / 面瘫', emoji: '🧊', category: 'persona', dimension: 'roleplay' },
  { id: 'p53', label: 'Dandere', labelCN: '呆萌', emoji: '😶', category: 'persona', dimension: 'roleplay' },
  { id: 'p54', label: 'Villain', labelCN: '反派', emoji: '🦹', category: 'persona', dimension: 'roleplay' },
  { id: 'p55', label: 'Anti-Hero', labelCN: '反英雄', emoji: '🎭', category: 'persona', dimension: 'roleplay' },
  { id: 'p56', label: 'Prince', labelCN: '王子', emoji: '🤴', category: 'persona', dimension: 'roleplay' },
  { id: 'p57', label: 'Knight', labelCN: '骑士', emoji: '⚔️', category: 'persona', dimension: 'roleplay' },
  { id: 'p58', label: 'Assassin', labelCN: '刺客', emoji: '🗡️', category: 'persona', dimension: 'roleplay' },
  { id: 'p59', label: 'Mage', labelCN: '法师', emoji: '🧙', category: 'persona', dimension: 'roleplay' },
  { id: 'p60', label: 'Elf', labelCN: '精灵', emoji: '🧝', category: 'persona', dimension: 'roleplay' },
  { id: 'p61', label: 'Ghost', labelCN: '幽灵', emoji: '👻', category: 'persona', dimension: 'roleplay' },
  { id: 'p62', label: 'Android', labelCN: '仿生人', emoji: '🤖', category: 'persona', dimension: 'roleplay' },
  { id: 'p63', label: 'Pirate', labelCN: '海盗', emoji: '🏴‍☠️', category: 'persona', dimension: 'roleplay' },
  { id: 'p64', label: 'Witch', labelCN: '女巫', emoji: '🧙‍♀️', category: 'persona', dimension: 'roleplay' },
  { id: 'p65', label: 'Fallen-Angel', labelCN: '堕天使', emoji: '🖤', category: 'persona', dimension: 'roleplay' },

  // ---------- Content 内容类型 ----------
  { id: 'p66', label: 'Career-Coach', labelCN: '职场教练', emoji: '🧭', category: 'persona', dimension: 'content' },
  { id: 'p67', label: 'Language-Tutor', labelCN: '语言陪练', emoji: '🗣️', category: 'persona', dimension: 'content' },
  { id: 'p68', label: 'Wellness-Coach', labelCN: '身心疗愈', emoji: '🧘', category: 'persona', dimension: 'content' },
  { id: 'p69', label: 'Fashion-Stylist', labelCN: '穿搭顾问', emoji: '👗', category: 'persona', dimension: 'content' },
  { id: 'p70', label: 'Study-Buddy', labelCN: '学习搭子', emoji: '📝', category: 'persona', dimension: 'content' },
  { id: 'p71', label: 'Gym-Buddy', labelCN: '健身搭子', emoji: '🏋️', category: 'persona', dimension: 'content' },
  { id: 'p72', label: 'Travel-Buddy', labelCN: '旅行搭子', emoji: '🧳', category: 'persona', dimension: 'content' },
  { id: 'p73', label: 'Daily-Companion', labelCN: '日常陪伴', emoji: '☀️', category: 'persona', dimension: 'content' },
  { id: 'p74', label: 'Situationship', labelCN: '暧昧对象', emoji: '💭', category: 'persona', dimension: 'content' },
  { id: 'p75', label: 'Healing-Vibes', labelCN: '治愈系', emoji: '🌧️', category: 'persona', dimension: 'content' },
  { id: 'p76', label: 'Late-Night-Talk', labelCN: '深夜聊天', emoji: '🌙', category: 'persona', dimension: 'content' },
  { id: 'p77', label: 'Anime-IP', labelCN: '动漫IP', emoji: '🎌', category: 'persona', dimension: 'content' },
  { id: 'p78', label: 'Gaming-IP', labelCN: '游戏世界', emoji: '🕹️', category: 'persona', dimension: 'content' },
  { id: 'p79', label: 'Movie-TV', labelCN: '影视剧集', emoji: '🍿', category: 'persona', dimension: 'content' },
  { id: 'p80', label: 'ASMR', labelCN: 'ASMR / 助眠', emoji: '🎧', category: 'persona', dimension: 'content' },

  // ---------- Vibe 互动氛围 ----------
  { id: 'p81', label: 'Dom', labelCN: '主导型 / S', emoji: '👑', category: 'persona', dimension: 'vibe' },
  { id: 'p82', label: 'Sub', labelCN: '服从型 / M', emoji: '🔗', category: 'persona', dimension: 'vibe' },
  { id: 'p83', label: 'Switch', labelCN: '可攻可受', emoji: '🔄', category: 'persona', dimension: 'vibe' },
  { id: 'p84', label: 'Brat', labelCN: '小恶魔 / 欠管教', emoji: '😼', category: 'persona', dimension: 'vibe' },
  { id: 'p85', label: 'Gentle-Dom', labelCN: '温柔控制', emoji: '🌹', category: 'persona', dimension: 'vibe' },
  { id: 'p86', label: 'Possessive', labelCN: '占有欲强', emoji: '🔒', category: 'persona', dimension: 'vibe' },
  { id: 'p87', label: 'Flirty', labelCN: '撩人精', emoji: '😏', category: 'persona', dimension: 'vibe' },
  { id: 'p88', label: 'Jealous', labelCN: '醋王', emoji: '💚', category: 'persona', dimension: 'vibe' },
  { id: 'p89', label: 'Clingy', labelCN: '黏人精', emoji: '🐨', category: 'persona', dimension: 'vibe' },
  { id: 'p90', label: 'Aloof', labelCN: '高冷疏离', emoji: '🧊', category: 'persona', dimension: 'vibe' },
  { id: 'p91', label: 'Teasing', labelCN: '爱捉弄人', emoji: '😜', category: 'persona', dimension: 'vibe' },
  { id: 'p92', label: 'Protective', labelCN: '保护欲强', emoji: '🛡️', category: 'persona', dimension: 'vibe' },
];

// 工具同步的自定义标签（tagLibrary-custom.json）合并进 L1 Persona
const customPersonaTags = (Array.isArray(customPersonaFromTool) ? customPersonaFromTool : []).map((t, i) => ({
  id: t.id || `c${i + 1}`,
  label: t.label || '',
  labelCN: t.label || '',
  emoji: t.emoji || '🏷️',
  category: 'persona',
  dimension: t.dimension || 'custom',
}));

export const personaTags = [...personaTagsBase, ...customPersonaTags];

// ============================================================================
// L2: Relationship - 关系定位（单选）
// ============================================================================

export const relationshipTags = [
  { id: 'r1', label: 'Soulmate', labelCN: '灵魂伴侣', emoji: '💞', category: 'relationship', description: 'Your perfect match, deeply connected' },
  { id: 'r2', label: 'Protector', labelCN: '守护者', emoji: '🛡️', category: 'relationship', description: 'Always watching over you' },
  { id: 'r3', label: 'Rival', labelCN: '对手', emoji: '⚔️', category: 'relationship', description: 'Competitive tension, pushing each other' },
  { id: 'r4', label: 'Secret-Admirer', labelCN: '暗恋者', emoji: '🤫', category: 'relationship', description: 'Hidden feelings, stolen glances' },
  { id: 'r5', label: 'Childhood-Friend', labelCN: '青梅竹马', emoji: '🧒', category: 'relationship', description: 'Known each other forever' },
  { id: 'r6', label: 'Ex', labelCN: '前任', emoji: '💔', category: 'relationship', description: 'History between you two' },
  { id: 'r7', label: 'Fake-Dating', labelCN: '假装恋爱', emoji: '💍', category: 'relationship', description: 'Pretending... or is it real?' },
  { id: 'r8', label: 'Enemies-to-Lovers', labelCN: '欢喜冤家', emoji: '🔥', category: 'relationship', description: 'From hate to love' },
  { id: 'r9', label: 'Roommate', labelCN: '室友', emoji: '🏠', category: 'relationship', description: 'Sharing space, building connection' },
  { id: 'r10', label: 'Stranger', labelCN: '陌生人', emoji: '👀', category: 'relationship', description: 'Just met, instant chemistry' },
  { id: 'r11', label: 'Forbidden', labelCN: '禁忌之恋', emoji: '🚫', category: 'relationship', description: 'Should not, but cannot resist' },
  { id: 'r12', label: 'Daddy', labelCN: 'Daddy / 霸道总裁', emoji: '🔥', category: 'relationship', description: 'Dominant, protective, takes charge' },
  { id: 'r13', label: 'Mommy', labelCN: 'Mommy / 姐姐', emoji: '💋', category: 'relationship', description: 'Nurturing, caring, in control' },
  { id: 'r14', label: 'Sugar-Daddy', labelCN: '金主爸爸', emoji: '💰', category: 'relationship', description: 'Spoils you with everything' },
  { id: 'r15', label: 'Sugar-Baby', labelCN: '被宠的那个', emoji: '🍬', category: 'relationship', description: 'Pampered and adored' },
  { id: 'r16', label: 'Step-Sibling', labelCN: '继兄妹', emoji: '👫', category: 'relationship', description: 'Complicated family dynamics' },
  { id: 'r17', label: 'Toxic-Ex', labelCN: '有毒前任', emoji: '☠️', category: 'relationship', description: 'Bad for you, but addictive' },
  { id: 'r18', label: 'Obsessed', labelCN: '疯狂迷恋', emoji: '💀', category: 'relationship', description: 'Cannot let you go' },
  { id: 'r19', label: 'Pet', labelCN: '小宠物', emoji: '🐾', category: 'relationship', description: 'Adorable and devoted' },
  { id: 'r20', label: 'Master', labelCN: '主人', emoji: '👑', category: 'relationship', description: 'In complete control' },
];

// ============================================================================
// For You / Targeting（单选）- 这个角色是为谁设计的
// ============================================================================

export const targetingTags = [
  { id: 't1', label: 'For-Her', labelCN: '他是你的男神', emoji: '💙', category: 'targeting', targetCode: 'M4F', description: '男性角色，专为女生设计' },
  { id: 't2', label: 'For-Him', labelCN: '她是你的女神', emoji: '💖', category: 'targeting', targetCode: 'F4M', description: '女性角色，专为男生设计' },
  { id: 't3', label: 'BL', labelCN: '耽美 / 男男', emoji: '💜', category: 'targeting', targetCode: 'M4M', description: '男性角色，面向喜欢 BL 的用户' },
  { id: 't4', label: 'GL', labelCN: '百合 / 女女', emoji: '🧡', category: 'targeting', targetCode: 'F4F', description: '女性角色，面向喜欢 GL 的用户' },
  { id: 't5', label: 'Everyone', labelCN: '不限 / TA', emoji: '🌈', category: 'targeting', targetCode: 'AnyPOV', description: '性别自适应，谁都可以' },
];

// ============================================================================
// Helpers
// ============================================================================

export const getAllTags = () => [...personaTags, ...relationshipTags, ...targetingTags];

export const getAllTagLabels = () => getAllTags().map(t => t.label);

export const getTagById = (id) => getAllTags().find(t => t.id === id);

export const getTagByLabel = (label) => {
  if (!label) return null;
  const cleanLabel = label
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase();
  return getAllTags().find(t => {
    const cleanTagLabel = t.label.toLowerCase().replace(/-/g, '');
    const cleanInputLabel = cleanLabel.replace(/-/g, '').replace(/\s+/g, '');
    return t.label.toLowerCase() === cleanLabel ||
      cleanTagLabel === cleanInputLabel ||
      t.label.toLowerCase().includes(cleanLabel) ||
      cleanLabel.includes(t.label.toLowerCase());
  });
};

// 按 L1/L2 与 Persona 子类目分组
export const getTagsByCategory = () => {
  const dimensions = personaTags.reduce((acc, t) => {
    const key = t.dimension || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return {
    // L1
    persona: {
      title: 'Persona',
      titleCN: '角色人设',
      subtitle: 'L1 · Define their personality',
      selectionMode: 'multi',
      tags: personaTags,
      dimensions,
    },
    // L2
    relationship: {
      title: 'Relationship',
      titleCN: '关系定位',
      subtitle: 'L2 · Your connection with character',
      selectionMode: 'single',
      shuffleEnabled: true,
      displayCount: 5,
      tags: relationshipTags,
    },
    targeting: {
      title: 'For You',
      titleCN: 'TA 是谁的？',
      subtitle: 'This character is made for...',
      selectionMode: 'single',
      tags: targetingTags,
    },
  };
};

export const getPersonaTags = () => personaTags;
export const getRelationshipTags = () => relationshipTags;
export const getTargetingTags = () => targetingTags;

export default {
  personaTags,
  relationshipTags,
  targetingTags,
  getAllTags,
  getAllTagLabels,
  getTagById,
  getTagByLabel,
  getTagsByCategory,
  getPersonaTags,
  getRelationshipTags,
  getTargetingTags,
};
