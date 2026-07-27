import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// In production (Cloudflare Pages), VITE_API_URL must point to the deployed
// API server, e.g. https://api-server.username.replit.app
// In development the Vite proxy forwards /api to localhost:8080 automatically.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById('root')!).render(<App />);
