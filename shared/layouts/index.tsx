// 插槽化布局组件 - §12.4

import React from 'react';
import { NavItem } from '../config/navigation';

// ===== PageShell =====
interface PageShellProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({
  sidebar,
  header,
  children,
  footer,
}) => {
  return (
    <div className="page-shell">
      {sidebar && <aside className="page-shell-sidebar">{sidebar}</aside>}
      <main className="page-shell-main">
        {header && <header className="page-shell-header">{header}</header>}
        <div className="page-shell-content">{children}</div>
        {footer && <footer className="page-shell-footer">{footer}</footer>}
      </main>
    </div>
  );
};

// ===== SideNav =====
interface SideNavProps {
  items: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  extra?: React.ReactNode;
}

export const SideNav: React.FC<SideNavProps> = ({
  items,
  currentPath,
  onNavigate,
  extra,
}) => {
  return (
    <nav className="side-nav">
      <ul className="side-nav-list">
        {items.map(item => (
          <li
            key={item.path}
            className={`side-nav-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => onNavigate(item.path)}
          >
            {item.icon && <span className="side-nav-icon">{item.icon}</span>}
            <span className="side-nav-label">{item.label}</span>
          </li>
        ))}
      </ul>
      {extra && <div className="side-nav-extra">{extra}</div>}
    </nav>
  );
};

// ===== ModuleSection =====
interface ModuleSectionProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const ModuleSection: React.FC<ModuleSectionProps> = ({
  title,
  actions,
  children,
}) => {
  return (
    <section className="module-section">
      <div className="module-section-header">
        <h3 className="module-section-title">{title}</h3>
        {actions && <div className="module-section-actions">{actions}</div>}
      </div>
      <div className="module-section-content">{children}</div>
    </section>
  );
};

// ===== ContentSlot =====
interface ContentSlotProps {
  children: React.ReactNode;
  empty?: React.ReactNode;
}

export const ContentSlot: React.FC<ContentSlotProps> = ({
  children,
  empty,
}) => {
  const hasChildren = React.Children.count(children) > 0;
  return (
    <div className="content-slot">
      {hasChildren ? children : empty}
    </div>
  );
};
