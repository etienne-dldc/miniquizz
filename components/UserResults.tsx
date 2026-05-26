import { css, Icon, Stack, Typography } from "@dldc/hono-ui";
import { CircleCheckBig, CircleDashed, CircleX } from "lucide-static";
import type { SessionResults } from "../logic/store.ts";

interface UserResultsProps {
  results: SessionResults | null;
}

export function UserResults({ results }: UserResultsProps) {
  if (!results) {
    return null;
  }
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={20}
      classList={css({
        fontFamily: "mono",
        fontSize: "2xl",
        vars: {
          "--icon-size": "1.1em",
        },
        media: {
          "@media (max-width: 1000px)": {
            gap: 10,
            fontSize: "lg",
          },
        },
      })}
    >
      <Stack gap={4} alignItems="center" justifyContent="flex-end" classList={css({ color: "green-400" })}>
        <Typography>{results.correct}</Typography>
        <Icon icon={CircleCheckBig} />
      </Stack>
      <Stack gap={4} alignItems="center" justifyContent="flex-end" classList={css({ color: "blue-400" })}>
        <Typography>{results.skipped}</Typography>
        <Icon icon={CircleDashed} />
      </Stack>
      <Stack gap={4} alignItems="center" justifyContent="flex-end" classList={css({ color: "red-400" })}>
        <Typography>{results.wrong}</Typography>
        <Icon icon={CircleX} />
      </Stack>
    </Stack>
  );
}
