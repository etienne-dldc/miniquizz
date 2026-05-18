import { Button, Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { adminActionProps } from "../../logic/actionProps.ts";
import type { QuizzState } from "../../logic/quizzReducer.ts";
import type { Session } from "../../logic/sessions.ts";
import { Question } from "../Question.tsx";

interface RunningProps {
  state: Extract<QuizzState, { state: "running" }>;
  session: Session;
}

export const Running: FC<RunningProps> = ({ state, session }) => {
  const currentQuestion = state.quizz.questions[state.questionIndex];
  const sessionState = state.sessions[session.id];

  return (
    <Stack flexDirection="column" gap={4}>
      {currentQuestion ? <Question question={currentQuestion} selectedOptionIndex={sessionState?.vote} /> : null}
      <Button
        {...adminActionProps({ type: "Next" }, "ArrowRight")}
      >
        Next
      </Button>
      <Button
        {...adminActionProps({ type: "Reset" })}
      >
        Reset
      </Button>
    </Stack>
  );
};
