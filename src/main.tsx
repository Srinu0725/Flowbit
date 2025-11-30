import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AOIPage } from './pages/AOIPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AOIPage />
  </StrictMode>,
)
