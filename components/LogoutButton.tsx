import { Button, Icon, SrOnly } from "@dldc/hono-ui";
import { LogOut } from "lucide-static";

export const LogoutButton = () => {
  return (
    <Button
      variant="ghost"
      size={12}
      hx-post="/logout"
      hx-swap="none"
      hx-confirm="Are you sure you want to logout?"
    >
      <Icon icon={LogOut} />
      <SrOnly>Logout</SrOnly>
    </Button>
  );
};
