import { Button, Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { adminActionProps } from "../logic/actionProps.ts";
import type { QuizzState } from "../logic/quizzReducer.ts";
import { Idle } from "./AdminQuizz/Idle.tsx";
import { Running } from "./AdminQuizz/Running.tsx";

export const AdminQuizz: FC<{ state: QuizzState }> = ({ state }) => {
  if (state.state === "idle") {
    return <Idle />;
  }
  if (state.state === "running") {
    return <Running state={state} />;
  }
  state satisfies never;
  return (
    <Stack flexDirection="column">
      <div>Unknown state</div>
      <Button {...adminActionProps({ type: "Reset" })}>
        Reset
      </Button>
    </Stack>
  );
};
