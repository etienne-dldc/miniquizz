import { Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzOption } from "../../logic/quizzSchema.ts";
import { OptionItem } from "./OptionItem.tsx";

interface QuestionOptionsProps {
  options: QuizzOption[];
  selectedOptionIndex?: number | null;
}

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const QuestionOptions: FC<QuestionOptionsProps> = ({ options, selectedOptionIndex }) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <Stack flexDirection="column" gap={5}>
      {options.map((option, index) => {
        const optionLabel = LABELS[index % LABELS.length];
        const isSelected = selectedOptionIndex === index;
        return <OptionItem key={index} index={index} option={option} label={optionLabel} selected={isSelected} />;
      })}
    </Stack>
  );
};
