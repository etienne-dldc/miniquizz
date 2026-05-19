import { Box, Button, css, Icon, Stack } from "@dldc/hono-ui";
import { Play } from "lucide-static";
import { adminActionProps } from "../logic/actionProps.ts";
import type { QuizzState } from "../logic/quizzStore.ts";
import type { Session } from "../logic/sessions.ts";
import { Status } from "./AdminQuizz/Status.tsx";
import { LiveQuizzContent } from "./LiveQuizzContent.tsx";

interface AdminQuizzProps {
  state: QuizzState;
  session: Session;
}

export const AdminQuizz = ({ state, session }: AdminQuizzProps) => {
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
            Start
          </Button>
        </Stack>
      </Box>
    );
  }
  state.state satisfies "running";
  return (
    <Box classList={css({ display: "grid", gridTemplateRows: "1fr auto" })}>
      <LiveQuizzContent state={state} session={session} />
      <Status state={state} />
    </Box>
  );
};
