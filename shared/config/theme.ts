// 配色 D：暖夜 · 深棕+奶油
// 温暖舒适，像深夜书房

export const THEME_D = {
  // 基础色
  bg: '#1a1510',
  bgCard: '#1f1a14',
  bgInput: '#252018',
  
  // 文字
  text: '#e8ddd0',
  textMuted: '#8a7a6a',
  
  // 强调色
  accent: '#e8c890',      // 奶油金
  accentGradient: 'linear-gradient(135deg, #c48a5a, #e8c890)',
  
  // 功能色
  success: '#7ab87a',
  warning: '#e8a849',
  danger: '#c45a5a',
  
  // 边框
  border: '#2a2218',
  borderFocus: '#c48a5a',
  
  // 象限色
  q1: '#c45a5a',  // 紧急重要
  q2: '#e8a849',  // 重要不紧急
  q3: '#5a8ac4',  // 紧急不重要
  q4: '#6a6a6a',  // 不紧急不重要
} as const;

export type Theme = typeof THEME_D;
