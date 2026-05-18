import { Button, css, InlineGroup, Stack, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { adminActionProps } from "../../logic/actionProps.ts";
import type { QuizzState } from "../../logic/quizzStore.ts";
import type { Session } from "../../logic/sessions.ts";
import { ContentDisplay } from "../ContentDisplay.tsx";
import { Question } from "../Question.tsx";

interface RunningProps {
  state: QuizzState;
  session: Session;
}

export const Running: FC<RunningProps> = ({ state, session }) => {
  const currentQuestion = state.quizz.questions[state.progress.questionIndex];
  const sessionState = state.sessions.get(session.id);
  const currentVote = sessionState?.votes.get(state.progress.questionIndex);

  return (
    <Stack flexDirection="column" gap={4}>
      {currentQuestion
        ? <Question question={currentQuestion} selectedOptionIndex={currentVote} showAnswer={state.progress.step === "answer"} />
        : null}
      {state.progress.step === "answer" && currentQuestion.explanation ? <ContentDisplay content={currentQuestion.explanation} /> : null}
      {state.progress.step === "timesup"
        ? <Typography class={css({ textAlign: "center" })} fontSize="3xl" fontWeight="bold">🥁🥁🥁🥁🥁</Typography>
        : null}
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
  );
};
