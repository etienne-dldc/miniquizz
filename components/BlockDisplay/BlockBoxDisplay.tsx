import { Stack } from "@dldc/hono-ui";
import type { Block_Box } from "../../logic/parseDoc.ts";
import { BlockDisplay } from "../BlockDisplay.tsx";

interface BlockBoxDisplayProps {
  block: Block_Box;
}

export function BlockBoxDisplay({ block }: BlockBoxDisplayProps) {
  return (
    <Stack flexDirection="column" gap={4} alignItems="center" justifyContent="center">
      {block.children.map((child, index) => <BlockDisplay key={index} block={child} />)}
    </Stack>
  );
}
