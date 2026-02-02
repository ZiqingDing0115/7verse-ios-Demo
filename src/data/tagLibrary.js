// ============================================================================
// Tag Library - 三层标签体系 (共 100 个标签)
// ============================================================================
// Tier 1: Basic Tags (34) - 从图片直接解析的视觉特征
// Tier 2: Persona Tags (33) - 人设/性格特征（通过对话展现）
// Tier 3: Relationship Tags (33) - 社交关系动态
// ============================================================================

// ============================================================================
// Tier 1: Basic Tags - 视觉分析层 (30)
// AI 可以从图片直接推断
// ============================================================================

export const basicTags = [
  // === Appearance Vibe (10) ===
  { id: 'b1', label: 'Stunning', emoji: '✨', category: 'basic', subcategory: 'appearance' },
  { id: 'b2', label: 'Cute', emoji: '🐰', category: 'basic', subcategory: 'appearance' },
  { id: 'b3', label: 'Hot', emoji: '🔥', category: 'basic', subcategory: 'appearance' },
  { id: 'b4', label: 'Soft', emoji: '🧸', category: 'basic', subcategory: 'appearance' },
  { id: 'b5', label: 'Sharp', emoji: '🗡️', category: 'basic', subcategory: 'appearance' },
  { id: 'b6', label: 'Rugged', emoji: '🪨', category: 'basic', subcategory: 'appearance' },
  { id: 'b7', label: 'Elegant', emoji: '👑', category: 'basic', subcategory: 'appearance' },
  { id: 'b8', label: 'Edgy', emoji: '⚡', category: 'basic', subcategory: 'appearance' },
  { id: 'b9', label: 'Innocent', emoji: '🌸', category: 'basic', subcategory: 'appearance' },
  { id: 'b10', label: 'Dangerous', emoji: '☠️', category: 'basic', subcategory: 'appearance' },

  // === Style/Aesthetic (10) ===
  { id: 'b11', label: 'Dark-Academia', emoji: '📚', category: 'basic', subcategory: 'style' },
  { id: 'b12', label: 'Cottagecore', emoji: '🌻', category: 'basic', subcategory: 'style' },
  { id: 'b13', label: 'Cyberpunk', emoji: '🤖', category: 'basic', subcategory: 'style' },
  { id: 'b14', label: 'Y2K', emoji: '💿', category: 'basic', subcategory: 'style' },
  { id: 'b15', label: 'Grunge', emoji: '🎸', category: 'basic', subcategory: 'style' },
  { id: 'b16', label: 'Ethereal', emoji: '🌙', category: 'basic', subcategory: 'style' },
  { id: 'b17', label: 'Street', emoji: '🛹', category: 'basic', subcategory: 'style' },
  { id: 'b18', label: 'Vintage', emoji: '📷', category: 'basic', subcategory: 'style' },
  { id: 'b19', label: 'Minimalist', emoji: '◽', category: 'basic', subcategory: 'style' },
  { id: 'b20', label: 'Maximalist', emoji: '🎪', category: 'basic', subcategory: 'style' },

  // === Mood/Energy (10) ===
  { id: 'b21', label: 'Golden-Hour', emoji: '🌅', category: 'basic', subcategory: 'mood' },
  { id: 'b22', label: 'Moody', emoji: '🌧️', category: 'basic', subcategory: 'mood' },
  { id: 'b23', label: 'Chaotic', emoji: '🌀', category: 'basic', subcategory: 'mood' },
  { id: 'b24', label: 'Serene', emoji: '🍃', category: 'basic', subcategory: 'mood' },
  { id: 'b25', label: 'Intense', emoji: '👁️', category: 'basic', subcategory: 'mood' },
  { id: 'b26', label: 'Dreamy', emoji: '☁️', category: 'basic', subcategory: 'mood' },
  { id: 'b27', label: 'Electric', emoji: '⚡', category: 'basic', subcategory: 'mood' },
  { id: 'b28', label: 'Melancholic', emoji: '🥀', category: 'basic', subcategory: 'mood' },
  { id: 'b29', label: 'Playful', emoji: '🎈', category: 'basic', subcategory: 'mood' },
  { id: 'b30', label: 'Mysterious', emoji: '🔮', category: 'basic', subcategory: 'mood' },

  // === NEW: Extra Styles (4) ===
  { id: 'b31', label: 'Kawaii', emoji: '🎀', category: 'basic', subcategory: 'style' },
  { id: 'b32', label: 'Gothic', emoji: '🦇', category: 'basic', subcategory: 'style' },
  { id: 'b33', label: 'Vaporwave', emoji: '🌴', category: 'basic', subcategory: 'style' },
  { id: 'b34', label: 'Fairy-Tale', emoji: '🏰', category: 'basic', subcategory: 'style' },
];

// ============================================================================
// Tier 2: Persona Tags - 人设层 (30)
// 通过对话展现的性格特征，用户选择来定义角色
// ============================================================================

export const personaTags = [
  // === Personality Core (15) ===
  { id: 'p1', label: 'Sunshine', emoji: '☀️', category: 'persona', subcategory: 'personality', vibe: '小太阳，治愈系' },
  { id: 'p2', label: 'Grumpy', emoji: '😤', category: 'persona', subcategory: 'personality', vibe: '傲娇/嘴硬心软' },
  { id: 'p3', label: 'Chaotic-Good', emoji: '🃏', category: 'persona', subcategory: 'personality', vibe: '混乱善良，不按套路' },
  { id: 'p4', label: 'Touch-Starved', emoji: '🫂', category: 'persona', subcategory: 'personality', vibe: '渴望被爱' },
  { id: 'p5', label: 'Morally-Grey', emoji: '⚖️', category: 'persona', subcategory: 'personality', vibe: '亦正亦邪' },
  { id: 'p6', label: 'Obsessive', emoji: '🖤', category: 'persona', subcategory: 'personality', vibe: '占有欲强/偏执' },
  { id: 'p7', label: 'Protective', emoji: '🛡️', category: 'persona', subcategory: 'personality', vibe: '保护欲爆棚' },
  { id: 'p8', label: 'Flirty', emoji: '😏', category: 'persona', subcategory: 'personality', vibe: '撩人精' },
  { id: 'p9', label: 'Stoic', emoji: '🗿', category: 'persona', subcategory: 'personality', vibe: '面瘫/高冷' },
  { id: 'p10', label: 'Unhinged', emoji: '🔥', category: 'persona', subcategory: 'personality', vibe: '疯批美人' },
  { id: 'p11', label: 'Devoted', emoji: '💎', category: 'persona', subcategory: 'personality', vibe: '专一忠诚' },
  { id: 'p12', label: 'Sarcastic', emoji: '🙄', category: 'persona', subcategory: 'personality', vibe: '毒舌' },
  { id: 'p13', label: 'Vulnerable', emoji: '💔', category: 'persona', subcategory: 'personality', vibe: '外强中干' },
  { id: 'p14', label: 'Brooding', emoji: '🌑', category: 'persona', subcategory: 'personality', vibe: '阴郁深沉' },
  { id: 'p15', label: 'Mischievous', emoji: '🎭', category: 'persona', subcategory: 'personality', vibe: '爱玩爱闹' },

  // === Identity/Archetype (15) ===
  { id: 'p16', label: 'CEO-Energy', emoji: '💼', category: 'persona', subcategory: 'archetype', vibe: '霸总气场' },
  { id: 'p17', label: 'Little-Wolf', emoji: '🐺', category: 'persona', subcategory: 'archetype', vibe: '小狼狗' },
  { id: 'p18', label: 'Golden-Retriever', emoji: '🐕', category: 'persona', subcategory: 'archetype', vibe: '大金毛，阳光忠诚' },
  { id: 'p19', label: 'Black-Cat', emoji: '🐈‍⬛', category: 'persona', subcategory: 'archetype', vibe: '高冷猫系' },
  { id: 'p20', label: 'Mafia-Boss', emoji: '🎰', category: 'persona', subcategory: 'archetype', vibe: '黑道大佬' },
  { id: 'p21', label: 'Idol', emoji: '🎤', category: 'persona', subcategory: 'archetype', vibe: '爱豆/明星' },
  { id: 'p22', label: 'Genius', emoji: '🧠', category: 'persona', subcategory: 'archetype', vibe: '天才设定' },
  { id: 'p23', label: 'Rebel', emoji: '✊', category: 'persona', subcategory: 'archetype', vibe: '叛逆者' },
  { id: 'p24', label: 'Healer', emoji: '💚', category: 'persona', subcategory: 'archetype', vibe: '治愈者' },
  { id: 'p25', label: 'Trickster', emoji: '🦊', category: 'persona', subcategory: 'archetype', vibe: '狐狸精/骗子' },
  { id: 'p26', label: 'Villain', emoji: '🦹', category: 'persona', subcategory: 'archetype', vibe: '反派美学' },
  { id: 'p27', label: 'Knight', emoji: '⚔️', category: 'persona', subcategory: 'archetype', vibe: '忠诚骑士' },
  { id: 'p28', label: 'Royal', emoji: '👸', category: 'persona', subcategory: 'archetype', vibe: '皇室贵族' },
  { id: 'p29', label: 'Outcast', emoji: '🌙', category: 'persona', subcategory: 'archetype', vibe: '边缘人/孤狼' },
  { id: 'p30', label: 'Prodigy', emoji: '⭐', category: 'persona', subcategory: 'archetype', vibe: '天选之子' },

  // === NEW: Extra Personas (3) ===
  { id: 'p31', label: 'Tsundere', emoji: '💢', category: 'persona', subcategory: 'personality', vibe: '傲娇经典款' },
  { id: 'p32', label: 'Yandere', emoji: '🔪', category: 'persona', subcategory: 'personality', vibe: '病娇/为爱痴狂' },
  { id: 'p33', label: 'Himbo', emoji: '💪😊', category: 'persona', subcategory: 'archetype', vibe: '傻白甜肌肉男' },
];

// ============================================================================
// Tier 3: Relationship Tags - 社交关系层 (30)
// 定义角色与用户的互动方式
// ============================================================================

export const relationshipTags = [
  // === Relationship Type (10) ===
  { id: 'r1', label: 'Soulmate', emoji: '💞', category: 'relationship', subcategory: 'type' },
  { id: 'r2', label: 'Rival', emoji: '⚔️', category: 'relationship', subcategory: 'type' },
  { id: 'r3', label: 'Frenemy', emoji: '😈', category: 'relationship', subcategory: 'type' },
  { id: 'r4', label: 'Ex', emoji: '💔', category: 'relationship', subcategory: 'type' },
  { id: 'r5', label: 'Secret-Crush', emoji: '🤫', category: 'relationship', subcategory: 'type' },
  { id: 'r6', label: 'Forbidden', emoji: '🚫', category: 'relationship', subcategory: 'type' },
  { id: 'r7', label: 'Childhood-Friend', emoji: '🧒', category: 'relationship', subcategory: 'type' },
  { id: 'r8', label: 'Mentor', emoji: '🎓', category: 'relationship', subcategory: 'type' },
  { id: 'r9', label: 'Situationship', emoji: '🤷', category: 'relationship', subcategory: 'type' },
  { id: 'r10', label: 'Nemesis', emoji: '🔥', category: 'relationship', subcategory: 'type' },

  // === Tropes (10) ===
  { id: 'r11', label: 'Enemies-to-Lovers', emoji: '⚔️❤️', category: 'relationship', subcategory: 'trope', vibe: '相爱相杀' },
  { id: 'r12', label: 'Fake-Dating', emoji: '💍', category: 'relationship', subcategory: 'trope', vibe: '假戏真做' },
  { id: 'r13', label: 'Slow-Burn', emoji: '🕯️', category: 'relationship', subcategory: 'trope', vibe: '细水长流' },
  { id: 'r14', label: 'Love-Triangle', emoji: '🔺', category: 'relationship', subcategory: 'trope', vibe: '三角恋' },
  { id: 'r15', label: 'Second-Chance', emoji: '🔄', category: 'relationship', subcategory: 'trope', vibe: '破镜重圆' },
  { id: 'r16', label: 'Forced-Proximity', emoji: '🏠', category: 'relationship', subcategory: 'trope', vibe: '强制同居' },
  { id: 'r17', label: 'Grumpy-Sunshine', emoji: '🌤️', category: 'relationship', subcategory: 'trope', vibe: '冰火组合' },
  { id: 'r18', label: 'One-Bed', emoji: '🛏️', category: 'relationship', subcategory: 'trope', vibe: '只有一张床' },
  { id: 'r19', label: 'He-Falls-First', emoji: '📉', category: 'relationship', subcategory: 'trope', vibe: '先动心的是他' },
  { id: 'r20', label: 'Obsessive-Love', emoji: '🖤', category: 'relationship', subcategory: 'trope', vibe: '病娇式爱情' },

  // === Vibe/Energy (10) - 关系中的能量/氛围 ===
  { id: 'r21', label: 'Simp-for-You', emoji: '🥺', category: 'relationship', subcategory: 'vibe', vibe: 'TA 对你无条件宠溺' },
  { id: 'r22', label: 'Hard-to-Get', emoji: '🙄', category: 'relationship', subcategory: 'vibe', vibe: '欲擒故纵' },
  { id: 'r23', label: 'Whipped', emoji: '🐶', category: 'relationship', subcategory: 'vibe', vibe: '完全被拿捏' },
  { id: 'r24', label: 'Toxic', emoji: '☠️', category: 'relationship', subcategory: 'vibe', vibe: '有毒但上头' },
  { id: 'r25', label: 'Wholesome', emoji: '🌈', category: 'relationship', subcategory: 'vibe', vibe: '纯爱/治愈' },
  { id: 'r26', label: 'Chaotic', emoji: '🔥', category: 'relationship', subcategory: 'vibe', vibe: '疯狂混乱' },
  { id: 'r27', label: 'Telepathic', emoji: '🧠', category: 'relationship', subcategory: 'vibe', vibe: '心有灵犀' },
  { id: 'r28', label: 'Codependent', emoji: '🔗', category: 'relationship', subcategory: 'vibe', vibe: '相互依赖' },
  { id: 'r29', label: 'Push-Pull', emoji: '🎢', category: 'relationship', subcategory: 'vibe', vibe: '拉扯/若即若离' },
  { id: 'r30', label: 'Ride-or-Die', emoji: '💀', category: 'relationship', subcategory: 'vibe', vibe: '生死相依' },

  // === NEW: Extra Tropes (3) ===
  { id: 'r31', label: 'Friends-to-Lovers', emoji: '👫❤️', category: 'relationship', subcategory: 'trope', vibe: '友情升华' },
  { id: 'r32', label: 'Stalker-Vibes', emoji: '👁️‍🗨️', category: 'relationship', subcategory: 'vibe', vibe: 'TA 一直在看着你' },
  { id: 'r33', label: 'Found-Family', emoji: '🏠❤️', category: 'relationship', subcategory: 'type', vibe: '非血缘的家人' },
];

// ============================================================================
// Helper Functions
// ============================================================================

// 获取所有标签（用于 AI 推荐匹配）
export const getAllTags = () => [...basicTags, ...personaTags, ...relationshipTags];

// 获取所有标签的 label 列表（用于 prompt）
export const getAllTagLabels = () => getAllTags().map(t => t.label);

// 根据 ID 查找标签
export const getTagById = (id) => getAllTags().find(t => t.id === id);

// 根据 label 查找标签（不区分大小写）
export const getTagByLabel = (label) => 
  getAllTags().find(t => t.label.toLowerCase() === label.toLowerCase());

// 获取分类后的标签（用于 UI 展示）
export const getTagsByCategory = () => ({
  basic: {
    title: 'Visual Vibe',
    subtitle: 'AI 从图片分析',
    tags: basicTags,
    subcategories: {
      appearance: { title: 'Appearance', tags: basicTags.filter(t => t.subcategory === 'appearance') },
      style: { title: 'Style', tags: basicTags.filter(t => t.subcategory === 'style') },
      mood: { title: 'Mood', tags: basicTags.filter(t => t.subcategory === 'mood') },
    }
  },
  persona: {
    title: 'Persona',
    subtitle: '定义 TA 的性格',
    tags: personaTags,
    subcategories: {
      personality: { title: 'Personality', tags: personaTags.filter(t => t.subcategory === 'personality') },
      archetype: { title: 'Archetype', tags: personaTags.filter(t => t.subcategory === 'archetype') },
    }
  },
  relationship:   {
    title: 'Relationship',
    subtitle: '你在关系中的角色',
    tags: relationshipTags,
    subcategories: {
      type: { title: 'Type', tags: relationshipTags.filter(t => t.subcategory === 'type') },
      trope: { title: 'Tropes', tags: relationshipTags.filter(t => t.subcategory === 'trope') },
      vibe: { title: 'Vibe', tags: relationshipTags.filter(t => t.subcategory === 'vibe') },
    }
  },
});

export default {
  basicTags,
  personaTags,
  relationshipTags,
  getAllTags,
  getAllTagLabels,
  getTagById,
  getTagByLabel,
  getTagsByCategory,
};
