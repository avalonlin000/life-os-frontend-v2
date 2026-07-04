import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav, PageShell } from '@shared/layouts';
import { JIEYI_NAV } from '@shared/config/navigation';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <PageShell footer={<BottomNav items={JIEYI_NAV} currentPath={location.pathname} onNavigate={navigate} />}>
      <Outlet />
    </PageShell>
  );
}
