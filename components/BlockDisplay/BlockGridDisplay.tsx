import { Box, css } from "@dldc/hono-ui";
import type { Block_Grid } from "../../logic/parseDoc.ts";
import { BlockDisplay } from "../BlockDisplay.tsx";

interface BlockGridDisplayProps {
  block: Block_Grid;
}

const gridCellClassName = css({ position: "relative" });
const gridCellInnerClassName = css({
  position: "absolute",
  inset: 0,
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "1fr",
});

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
      {block.children.map((child, index) => (
        <Box key={index} classList={gridCellClassName}>
          <Box classList={gridCellInnerClassName}>
            <BlockDisplay block={child} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
