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
      classList={css({ fontFamily: "mono", fontSize: "2xl" })}
    >
      <Stack gap={4} alignItems="center" justifyContent="flex-end" classList={css({ color: "green-400" })}>
        <Typography>{results.correct}</Typography>
        <Icon icon={CircleCheckBig} size={7} />
      </Stack>
      <Stack gap={4} alignItems="center" justifyContent="flex-end" classList={css({ color: "blue-400" })}>
        <Typography>{results.skipped}</Typography>
        <Icon icon={CircleDashed} size={7} />
      </Stack>
      <Stack gap={4} alignItems="center" justifyContent="flex-end" classList={css({ color: "red-400" })}>
        <Typography>{results.wrong}</Typography>
        <Icon icon={CircleX} size={7} />
      </Stack>
    </Stack>
  );
}
