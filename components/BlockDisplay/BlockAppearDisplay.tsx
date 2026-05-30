import { Box, css } from "@dldc/hono-ui";
import { useSlides } from "../../contexts/slides.tsx";
import type { Block_Appear } from "../../logic/parseDoc.ts";
import { BlockDisplay } from "../BlockDisplay.tsx";

interface BlockAppearDisplayProps {
  block: Block_Appear;
}

export function BlockAppearDisplay({ block }: BlockAppearDisplayProps) {
  const { progress } = useSlides();
  const hide = progress.type === "leaderboard" ? false : progress.appearOffset < block.offset;

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
