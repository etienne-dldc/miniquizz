import { Box, css } from "@dldc/hono-ui";
import type { InlineBlock_Link } from "../../logic/parseDoc.ts";
import { InlineBlockDisplay } from "./InlineBlockDisplay.tsx";

interface InlineBlockLinkDisplayProps {
  inlineBlock: InlineBlock_Link;
}

export function InlineBlockLinkDisplay({ inlineBlock }: InlineBlockLinkDisplayProps) {
  return (
    <Box
      render={<a href={inlineBlock.href} target={inlineBlock.openInNewTab ? "_blank" : undefined} />}
      classList={css({})}
    >
      {inlineBlock.inline.map((child, index) => <InlineBlockDisplay key={index} inlineBlock={child} />)}
    </Box>
  );
}
