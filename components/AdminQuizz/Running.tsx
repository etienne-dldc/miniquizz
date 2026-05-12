import { Button, Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { adminActionProps } from "../../logic/actionProps.ts";
import type { QuizzState } from "../../logic/quizzReducer.ts";
import { Question } from "../Question.tsx";

interface RunningProps {
  state: Extract<QuizzState, { state: "running" }>;
}

export const Running: FC<RunningProps> = ({ state }) => {
  const currentQuestion = state.quizz.questions[state.questionIndex];

  return (
    <Stack direction="column" gap={4}>
      {currentQuestion ? <Question question={currentQuestion} /> : null}
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
