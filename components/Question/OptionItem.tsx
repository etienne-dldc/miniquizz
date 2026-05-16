import { css, Stack, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzOption } from "../../logic/quizzSchema.ts";
import { ContentDisplay } from "../ContentDisplay.tsx";

interface OptionItemProps {
  option: QuizzOption;
  label: string;
}

export const OptionItem: FC<OptionItemProps> = ({ option, label }) => {
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

  return (
    <Stack flexDirection="column" gap={2} class={rootClassName}>
      <Typography fontSize="lg" fontWeight="bold" class={labelClassName}>
        {label}
      </Typography>
      <ContentDisplay content={option.content} />
    </Stack>
  );
};
