import { css, Icon, Stack, Typography } from "@dldc/hono-ui";
import { MonitorPlay, User } from "lucide-static";
import type { AppStore } from "../logic/store.ts";

interface StatusProps {
  store: AppStore;
}

export function Status({ store }: StatusProps) {
  const currentStep = store.getCurrentProgress();
  const quizz = store.getDoc();
  const { totalUsers, totalVotes } = store.getCurrentQuestionStats();

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={20}
      classList={css({
        fontFamily: "mono",
        fontSize: "2xl",
        vars: {
          "--icon-size": "1.2em",
        },
        media: {
          "@media (max-width: 1000px)": {
            gap: 10,
            fontSize: "lg",
          },
        },
      })}
    >
      <Stack gap={4} alignItems="center">
        <Icon icon={User} />
        {currentStep.type === "question"
          ? (
            <Typography>
              {totalVotes} / {totalUsers}
            </Typography>
          )
          : <Typography>{totalUsers}</Typography>}
      </Stack>

      <Stack gap={4} alignItems="center">
        <Icon icon={MonitorPlay} />
        <Typography>
          {currentStep.stepIndex + 1} / {quizz.slides.length}
        </Typography>
      </Stack>
    </Stack>
  );
}
