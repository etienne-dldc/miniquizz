import { css, Icon, Stack, Typography } from "@dldc/hono-ui";
import { CircleCheckBig, CircleDashed, CircleX } from "lucide-static";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";

interface UserResultsProps {
  store: AppStore;
  session: Session;
}

export function UserResults({ store, session }: UserResultsProps) {
  const results = store.getSessionResults(session.id);
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
      <Stack gap={4} alignItems="center" classList={css({ color: "green-400" })}>
        <Icon icon={CircleCheckBig} size={7} />
        <Typography>{results.correct}</Typography>
      </Stack>
      <Stack gap={4} alignItems="center" classList={css({ color: "blue-400" })}>
        <Icon icon={CircleDashed} size={7} />
        <Typography>{results.skipped}</Typography>
      </Stack>
      <Stack gap={4} alignItems="center" classList={css({ color: "red-400" })}>
        <Icon icon={CircleX} size={7} />
        <Typography>{results.wrong}</Typography>
      </Stack>
    </Stack>
  );
}
