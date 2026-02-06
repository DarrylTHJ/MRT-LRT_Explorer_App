import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.tsx'
import './styles/index.css'
import { APIProvider } from '@vis.gl/react-google-maps';

// 🔴 FIX: Cast import.meta to 'any' to stop the TypeScript error
const MAPS_KEY = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "";

if (!MAPS_KEY) {
  console.error("🚨 Maps API Key is missing in .env");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <APIProvider apiKey={MAPS_KEY}>
      <App />
    </APIProvider>
  </React.StrictMode>,
)