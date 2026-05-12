import { Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzQuestion } from "../logic/quizzSchema.ts";
import { QuizzContentDisplay } from "./QuizzContentDisplay.tsx";

interface QuestionProps {
  question: QuizzQuestion;
}

export const Question: FC<QuestionProps> = ({ question }) => {
  return (
    <Stack direction="column" gap={2}>
      <QuizzContentDisplay content={question.question} />
    </Stack>
  );
};
