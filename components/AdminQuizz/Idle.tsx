import { Button, Stack } from "@dldc/hono-ui";
import { adminActionProps } from "../../logic/actionProps.ts";

export const Idle = () => {
  return (
    <Stack flexDirection="column" gap={2}>
      <Button {...adminActionProps({ type: "Reset" })}>
        Reset
      </Button>
      <Button
        {...adminActionProps({ type: "Start" }, "Space")}
        variant="primary"
      >
        Start
      </Button>
    </Stack>
  );
};
