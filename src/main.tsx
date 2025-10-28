import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/Toast.tsx'
import { Provider } from "react-redux";
import store from './utils/Storage/store.ts'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Provider store={store}>
    <BrowserRouter>

      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </Provider>
  // </StrictMode>,
)
