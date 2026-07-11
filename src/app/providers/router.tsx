import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ResumeGameDialog } from '@/features/resume-game'
import { FriendsGamesPage } from '@/pages/friends-games'
import { GamePage } from '@/pages/game'
import { GameSetupPage } from '@/pages/game-setup'
import { HomePage } from '@/pages/home'
import { SoloGamesPage } from '@/pages/solo-games'
import { ROUTES } from '@/shared/config/routes'

export function AppRouter() {
  return (
    <BrowserRouter>
      <ResumeGameDialog />
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.friends} element={<FriendsGamesPage />} />
        <Route path={ROUTES.solo} element={<SoloGamesPage />} />
        <Route path={ROUTES.setup} element={<GameSetupPage />} />
        <Route path={ROUTES.game} element={<GamePage />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
