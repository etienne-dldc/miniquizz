import { css, Icon, Stack, Typography } from "@dldc/hono-ui";
import { MonitorPlay, User } from "lucide-static";
import type { AppStore } from "../logic/store.ts";

interface StatusProps {
  store: AppStore;
}

export function Status({ store }: StatusProps) {
  const currentStep = store.getCurrentStep();
  const quizz = store.getDoc();
  const { totalUsers, totalVotes } = store.getCurrentQuestionStats();

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
          {totalVotes} / {totalUsers}
        </Typography>
      </Stack>

      <Stack gap={4} alignItems="center">
        <Icon icon={MonitorPlay} size={7} />
        <Typography>
          {currentStep.index + 1} / {quizz.steps.length}
        </Typography>
      </Stack>
    </Stack>
  );
}
