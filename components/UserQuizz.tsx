import { Stack, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzState } from "../logic/quizzStore.ts";

export const UserQuizz: FC<{ state: QuizzState; sessionId: string }> = (
  { sessionId },
) => {
  return (
    <Stack>
      <Typography>Todo {sessionId}</Typography>
    </Stack>
  );
};
