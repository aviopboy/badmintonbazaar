import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// VITE_API_URL should be set in your Cloudflare Pages environment variables.
// In dev (Replit) use relative paths so the built-in proxy routes /api/* to the
// local API server. In production fall back to the Vercel deployment.
const apiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.DEV ? '' : 'https://badmintonbazaar-api-server.vercel.app');

setBaseUrl(apiUrl);

createRoot(document.getElementById('root')!).render(<App />);
