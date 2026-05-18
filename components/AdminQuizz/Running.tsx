import { Box, Button, css, InlineGroup, Stack, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { adminActionProps } from "../../logic/actionProps.ts";
import type { QuizzState } from "../../logic/quizzStore.ts";
import type { Session } from "../../logic/sessions.ts";
import { ContentDisplay } from "../ContentDisplay.tsx";
import { QuestionOptions } from "../QuestionOptions.tsx";
import { RatioScreen } from "../RatioScreen.tsx";

interface RunningProps {
  state: QuizzState;
  session: Session;
}

export const Running: FC<RunningProps> = ({ state, session }) => {
  const currentQuestion = state.quizz.questions[state.progress.questionIndex];
  const sessionState = state.sessions.get(session.id);
  const currentVote = sessionState?.votes.get(state.progress.questionIndex);

  return (
    <Box class={css({ display: "grid", gap: 4, gridTemplateRows: "1fr auto" })}>
      <RatioScreen ratio={state.quizz.ratio}>
        {state.progress.step === "explanation"
          ? <ContentDisplay content={currentQuestion.question} />
          : state.progress.step === "timesup"
          ? <Typography class={css({ textAlign: "center" })} fontSize="3xl" fontWeight="bold">🥁🥁🥁🥁🥁</Typography>
          : <ContentDisplay content={currentQuestion.question} />}
      </RatioScreen>
      <Stack flexDirection="column" gap={4} class={css({ maxWidth: "[min(100vw - 4rem, 60rem)]", margin: "[auto]", width: "full" })}>
        <QuestionOptions
          options={currentQuestion.options}
          selectedOptionIndex={currentVote}
          showAnswer={state.progress.step === "answer"}
        />
        <InlineGroup class={css({ display: "grid", gridTemplateColumns: "1fr 1fr" })}>
          <Button {...adminActionProps({ type: "Prev" }, "ArrowLeft")}>
            Prev
          </Button>
          <Button {...adminActionProps({ type: "Next" }, "ArrowRight")}>
            Next
          </Button>
        </InlineGroup>
        <Button {...adminActionProps({ type: "Reset" })}>
          Reset
        </Button>
      </Stack>
    </Box>
  );
};
