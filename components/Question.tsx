import { css, Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzQuestion } from "../logic/quizzSchema.ts";
import { ContentDisplay } from "./ContentDisplay.tsx";
import { QuestionOptions } from "./Question/QuestionOptions.tsx";

interface QuestionProps {
  question: QuizzQuestion;
  selectedOptionIndex?: number | null;
}

export const Question: FC<QuestionProps> = ({ question, selectedOptionIndex }) => {
  return (
    <Stack flexDirection="column" gap={6} class={css({ paddingY: 3 })}>
      <ContentDisplay content={question.question} />
      <QuestionOptions options={question.options} selectedOptionIndex={selectedOptionIndex} />
    </Stack>
  );
};
