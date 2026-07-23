// 导航配置 - §12.5 配置化导航

export interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

// 结衣导航
export const JIEYI_NAV: NavItem[] = [
  { path: '/reality', label: '现实' },
  { path: '/know', label: '认识' },
  { path: '/act', label: '实践' },
  { path: '/accumulate', label: '积累' },
];

// 小雪导航
export const XIAOXUE_NAV: NavItem[] = [
  { path: '/trades', label: '交易记录', icon: '📊' },
  { path: '/team-3d', label: '队伍三维', icon: '🏆' },
  { path: '/tk', label: 'TK搜索', icon: '🔍' },
  { path: '/analyst', label: '分析师报告', icon: '📈' },
];
