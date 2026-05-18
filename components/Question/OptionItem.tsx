import { css, Stack, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { userActionProps } from "../../logic/actionProps.ts";
import type { QuizzOption } from "../../logic/quizzSchema.ts";
import { ContentDisplay } from "../ContentDisplay.tsx";

const rootClassName = css({
  position: "relative",
  cornerShape: "superellipse",
  background: "neutral-900",
  borderWidth: "0.5px",
  borderStyle: "solid",
  borderColor: "white/10",
  borderRadius: 2,
  padding: 3,
  transition: "border-color 120ms ease-out, background-color 120ms ease-out",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      background: "neutral-800",
      borderColor: "white/15",
    },
  },
});

const labelClassName = css({
  position: "absolute",
  top: 0,
  left: 0,
  transform: "translate(-20%, -20%)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 7,
  height: 7,
  borderRadius: "full",
  cornerShape: "superellipse",
  background: "neutral-700",
  color: "white",
});

const selectedClassName = css({
  background: "blue-700",
  borderColor: "blue-500",
  selectors: {
    "&:hover": {
      background: "blue-700",
      borderColor: "blue-500",
    },
  },
});

interface OptionItemProps {
  index: number;
  option: QuizzOption;
  label: string;
  selected: boolean;
}

export const OptionItem: FC<OptionItemProps> = ({ index, option, label, selected }) => {
  return (
    <Stack
      flexDirection="column"
      gap={2}
      class={[rootClassName, selected && selectedClassName]}
      {...userActionProps({ type: "Vote", optionIndex: index })}
    >
      <Typography fontSize="lg" fontWeight="bold" class={labelClassName}>
        {label}
      </Typography>
      <ContentDisplay content={option.content} />
    </Stack>
  );
};
