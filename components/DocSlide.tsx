import { css } from "@dldc/hono-ui";
import { SessionProvider } from "../contexts/session.tsx";
import { StoreProvider } from "../contexts/store.tsx";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";
import { BlockDisplay } from "./BlockDisplay.tsx";
import { Leaderboard } from "./Leaderboard.tsx";
import { RatioScreen } from "./RatioScreen.tsx";

interface DocStepProps {
  store: AppStore;
  session: Session;
}

export function DocSlide({ store, session }: DocStepProps) {
  const progress = store.getCurrentProgress();
  const quizz = store.getDoc();

  return (
    <SessionProvider session={session}>
      <StoreProvider store={store}>
        <RatioScreen ratio={quizz.ratio} classList={css({ padding: 5, overflow: "hidden" })}>
          {progress.type === "leaderboard"
            ? <Leaderboard store={store} session={session} />
            : progress.step.blocks.map((block, index) => <BlockDisplay key={index} block={block} />)}
        </RatioScreen>
      </StoreProvider>
    </SessionProvider>
  );
}
