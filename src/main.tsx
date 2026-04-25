import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/Toast.tsx'
import { Provider } from "react-redux";
import store from './utils/Storage/store.ts'
import { GoogleOAuthProvider } from '@react-oauth/google'

// PWA Import
import { registerSW } from 'virtual:pwa-register'

// Register with a refresh logic
const updateSW = registerSW({
  onNeedRefresh() {
    // Senior tip: Instead of window.confirm, 
    // you could dispatch a Redux action here to show your custom Toast
    if (confirm('New version available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
})

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="584558727500-i5sv6ci73aqgnuple5rebq6r1gq85vb4.apps.googleusercontent.com">
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
)