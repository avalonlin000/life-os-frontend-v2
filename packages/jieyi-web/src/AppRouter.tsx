import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Knowledge from './pages/Knowledge';
import Action from './pages/Action';
import Reflect from './pages/Reflect';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="/know" replace />} />
        <Route path="know" element={<Knowledge />} />
        <Route path="act" element={<Action />} />
        <Route path="reflect" element={<Reflect />} />
      </Route>
    </Routes>
  );
}
