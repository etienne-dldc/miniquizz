import { Box, css } from "@dldc/hono-ui";
import { useStore } from "../../contexts/store.tsx";
import type { Block_Appear } from "../../logic/parseDoc.ts";
import { BlockDisplay } from "../BlockDisplay.tsx";

interface BlockAppearDisplayProps {
  block: Block_Appear;
}

export function BlockAppearDisplay({ block }: BlockAppearDisplayProps) {
  const store = useStore();

  const progress = store.getCurrentProgress();
  const hide = progress.appearOffset < block.offset;

  return (
    <Box
      classList={css({
        visibility: hide ? "hidden" : "visible",
      })}
    >
      {block.children.map((child, index) => <BlockDisplay key={index} block={child} />)}
    </Box>
  );
}
