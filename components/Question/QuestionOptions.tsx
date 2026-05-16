import { Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzOption } from "../../logic/quizzSchema.ts";
import { OptionItem } from "./OptionItem.tsx";

interface QuestionOptionsProps {
  options: QuizzOption[];
}

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const QuestionOptions: FC<QuestionOptionsProps> = ({ options }) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <Stack flexDirection="column" gap={5}>
      {options.map((option, index) => {
        const optionLabel = LABELS[index % LABELS.length];
        return <OptionItem key={index} option={option} label={optionLabel} />;
      })}
    </Stack>
  );
};
