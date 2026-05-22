import { css } from "@dldc/hono-ui";
import type { Block_Image } from "../../logic/parseDoc.ts";

interface BlockImageDisplayProps {
  block: Block_Image;
}

export function BlockImageDisplay({ block }: BlockImageDisplayProps) {
  return <img class={css({ maxWidth: "full", height: `[${block.size}rem]` })} src={block.src} alt={block.alt} />;
}
