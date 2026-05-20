import { Box, css, Icon, Stack, Typography } from "@dldc/hono-ui";
import { Timer } from "lucide-static";
import type { QuizzStore } from "../logic/quizzStore.ts";
import type { Session } from "../logic/sessions.ts";
import { LiveQuizzContent } from "./LiveQuizzContent.tsx";

interface UserQuizzProps {
  store: QuizzStore;
  session: Session;
}

export const UserQuizz = (
  { session, store }: UserQuizzProps,
) => {
  const state = store.getState();
  if (state.state === "idle") {
    return (
      <Box classList={css({ display: "grid", gridTemplateRows: "1fr", placeItems: "center" })}>
        <Stack flexDirection="column" alignItems="center" gap={5} classList={css({ minWidth: "[min(100vw - 2rem, 30rem)]" })}>
          <Icon icon={Timer} size={30} />
          <Typography fontSize="2xl" fontWeight="bold" classList={css({ textAlign: "center" })}>
            Waiting for the quiz to start...
          </Typography>
        </Stack>
      </Box>
    );
  }
  state.state satisfies "running";

  return (
    <Box classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
      <LiveQuizzContent store={store} session={session} />
    </Box>
  );
};
