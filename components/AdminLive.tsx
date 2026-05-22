import { Box, Button, css, Icon, Stack } from "@dldc/hono-ui";
import { Play } from "lucide-static";
import { adminActionProps } from "../logic/actionProps.ts";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";
import { DocStep } from "./DocStep.tsx";
import { Status } from "./Status.tsx";

interface AdminLiveProps {
  store: AppStore;
  session: Session;
}

export const AdminLive = ({ store, session }: AdminLiveProps) => {
  const state = store.getState();

  if (state.state === "idle") {
    return (
      <Box classList={css({ display: "grid", gridTemplateRows: "1fr", placeItems: "center" })}>
        <Stack flexDirection="column" gap={2} classList={css({ minWidth: "[min(100vw - 2rem, 30rem)]" })}>
          <Button
            variant="primary"
            size={14}
            {...adminActionProps({ type: "Start" }, "Space")}
          >
            <Icon icon={Play} />
            Demarrer
          </Button>
        </Stack>
      </Box>
    );
  }
  state.state satisfies "running";
  return (
    <Box classList={css({ display: "grid", gridTemplateRows: "1fr auto", gap: 4 })}>
      <DocStep store={store} session={session} />
      <Status store={store} />
    </Box>
  );
};
