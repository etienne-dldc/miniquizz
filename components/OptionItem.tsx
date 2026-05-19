import { css, cssVar, Stack, tokens, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { userActionProps } from "../logic/actionProps.ts";
import type { QuizzOption } from "../logic/quizzSchema.ts";
import { ContentDisplay } from "./ContentDisplay.tsx";

export type OptionItemState = "default" | "selected" | "correct" | "wrong" | "valid" | "invalid";

const itemBg = cssVar("option-item-bg");
const labelBg = cssVar("option-label-bg");
const borderColor = cssVar("option-border-color");

const rootClassName = css({
  position: "relative",
  cornerShape: "superellipse",
  borderWidth: "1px",
  borderStyle: "solid",
  borderRadius: 2,
  padding: 3,
  transition: "border-color 120ms ease-out, background-color 120ms ease-out",
  background: itemBg,
  borderColor: "white/10",
  selectors: {
    "&::before": {
      content: "empty",
      borderRadius: "inherit",
      cornerShape: "inherit",
      position: "absolute",
      inset: 0,
      borderWidth: "3px",
      borderStyle: "solid",
      borderColor: borderColor,
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

const labelClassName = css({
  position: "absolute",
  top: 0,
  left: 0,
  transform: "translate(-30%, -30%)",
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
    opacity: 0.5,
  }),
};

interface OptionItemProps {
  index: number;
  option: QuizzOption;
  label: string;
  state: OptionItemState;
}

export const OptionItem: FC<OptionItemProps> = ({ index, option, label, state }) => {
  const isInteractive = state === "default" || state === "selected";

  return (
    <Stack
      flexDirection="column"
      gap={2}
      justifyContent="center"
      alignItems="center"
      classList={[rootClassName, stateClassNames[state], isInteractive && interactiveClassName]}
      {...userActionProps({ type: "Vote", optionIndex: index })}
    >
      <Typography classList={labelClassName}>
        {label}
      </Typography>
      <ContentDisplay content={option.content} />
    </Stack>
  );
};
