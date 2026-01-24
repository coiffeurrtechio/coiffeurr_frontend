import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/Toast.tsx'
import { Provider } from "react-redux";
import store from './utils/Storage/store.ts'

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
  <Provider store={store}>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </Provider>
)