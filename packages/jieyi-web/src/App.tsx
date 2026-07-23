import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav, PageShell } from '@shared/layouts';
import { JIEYI_NAV } from '@shared/config/navigation';
import { jieyiService } from '@shared/api/services';
import type { RealityIssue } from '@shared/types';
import QuickCapture from './components/QuickCapture';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [focusIssue, setFocusIssue] = useState<RealityIssue | null>(null);
  const isReality = location.pathname === '/reality' || location.pathname === '/';
  const activeNavPath = ['/reflect', '/way', '/dao'].includes(location.pathname) ? '/accumulate' : location.pathname;
  const currentNav = JIEYI_NAV.find((item) => activeNavPath === item.path) ?? JIEYI_NAV[0];

  useEffect(() => {
    if (isReality) {
      setFocusIssue(null);
      return;
    }
    let cancelled = false;
    jieyiService.realityIssues.focus()
      .then((issue) => { if (!cancelled) setFocusIssue(issue); })
      .catch(() => { if (!cancelled) setFocusIssue(null); });
    return () => { cancelled = true; };
  }, [isReality, location.pathname]);

  const currentIssueReturn = !isReality && focusIssue ? (
    <div className="current-reality-return" role="status">
      <button onClick={() => navigate('/reality')}>
        <span>当前现实课题</span>
        <b>{focusIssue.title}</b>
        <em>返回当前现实课题 →</em>
      </button>
    </div>
  ) : undefined;

  const shellHeader = (
    <div className="jieyi-header-stack">
      <header className="jieyi-product-nav">
        <button className="jieyi-brand" type="button" onClick={() => navigate('/reality')} aria-label="返回结衣现实页">
          <span className="jieyi-brand-mark" aria-hidden="true">结</span>
          <span className="jieyi-brand-copy">
            <b>结衣</b>
            <small>知行合一</small>
          </span>
        </button>
        <nav className="jieyi-desktop-nav" aria-label="结衣主导航">
          {JIEYI_NAV.map((item) => (
            <button
              type="button"
              className={activeNavPath === item.path ? 'active' : ''}
              aria-current={activeNavPath === item.path ? 'page' : undefined}
              onClick={() => navigate(item.path)}
              key={item.path}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <span className="jieyi-current-surface">正在{currentNav.label}</span>
      </header>
      {currentIssueReturn}
    </div>
  );

  return (
    <PageShell header={shellHeader} footer={<BottomNav items={JIEYI_NAV} currentPath={activeNavPath} onNavigate={navigate} />}>
      <Outlet />
      <QuickCapture onNavigate={navigate} />
    </PageShell>
  );
}
