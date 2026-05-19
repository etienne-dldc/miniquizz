import { Box, css, type CssObjProperties } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzOption, QuizzQuestionLayout } from "../logic/quizzSchema.ts";
import { OptionItem, type OptionItemState } from "./OptionItem.tsx";

interface QuestionOptionsProps {
  options: QuizzOption[];
  layout: QuizzQuestionLayout | undefined;
  selectedOptionIndex?: number | null;
  showAnswer?: boolean;
}

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const QuestionOptions: FC<QuestionOptionsProps> = ({ options, layout, selectedOptionIndex, showAnswer }) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <Box classList={css({ gap: 5, display: "grid", padding: 5, ...getOptionLayout(options.length, layout) })}>
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
    </Box>
  );
};

function getOptionLayout(optionsCount: number, layout: QuizzQuestionLayout | undefined): CssObjProperties {
  if (layout === "horizontal") {
    return { gridTemplateColumns: "auto", gridTemplateRows: `repeat(${optionsCount}, 1fr)` };
  }
  if (layout === "vertical") {
    return { gridTemplateColumns: `repeat(${optionsCount}, 1fr)`, gridTemplateRows: "auto" };
  }
  if (optionsCount === 2) {
    return { gridTemplateColumns: "auto", gridTemplateRows: "repeat(2, 1fr)" };
  }
  if (optionsCount === 3) {
    return { gridTemplateColumns: "auto", gridTemplateRows: "repeat(3, 1fr)" };
  }
  if (optionsCount === 4) {
    return { gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(2, 1fr)" };
  }
  return { gridTemplateColumns: "auto", gridTemplateRows: `repeat(${optionsCount}, 1fr)` };
}

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
