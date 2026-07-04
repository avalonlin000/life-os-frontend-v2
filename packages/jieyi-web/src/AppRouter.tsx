import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Knowledge from './pages/Knowledge';
import Action from './pages/Action';
import Reflect from './pages/Reflect';
import Way from './pages/Way';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="know" replace />} />
        <Route path="know" element={<Knowledge />} />
        <Route path="act" element={<Action />} />
        <Route path="reflect" element={<Reflect />} />
        <Route path="way" element={<Way />} />
        <Route path="dao" element={<Navigate to="/way" replace />} />
      </Route>
    </Routes>
  );
}
