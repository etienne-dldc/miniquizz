import { Box, css } from "@dldc/hono-ui";
import type { InlineBlock_Span } from "../../logic/parseDoc.ts";
import { InlineBlockDisplay } from "./InlineBlockDisplay.tsx";

interface InlineBlockSpanDisplayProps {
  inlineBlock: InlineBlock_Span;
}

export function InlineBlockSpanDisplay({ inlineBlock }: InlineBlockSpanDisplayProps) {
  return (
    <Box
      render="span"
      classList={css({
        fontWeight: inlineBlock.fontWeight,
        textDecoration: inlineBlock.textDecoration,
        fontFamily: inlineBlock.fontFamily,
      })}
    >
      {inlineBlock.inline.map((child, index) => <InlineBlockDisplay key={index} inlineBlock={child} />)}
    </Box>
  );
}
