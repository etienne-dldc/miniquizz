import { Box, css, Icon, Stack, Typography } from "@dldc/hono-ui";
import { Timer } from "lucide-static";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";
import { DocSlide } from "./DocSlide.tsx";
import { UserResults } from "./UserResults.tsx";

interface UserLiveQuizzProps {
  store: AppStore;
  session: Session;
}

export const UserLiveQuizz = ({ session, store }: UserLiveQuizzProps) => {
  const state = store.getState();

  if (state.state === "idle") {
    return (
      <Box classList={css({ display: "grid", gridTemplateRows: "1fr", placeItems: "center" })} style={{ viewTransitionName: "slide" }}>
        <Stack flexDirection="column" alignItems="center" gap={5} classList={css({ minWidth: "[min(100vw - 2rem, 30rem)]" })}>
          <Icon icon={Timer} size={30} />
          <Typography fontSize="2xl" fontWeight="bold" classList={css({ textAlign: "center" })}>
            En attente du demarrage du quiz...
          </Typography>
        </Stack>
      </Box>
    );
  }
  state.state satisfies "running";
  return (
    <Box classList={css({ display: "grid", gridTemplateRows: "1fr auto", gap: 4 })} style={{ viewTransitionName: "slide" }}>
      <DocSlide store={store} session={session} />
      <UserResults results={store.getSessionResults(session.id)} />
    </Box>
  );
};
