import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// VITE_API_URL should be set in your Cloudflare Pages environment variables.
// Falls back to the production Vercel API server if the variable is not provided.
const apiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://badmintonbazaar-api-server.vercel.app';

setBaseUrl(apiUrl);

createRoot(document.getElementById('root')!).render(<App />);
