import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { RentalProvider } from './context/RentalContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <RentalProvider>
              <App />
            </RentalProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  </StrictMode>,
)