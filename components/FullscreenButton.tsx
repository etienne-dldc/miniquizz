import { Button, Icon, SrOnly } from "@dldc/hono-ui";
import { Fullscreen } from "lucide-static";

export function FullscreenButton() {
  return (
    <Button
      variant="ghost"
      size={12}
      data-fullscreen
      data-fullscreen-orientation="landscape"
    >
      <Icon icon={Fullscreen} />
      <SrOnly>Plein ecran</SrOnly>
    </Button>
  );
}
