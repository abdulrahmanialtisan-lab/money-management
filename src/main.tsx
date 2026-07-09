import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './i18n'
import './styles/globals.css'

// HashRouter (not BrowserRouter): the app needs to run unmodified on static
// hosts with no server-side rewrite rule (GitHub Pages, a single published
// HTML file) — hash-based routes never trigger a real navigation/request.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
