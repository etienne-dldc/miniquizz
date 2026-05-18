import { Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzOption } from "../../logic/quizzSchema.ts";
import { OptionItem, type OptionItemState } from "./OptionItem.tsx";

interface QuestionOptionsProps {
  options: QuizzOption[];
  selectedOptionIndex?: number | null;
  showAnswer?: boolean;
}

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const QuestionOptions: FC<QuestionOptionsProps> = ({ options, selectedOptionIndex, showAnswer }) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <Stack flexDirection="column" gap={5}>
      {options.map((option, index) => {
        const optionLabel = LABELS[index % LABELS.length];
        return (
          <OptionItem
            key={index}
            index={index}
            option={option}
            label={optionLabel}
            state={getOptionItemState(index, option, selectedOptionIndex, showAnswer)}
          />
        );
      })}
    </Stack>
  );
};

function getOptionItemState(
  index: number,
  option: QuizzOption,
  selectedOptionIndex?: number | null,
  showAnswer?: boolean,
): OptionItemState {
  const isSelected = selectedOptionIndex === index;
  if (!showAnswer) {
    return isSelected ? "selected" : "default";
  }
  // show answer
  if (!isSelected) {
    return option.isCorrect ? "valid" : "invalid";
  }
  // is selected
  return option.isCorrect ? "correct" : "wrong";
}
