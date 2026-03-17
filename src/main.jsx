import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E3050',
            color: '#F0F6FF',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#1E3050' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#1E3050' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)