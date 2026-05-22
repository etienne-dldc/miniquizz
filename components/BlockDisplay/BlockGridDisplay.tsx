import { Box, css } from "@dldc/hono-ui";
import type { Block_Grid } from "../../logic/parseDoc.ts";
import { BlockDisplay } from "../BlockDisplay.tsx";

interface BlockGridDisplayProps {
  block: Block_Grid;
}

export function BlockGridDisplay({ block }: BlockGridDisplayProps) {
  return (
    <Box
      classList={css({
        display: "grid",
        gap: block.gap ?? 1,
        gridTemplateColumns: block.columns ?? "1fr",
        gridTemplateRows: block.rows ?? "1fr",
      })}
    >
      {block.children.map((child, index) => <BlockDisplay key={index} block={child} />)}
    </Box>
  );
}
