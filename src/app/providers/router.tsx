import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { FlowLayout } from "@/app/layouts/FlowLayout";
import { HubLayout } from "@/app/layouts/HubLayout";
import { ResumeGameDialog } from "@/features/resume-game";
import { BoardPage } from "@/pages/board";
import { FriendsGamesPage } from "@/pages/friends-games";
import { GamePage } from "@/pages/game";
import { GameSetupPage } from "@/pages/game-setup";
import { HomePage } from "@/pages/home";
import { SocialPage } from "@/pages/social";
import { SoloGamesPage } from "@/pages/solo-games";
import { StatsPage } from "@/pages/stats";
import { TrophiesPage } from "@/pages/trophies";
import { ROUTES } from "@/shared/config/routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ResumeGameDialog />
      <Routes>
        <Route element={<HubLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.stats} element={<StatsPage />} />
          <Route path={ROUTES.trophies} element={<TrophiesPage />} />
          <Route path={ROUTES.social} element={<SocialPage />} />
          <Route path={ROUTES.board} element={<BoardPage />} />
        </Route>
        <Route element={<FlowLayout />}>
          <Route path={ROUTES.friends} element={<FriendsGamesPage />} />
          <Route path={ROUTES.solo} element={<SoloGamesPage />} />
          <Route path={ROUTES.setup} element={<GameSetupPage />} />
          <Route path={ROUTES.game} element={<GamePage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
