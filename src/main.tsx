import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Auth0ProviderWrapper } from './auth/Auth0ProviderWrapper';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0ProviderWrapper>
      <App />
    </Auth0ProviderWrapper>
  </StrictMode>
);