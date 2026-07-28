import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Replit routes /api/* to the API server in both dev and production.
// Override with VITE_API_URL only if you host the frontend on an external
// service (e.g. Cloudflare Pages) that needs an absolute API URL.
const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

setBaseUrl(apiUrl);

createRoot(document.getElementById('root')!).render(<App />);
