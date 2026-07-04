import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@shared/components';
import AppRouter from './AppRouter';
import '@shared/styles/components.css';
import './styles/global.css';

const basename = window.location.pathname.startsWith('/jieyi') ? '/jieyi' : undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
