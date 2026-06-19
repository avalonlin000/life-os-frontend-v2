import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Trades from './pages/Trades';
import Team3D from './pages/Team3D';
import TKSearch from './pages/TKSearch';
import Analyst from './pages/Analyst';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="/trades" replace />} />
        <Route path="trades" element={<Trades />} />
        <Route path="team-3d" element={<Team3D />} />
        <Route path="tk" element={<TKSearch />} />
        <Route path="analyst" element={<Analyst />} />
      </Route>
    </Routes>
  );
}
