import { Button, Icon, Stack } from "@dldc/hono-ui";
import { LogOut } from "lucide-static";

export const LogoutButton = () => {
  return (
    <Stack
      render={<form method="post" action="/logout" />}
      direction="column"
      align="center"
    >
      <Button type="submit" variant="ghost">
        <Icon icon={LogOut} />
        Logout
      </Button>
    </Stack>
  );
};
