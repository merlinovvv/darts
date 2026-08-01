import { Navigate } from "react-router-dom";

import { EndTurnButton } from "@/features/end-turn";
import { useFinishGameEffects } from "@/features/finish-game";
import { useRecordThrow } from "@/features/record-throw";
import { GameResultDialog } from "@/features/resume-game";
import { useActiveSession } from "@/entities/game";
import { getDartboardOverlays } from "@/entities/game-rules";
import { Dartboard } from "@/widgets/dartboard";
import { GameHeader } from "@/widgets/game-header";
import { MultiplierPicker } from "@/widgets/multiplier-picker";
import { Scoreboard } from "@/widgets/scoreboard";
import { ThrowFeedback } from "@/widgets/throw-feedback";
import { ROUTES } from "@/shared/config/routes";
import { ScrollArea } from "@/shared/ui";

export function GamePage() {
  const session = useActiveSession();
  const {
    handleWedgeSelect,
    handleConfirmHit,
    cancelPending,
    pendingSelection,
    isDisabled,
  } = useRecordThrow();

  useFinishGameEffects();

  const lastHit = session?.throwHistory.at(-1)?.hit ?? null;
  const cellOverlays = session ? getDartboardOverlays(session) : {};

  if (!session) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <GameHeader />
      <EndTurnButton />
      <Dartboard
        onWedgeSelect={handleWedgeSelect}
        disabled={isDisabled}
        lastHit={lastHit}
        pendingSelection={pendingSelection}
        cellOverlays={cellOverlays}
        className="pt-2"
      />
      <MultiplierPicker
        selection={pendingSelection}
        onConfirm={handleConfirmHit}
        onCancel={cancelPending}
        disabled={isDisabled}
      />
      <ScrollArea className="flex-1">
        <div className="space-y-4 pb-6 pt-2">
          <ThrowFeedback />
          <Scoreboard />
        </div>
      </ScrollArea>
      <GameResultDialog />
    </div>
  );
}
