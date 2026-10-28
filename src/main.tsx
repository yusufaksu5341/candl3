import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { setupMediaSession } from './audio/mediaSession'

setupMediaSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback="app">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
