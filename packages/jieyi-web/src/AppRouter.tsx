import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Knowledge from './pages/Knowledge';
import Action from './pages/Action';
import Reflect from './pages/Reflect';
import Way from './pages/Way';
import RealityIssue from './pages/RealityIssue';
import Accumulation from './pages/Accumulation';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="reality" replace />} />
        <Route path="reality" element={<RealityIssue />} />
        <Route path="know" element={<Knowledge />} />
        <Route path="act" element={<Action />} />
        <Route path="accumulate" element={<Accumulation />} />
        <Route path="reflect" element={<Reflect />} />
        <Route path="way" element={<Way />} />
        <Route path="dao" element={<Navigate to="/way" replace />} />
      </Route>
    </Routes>
  );
}
