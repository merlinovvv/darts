import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppRouter } from '@/app/providers/router'
import '@/app/styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
