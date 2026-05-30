import { Box, css, cssVar, Stack, tokens, Typography } from "@dldc/hono-ui";
import { useSlides } from "../../contexts/slides.tsx";
import { userActionProps } from "../../logic/actionProps.ts";
import type { Block_QuizzOption } from "../../logic/parseDoc.ts";
import { BlockDisplay } from "../BlockDisplay.tsx";

export type OptionItemState = "default" | "selected" | "correct" | "wrong" | "valid" | "invalid";

const itemBg = cssVar("option-item-bg");
const labelBg = cssVar("option-label-bg");
const borderColor = cssVar("option-border-color");
const borderWidth = cssVar("option-border-width");

const rootClassName = css({
  position: "relative",
  cornerShape: "superellipse",
  borderWidth: borderWidth,
  borderStyle: "solid",
  borderRadius: 2,
  padding: 2,
  transition: "border-color 120ms ease-out, background-color 120ms ease-out",
  background: itemBg,
  borderColor: "white/10",
  vars: {
    [borderWidth.name]: "1px",
  },
  selectors: {
    "&::before": {
      content: "empty",
      borderRadius: "inherit",
      cornerShape: "inherit",
      position: "absolute",
      inset: `[calc(-1 * ${borderWidth})]`,
      borderWidth: "3px",
      borderStyle: "solid",
      borderColor: borderColor,
      pointerEvents: "none",
    },
  },
});

const interactiveClassName = css({
  cursor: "pointer",
  selectors: {
    "&:hover": {
      // Lighten background on hover
      background: `[color-mix(in srgb, ${itemBg} 97%, white)]`,
    },
  },
});

const topLeftWrapper = css({
  position: "absolute",
  top: -2,
  left: -2,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "full",
  cornerShape: "superellipse",
  background: `[color-mix(in oklab, ${labelBg}, black 30%);]`,
});

const labelBubbleClassName = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: labelBg,
  width: 8,
  height: 8,
  borderRadius: "full",
  cornerShape: "superellipse",
  color: "white",
  fontSize: "xl",
  fontWeight: "bold",
});

const labelCountClassName = css({
  fontSize: "xl",
  color: "white",
  paddingX: 2,
  fontFamily: "mono",
});

const stateClassNames: Record<OptionItemState, Promise<string>> = {
  default: css({
    vars: {
      [itemBg.name]: tokens.c("neutral-900"),
      [labelBg.name]: tokens.c("neutral-700"),
      [borderColor.name]: "transparent",
    },
  }),
  selected: css({
    vars: {
      [itemBg.name]: tokens.c("neutral-800"),
      [labelBg.name]: tokens.c("blue-500"),
      [borderColor.name]: tokens.c("blue-500"),
    },
  }),
  correct: css({
    vars: {
      [itemBg.name]: tokens.c("green-700"),
      [labelBg.name]: tokens.c("green-500"),
      [borderColor.name]: tokens.c("green-500"),
    },
  }),
  wrong: css({
    vars: {
      [itemBg.name]: tokens.opacity(tokens.c("red-500"), 5),
      [labelBg.name]: tokens.c("red-500"),
      [borderColor.name]: tokens.c("red-500"),
    },
  }),
  valid: css({
    vars: {
      [itemBg.name]: tokens.c("green-600"),
      [labelBg.name]: tokens.c("green-500"),
      [borderColor.name]: "transparent",
    },
  }),
  invalid: css({
    vars: {
      [itemBg.name]: tokens.c("neutral-900"),
      [labelBg.name]: tokens.c("red-600"),
      [borderColor.name]: "transparent",
    },
    opacity: 0.6,
  }),
};

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface BlockQuizzOptionDisplayProps {
  block: Block_QuizzOption;
}

export function BlockQuizzOptionDisplay({ block }: BlockQuizzOptionDisplayProps) {
  const { progress, store, sessionState } = useSlides();

  if (progress.type !== "question") {
    return (null);
  }
  const optionIndex = progress.options.findIndex((option) => option.value === block.value);
  if (optionIndex === -1) {
    return null;
  }
  const label = LABELS[optionIndex % LABELS.length];
  const option = progress.options[optionIndex];

  const state = getOptionItemState(block.value, option.isCorrect ?? false, sessionState?.voteValue, progress.phase !== "question");
  const isInteractive = state === "default" || state === "selected";
  const count = store?.getOptionVoteCount(progress.questionIndex, option.value) ?? null;
  const showCount = count !== null && progress.phase === "answer";

  return (
    <Stack
      flexDirection="column"
      gap={2}
      justifyContent="center"
      alignItems="center"
      classList={[rootClassName, stateClassNames[state], isInteractive && interactiveClassName]}
      {...userActionProps({ type: "Vote", optionValue: option.value })}
    >
      <Box classList={topLeftWrapper}>
        <Typography classList={labelBubbleClassName}>
          {label}
        </Typography>
        {showCount && (
          <Typography classList={labelCountClassName}>
            {count}
          </Typography>
        )}
      </Box>
      {block.children.map((child, index) => <BlockDisplay key={index} block={child} />)}
    </Stack>
  );
}

function getOptionItemState(
  value: string,
  isCorrect: boolean,
  selectedOptionValue?: string | null,
  showAnswer?: boolean,
): OptionItemState {
  const isSelected = selectedOptionValue === value;
  if (!showAnswer) {
    return isSelected ? "selected" : "default";
  }
  // show answer
  if (isSelected) {
    return isCorrect ? "correct" : "wrong";
  }
  return isCorrect ? "valid" : "invalid";
}
