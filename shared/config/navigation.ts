// 导航配置 - §12.5 配置化导航

export interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

// 结衣导航
export const JIEYI_NAV: NavItem[] = [
  { path: '/know', label: '知', icon: '📖' },
  { path: '/act', label: '行', icon: '🎯' },
  { path: '/reflect', label: '思', icon: '💭' },
];

// 小雪导航
export const XIAOXUE_NAV: NavItem[] = [
  { path: '/trades', label: '交易记录', icon: '📊' },
  { path: '/team-3d', label: '队伍三维', icon: '🏆' },
  { path: '/tk', label: 'TK搜索', icon: '🔍' },
  { path: '/analyst', label: '分析师报告', icon: '📈' },
];
