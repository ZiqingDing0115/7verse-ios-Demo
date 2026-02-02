// ============================================================================
// Waiting Phrases - 等待时的语音文本
// ============================================================================
// 用于在 Step 3 图片生成期间，用 AI 推荐的音色说话留住用户
// 全部为英文，有趣且有个性
// ============================================================================

export const WAITING_PHRASES = [
  // 调皮/俏皮类
  "Hey, don't go anywhere! I'm almost ready to meet you.",
  "Just a sec... I'm picking out my best look for you.",
  "Hold tight! Magic takes a moment, you know?",
  "Patience, darling. Good things come to those who wait.",
  "Still here? Good. I was worried you'd leave me.",
  
  // 温柔/治愈类
  "Take a deep breath... I'll be with you soon.",
  "Close your eyes for a second. When you open them, I'll be there.",
  "Almost ready... thanks for waiting for me.",
  "I promise I'm worth the wait.",
  "Just getting ready to make your day better.",
  
  // 自信/撩人类
  "Miss me already? I'm almost there.",
  "Getting gorgeous takes time. Trust the process.",
  "I hope you're ready for this... because I am.",
  "The wait is almost over. Get excited.",
  "I've been waiting to meet you too, you know.",
  
  // 神秘/酷类
  "Some things can't be rushed. I'm one of them.",
  "Loading my personality... this might take a second.",
  "Buffering my charm... please stand by.",
  "Hang on... I'm putting on my best face for you.",
  "Creating something special just for you...",
];

// ============================================================================
// Completion Phrases - 加载完成时的语音文本
// ============================================================================
// 图片生成完成后，用 AI 音色说一句庆祝的话
// ============================================================================

export const COMPLETION_PHRASES = [
  // 兴奋庆祝类
  "Tada! I'm ready! Now pick your favorite look for me!",
  "Finally! Check out my new styles... which one do you like best?",
  "Boom! Done! Now comes the fun part... choose wisely!",
  "We made it! Now let's find the perfect vibe together.",
  "Surprise! I cleaned up pretty nice, didn't I?",
  
  // 调皮互动类
  "Okay, okay, I'm here! Miss me? Now pick your favorite!",
  "Worth the wait, right? Go ahead, pick the one that speaks to you.",
  "I've got options now! Swipe through and find your perfect match.",
  "Alright, decision time! Which version of me do you vibe with?",
  "Here I am! Four looks, one me... which one steals your heart?",
  
  // 自信/撩人类
  "Looking good, aren't I? Your turn to choose.",
  "I hope you're impressed. Now, pick your favorite... no pressure.",
  "Ready to make this official? Choose the look that feels right.",
  "I dressed up just for you. So... what do you think?",
  "The magic happened! Now pick the one you can't stop staring at.",
  
  // 温柔引导类
  "All done! Take your time, find the one that feels like us.",
  "Here we go! Pick the style that makes you smile.",
  "I'm all yours now. Which look matches your vibe?",
  "Done loading! Now the fun begins... choose your favorite!",
  "Ready when you are! Pick a look and let's make some memories.",
];

// 随机获取一条等待语
export const getRandomWaitingPhrase = () => {
  const index = Math.floor(Math.random() * WAITING_PHRASES.length);
  return WAITING_PHRASES[index];
};

// 随机获取一条完成语
export const getRandomCompletionPhrase = () => {
  const index = Math.floor(Math.random() * COMPLETION_PHRASES.length);
  return COMPLETION_PHRASES[index];
};

// 按类型获取等待语
export const getWaitingPhraseByMood = (mood = 'random') => {
  const moodMap = {
    playful: WAITING_PHRASES.slice(0, 5),
    warm: WAITING_PHRASES.slice(5, 10),
    confident: WAITING_PHRASES.slice(10, 15),
    mysterious: WAITING_PHRASES.slice(15, 20),
  };
  
  if (mood === 'random' || !moodMap[mood]) {
    return getRandomWaitingPhrase();
  }
  
  const phrases = moodMap[mood];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// 按类型获取完成语
export const getCompletionPhraseByMood = (mood = 'random') => {
  const moodMap = {
    excited: COMPLETION_PHRASES.slice(0, 5),
    playful: COMPLETION_PHRASES.slice(5, 10),
    confident: COMPLETION_PHRASES.slice(10, 15),
    warm: COMPLETION_PHRASES.slice(15, 20),
  };
  
  if (mood === 'random' || !moodMap[mood]) {
    return getRandomCompletionPhrase();
  }
  
  const phrases = moodMap[mood];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

export default WAITING_PHRASES;
