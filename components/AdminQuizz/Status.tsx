import { css, Icon, Stack, Typography } from "@dldc/hono-ui";
import { MonitorPlay, User } from "lucide-static";
import type { QuizzState } from "../../logic/quizzStore.ts";

interface StatusProps {
  state: QuizzState;
}

export function Status({ state }: StatusProps) {
  const currentVoteCount = state.sessions.values().reduce((acc, sessionState) => {
    if (sessionState.isAdmin) {
      return acc;
    }
    const vote = sessionState.votes.get(state.progress.questionIndex);
    if (vote !== undefined) {
      return acc + 1;
    }
    return acc;
  }, 0);
  const totalUsers = Array.from(state.sessions.values()).filter((sessionState) => !sessionState.isAdmin).length;

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={20}
      classList={css({ fontFamily: "mono", fontSize: "2xl" })}
    >
      <Stack gap={4} alignItems="center">
        <Icon icon={User} size={7} />
        <Typography>
          {currentVoteCount} / {totalUsers}
        </Typography>
      </Stack>

      <Stack gap={4} alignItems="center">
        <Icon icon={MonitorPlay} size={7} />
        <Typography>
          {state.progress.questionIndex + 1} / {state.quizz.questions.length}
        </Typography>
      </Stack>
    </Stack>
  );
}
