import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EnterName from './pages/EnterName.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EnterName />
  </StrictMode>,
)
