import { Button, Icon, SrOnly } from "@dldc/hono-ui";
import { LogOut } from "lucide-static";

export const LogoutButton = () => {
  return (
    <Button
      variant="ghost"
      size={12}
      hx-post="/logout"
      hx-swap="none"
      hx-confirm="Etes-vous sur de vouloir vous deconnecter ?"
    >
      <Icon icon={LogOut} />
      <SrOnly>Deconnexion</SrOnly>
    </Button>
  );
};
