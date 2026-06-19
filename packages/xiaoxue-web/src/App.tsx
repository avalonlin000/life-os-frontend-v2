import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PageShell, SideNav } from '@shared/layouts';
import { XIAOXUE_NAV } from '@shared/config/navigation';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <PageShell
      sidebar={
        <SideNav
          items={XIAOXUE_NAV}
          currentPath={location.pathname}
          onNavigate={navigate}
        />
      }
    >
      <Outlet />
    </PageShell>
  );
}
