import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './components/Bitrix24App'
import Dashboard from './components/Bitrix24App/dashboard'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lead" element={<App />} />
      </Routes>
    </Router>
  </StrictMode>,
)
