import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import JoinRoom from './pages/JoinRoom.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JoinRoom />
  </StrictMode>,
)
